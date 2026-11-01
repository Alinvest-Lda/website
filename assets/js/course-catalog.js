(async function () {
  'use strict';
  await (window.ALINVEST_CONTENT_READY || Promise.resolve());
  const model = window.SERVICE_CONTENT || {};
  const courses = Array.isArray(model.cursos) ? model.cursos : [];
  const search = document.getElementById('course-search');
  const category = document.getElementById('course-category');
  const grid = document.getElementById('course-grid');
  const results = document.getElementById('catalog-results');
  const empty = document.getElementById('catalog-empty');
  const total = document.getElementById('catalog-total');
  const clear = document.getElementById('clear-filters');
  if (!search || !category || !grid) return;
  const escapeHtml = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const whatsapp = model.provider && model.provider.whatsapp || 'https://wa.me/258851658131';
  function render() {
    const term = search.value.trim().toLocaleLowerCase('pt-MZ');
    const selected = category.value;
    const visible = courses.filter(course => {
      const text = [course.title, course.category, course.description].join(' ').toLocaleLowerCase('pt-MZ');
      return (!term || text.includes(term)) && (!selected || course.category === selected);
    });
    total.textContent = String(courses.length);
    results.textContent = visible.length + (visible.length === 1 ? ' programa encontrado' : ' programas encontrados');
    grid.innerHTML = visible.map(course => {
      const message = encodeURIComponent('Olá, ALINVEST. Gostaria de obter informações sobre o programa: ' + course.title + '.');
      return '<article class="catalog-card"><div class="catalog-card-top"><span>' + escapeHtml(course.category) + '</span><b>CAPACITAÇÃO</b></div><h3>' + escapeHtml(course.title) + '</h3><p>' + escapeHtml(course.description) + '</p><a href="' + escapeHtml(whatsapp) + '?text=' + message + '" target="_blank" rel="noopener noreferrer">Solicitar informações <span aria-hidden="true">↗</span></a></article>';
    }).join('');
    empty.hidden = visible.length !== 0;
    grid.hidden = visible.length === 0;
  }
  search.addEventListener('input', render);
  category.addEventListener('change', render);
  if (clear) clear.addEventListener('click', () => { search.value = ''; category.value = ''; render(); search.focus(); });
  render();
})();
