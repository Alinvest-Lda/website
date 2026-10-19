export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Método não permitido.' }); }
  const origin=req.headers.origin,host=req.headers.host;
  if(origin&&host){try{if(new URL(origin).host!==host)return res.status(403).json({error:'Origem do pedido inválida.'});}catch{return res.status(403).json({error:'Origem do pedido inválida.'});}}
  const {RESEND_API_KEY,RESEND_FROM_EMAIL}=process.env;
  if(!RESEND_API_KEY||!RESEND_FROM_EMAIL)return res.status(503).json({error:'O envio directo ainda não está activado. Contacte info@alinvest-group.com por email.'});
  let body=req.body;
  if(typeof body==='string'){try{body=JSON.parse(body);}catch{return res.status(400).json({error:'Pedido inválido.'});}}
  if(!body||typeof body!=='object'||Array.isArray(body))return res.status(400).json({error:'Pedido inválido.'});
  if(String(body.website||'').trim())return res.status(200).json({ok:true});
  const fields={name:String(body.name||'').trim(),requestType:String(body.requestType||'').trim(),org:String(body.org||'').trim(),email:String(body.email||'').trim(),interest:String(body.interest||'').trim(),message:String(body.message||'').trim()};
  const max={name:120,requestType:80,org:160,email:254,interest:120,message:3000};
  for(const [key,value] of Object.entries(fields))if(value.length>max[key])return res.status(400).json({error:'Um ou mais campos excedem o limite permitido.'});
  if(!fields.name||!fields.requestType||!fields.email||!fields.interest)return res.status(400).json({error:'Preencha os campos obrigatórios.'});
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))return res.status(400).json({error:'Introduza um endereço de email válido.'});
  if(!['Formação individual','Pedido empresarial'].includes(fields.requestType))return res.status(400).json({error:'Tipo de pedido inválido.'});
  const text=['Novo pedido recebido pelo website ALINVEST','', 'Tipo de pedido: '+fields.requestType,'Nome: '+fields.name,'Organização: '+(fields.org||'Não indicada'),'Email de resposta: '+fields.email,'Área de interesse: '+fields.interest,'','Mensagem:',fields.message||'Sem mensagem adicional'].join('\n');
  try{
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:RESEND_FROM_EMAIL,to:['info@alinvest-group.com'],reply_to:fields.email,subject:fields.requestType+' — ALINVEST | '+fields.interest,text})});
    if(!response.ok)return res.status(502).json({error:'Não foi possível entregar o pedido por email. Tente novamente ou escreva para info@alinvest-group.com.'});
    return res.status(200).json({ok:true});
  }catch{return res.status(502).json({error:'O serviço de email está temporariamente indisponível. Tente novamente mais tarde.'});}
}
