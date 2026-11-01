(function () {
  'use strict';
  const config = window.ALINVEST_CMS || {};
  const source = config.contentSource || {};
  const required = ['provider', 'areas', 'programas', 'apoio', 'noticias', 'cursos'];
  function validModel(value) {
    return value && typeof value === 'object' && required.every(key => Object.prototype.hasOwnProperty.call(value, key)) &&
      value.areas && typeof value.areas === 'object' &&
      value.programas && typeof value.programas === 'object' &&
      value.apoio && typeof value.apoio === 'object' &&
      Array.isArray(value.noticias) && Array.isArray(value.cursos);
  }
  window.ALINVEST_CONTENT_READY = (async function () {
    if (source.provider !== 'json' || !source.endpoint) return window.SERVICE_CONTENT;
    try {
      const endpoint = new URL(source.endpoint, window.location.origin);
      if (endpoint.protocol !== 'https:' && endpoint.origin !== window.location.origin) {
        throw new Error('A fonte externa de conteúdos deve utilizar HTTPS.');
      }
      const response = await fetch(endpoint.href, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: endpoint.origin === window.location.origin ? 'same-origin' : 'omit',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Fonte de conteúdos indisponível: ' + response.status);
      const payload = await response.json();
      const model = payload && payload.data ? payload.data : payload;
      if (!validModel(model)) throw new Error('A fonte de conteúdos não respeita o contrato ALINVEST.');
      window.SERVICE_CONTENT = model;
      window.dispatchEvent(new CustomEvent('alinvest:content-updated'));
      return model;
    } catch (error) {
      console.warn('A ALINVEST manteve os conteúdos locais porque a fonte externa não pôde ser utilizada.', error);
      return window.SERVICE_CONTENT;
    }
  })();
})();
