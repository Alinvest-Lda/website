(function () {
  'use strict';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const formatDate = value => {
    if (!value) return '';
    const date = new Date(value + 'T12:00:00');
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-MZ', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };
  function renderNews() {
    const model = window.SERVICE_CONTENT;
    if (!model || !Array.isArray(model.noticias)) return;
    document.querySelectorAll('[data-content-collection="noticias"]').forEach(grid => {
      if (!model.noticias.length) return;
      grid.innerHTML = model.noticias.slice(0, 4).map((article, index) =>
        '<article class="update-card ' + (index === 0 ? 'update-card-featured' : '') + '">' +
          '<div class="update-card-visual update-visual-management">' +
            (article.image ? '<img src="' + esc(article.image) + '" alt="" loading="lazy" decoding="async">' : '') +
            '<span>' + esc(article.category) + '</span><b>' + String(index + 1).padStart(2, '0') + '</b>' +
          '</div><div class="update-card-body">' +
            '<span class="update-category">' + esc(article.category) + ' · ' + esc(formatDate(article.date)) + '</span>' +
            '<h3><a href="noticia.html?slug=' + encodeURIComponent(article.slug) + '">' + esc(article.title) + '</a></h3>' +
            '<p>' + esc(article.excerpt) + '</p>' +
            '<a class="update-coming" href="noticia.html?slug=' + encodeURIComponent(article.slug) + '">Ler publicação ↗</a>' +
          '</div></article>'
      ).join('');
    });
  }
  window.addEventListener('alinvest:content-updated', renderNews);
  renderNews();
})();
