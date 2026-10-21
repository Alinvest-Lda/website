(function () {
  'use strict';
  const config = window.ALINVEST_CMS || {};
  const base = String(config.apiBase || '').trim().replace(/\/$/, '');
  if (!base) return;
  const api = base + '/wp-json/wp/v2/';
  const escapeHtml = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const safeHtml = value => String(value || '').replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  const textOnly = value => {
    const node = document.createElement('div');
    node.innerHTML = value || '';
    return (node.textContent || '').trim();
  };
  async function get(path) {
    const response = await fetch(api + path, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('WordPress API: ' + response.status);
    return response.json();
  }
  async function hydratePages() {
    await Promise.all((config.pageSlugs || []).map(async slug => {
      const target = document.querySelector('[data-cms-page="' + CSS.escape(slug) + '"]');
      if (!target) return;
      try {
        const pages = await get('pages?slug=' + encodeURIComponent(slug) + '&_fields=slug,content,modified,status');
        const page = pages && pages[0];
        if (page && page.status === 'publish' && page.content && page.content.rendered) {
          target.innerHTML = safeHtml(page.content.rendered);
          target.dataset.cmsLoaded = 'true';
        }
      } catch (error) {
        console.warn('A área WordPress ' + slug + ' manteve o conteúdo de reserva.', error);
      }
    }));
  }
  function card(post, index) {
    const title = textOnly(post.title && post.title.rendered) || 'Publicação ALINVEST';
    const excerpt = textOnly(post.excerpt && post.excerpt.rendered).replace(/\s+/g, ' ').slice(0, 190);
    const linkValue = String(post.link || '#actualizacoes');
    const link = /^https?:\/\//i.test(linkValue) ? linkValue : '#actualizacoes';
    const date = post.date ? new Date(post.date).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' }) : 'ALINVEST';
    const categories = post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0] || [];
    const category = categories[0] && categories[0].name || 'ALINVEST · ACTUALIZAÇÕES';
    const imageValue = post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0] && post._embedded['wp:featuredmedia'][0].source_url;
    const image = imageValue && /^https?:\/\//i.test(imageValue) ? imageValue : '';
    const visual = image
      ? '<div class="update-card-visual update-visual-management"><img src="' + escapeHtml(image) + '" alt="" loading="lazy"><span>' + escapeHtml(category) + '</span></div>'
      : '<div class="update-card-visual update-visual-management" aria-hidden="true"><span>' + escapeHtml(category) + '</span><b>' + String(index + 1).padStart(2, '0') + '</b></div>';
    return '<article class="update-card">' + visual +
      '<div class="update-card-body"><span class="update-category">' + escapeHtml(category) + ' · ' + escapeHtml(date) +
      '</span><h3><a href="' + escapeHtml(link) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(title) +
      '</a></h3><p>' + escapeHtml(excerpt) + '</p><a class="update-coming" href="' + escapeHtml(link) +
      '" target="_blank" rel="noopener noreferrer">Ler publicação ↗</a></div></article>';
  }
  async function hydratePosts() {
    const grid = document.querySelector('[data-wordpress-posts]');
    if (!grid) return;
    try {
      const count = Math.min(12, Math.max(1, Number(config.postsPerPage) || 8));
      const posts = await get('posts?per_page=' + count + '&_embed=1&status=publish&_fields=id,date,link,title,excerpt,_embedded');
      if (!Array.isArray(posts) || !posts.length) return;
      grid.innerHTML = posts.map(card).join('');
      grid.dataset.cmsLoaded = 'true';
    } catch (error) {
      console.warn('O blog manteve os conteúdos de reserva porque o WordPress não respondeu.', error);
    }
  }
  function start() { hydratePages(); hydratePosts(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
