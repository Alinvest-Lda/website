const recentRequests = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_BODY_BYTES = 12 * 1024;

async function isRateLimited(ip) {
  const now = Date.now();
  const current = recentRequests.get(ip) || [];
  const recent = current.filter(ts => now - ts < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return true;
  recent.push(now);
  recentRequests.set(ip, recent);
  if (recentRequests.size > 2000) {
    for (const [key, values] of recentRequests) {
      if (!values.some(ts => now - ts < WINDOW_MS)) recentRequests.delete(key);
    }
  }

  // Shared rate limiting is enabled when Upstash credentials are configured.
  // The in-memory fallback is per serverless instance, not globally persistent.
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && redisToken) {
    try {
      const key = 'alinvest:contact:' + ip.replace(/[^a-zA-Z0-9:._-]/g, '_');
      const response = await fetch(redisUrl.replace(/\/$/, '') + '/pipeline', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + redisToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([['INCR', key], ['EXPIRE', key, 900]])
      });
      if (response.ok) {
        const result = await response.json();
        const count = Number(result?.[0]?.result || 0);
        if (count > MAX_REQUESTS) return true;
      }
    } catch (_) {
      // Keep local throttling active if Redis is temporarily unavailable.
    }
  }
  return false;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return res.status(403).json({ error: 'Origem do pedido inválida.' });
      }
    } catch {
      return res.status(403).json({ error: 'Origem do pedido inválida.' });
    }
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Pedido inválido.' });
    }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Pedido inválido.' });
  }
  if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'O pedido excede o tamanho permitido.' });
  }

  // Honeypot: return a neutral success response without sending email.
  if (String(body.website || '').trim()) {
    return res.status(200).json({ ok: true });
  }

  const started = Number(body.formStartedAt || 0);
  const elapsed = Date.now() - started;
  if (!Number.isFinite(started) || started <= 0 || elapsed < 2500 || elapsed > 24 * 60 * 60 * 1000) {
    return res.status(400).json({ error: 'Não foi possível validar o envio. Actualize a página e tente novamente.' });
  }

  // On Vercel, use the platform-provided client IP header; do not trust the
  // first user-controlled x-forwarded-for value for rate-limit identity.
  const ip = String(req.headers['x-real-ip'] || 'unknown').trim().slice(0, 128);
  if (await isRateLimited(ip)) {
    return res.status(429).json({ error: 'Foram recebidos demasiados pedidos deste acesso. Aguarde alguns minutos antes de tentar novamente.' });
  }

  const { RESEND_API_KEY, RESEND_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    return res.status(503).json({ error: 'O envio directo ainda não está activado. Contacte info@alinvest-group.com por email.' });
  }

  const fields = {
    name: String(body.name || '').trim(),
    requestType: String(body.requestType || '').trim(),
    org: String(body.org || '').trim(),
    email: String(body.email || '').trim(),
    interest: String(body.interest || '').trim(),
    message: String(body.message || '').trim()
  };
  const max = { name: 120, requestType: 80, org: 160, email: 254, interest: 120, message: 3000 };

  for (const [key, value] of Object.entries(fields)) {
    if (value.length > max[key]) {
      return res.status(400).json({ error: 'Um ou mais campos excedem o limite permitido.' });
    }
  }
  if (!fields.name || !fields.requestType || !fields.email || !fields.interest || !fields.message) {
    return res.status(400).json({ error: 'Preencha os campos obrigatórios.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return res.status(400).json({ error: 'Introduza um endereço de email válido.' });
  }
  if (!['Formação individual', 'Pedido empresarial'].includes(fields.requestType)) {
    return res.status(400).json({ error: 'Tipo de pedido inválido.' });
  }
  if (/(https?:\/\/|www\.)/i.test(fields.message) && (fields.message.match(/https?:\/\/|www\./gi) || []).length > 2) {
    return res.status(400).json({ error: 'A mensagem contém demasiadas ligações.' });
  }

  const text = [
    'Novo pedido recebido pelo website ALINVEST',
    '',
    'Tipo de pedido: ' + fields.requestType,
    'Nome: ' + fields.name,
    'Organização: ' + (fields.org || 'Não indicada'),
    'Email de resposta: ' + fields.email,
    'Área de interesse: ' + fields.interest,
    '',
    'Mensagem:',
    fields.message
  ].join('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: ['info@alinvest-group.com'],
        reply_to: fields.email,
        subject: fields.requestType + ' — ALINVEST | ' + fields.interest,
        text
      })
    });
    if (!response.ok) {
      return res.status(502).json({ error: 'Não foi possível entregar o pedido por email. Tente novamente ou escreva para info@alinvest-group.com.' });
    }
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ error: 'O serviço de email está temporariamente indisponível. Tente novamente mais tarde.' });
  }
}
