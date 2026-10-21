(function () {
  'use strict';
  const menuBtn = document.getElementById('menuBtn');
  const mobileLinks = document.getElementById('mobileLinks');
  if (menuBtn && mobileLinks) {
    menuBtn.addEventListener('click', () => {
      const open = mobileLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? '×' : '☰';
    });
    mobileLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      mobileLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.textContent = '☰';
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && mobileLinks.classList.contains('open')) {
        mobileLinks.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.textContent = '☰';
        menuBtn.focus();
      }
    });
  }
  const interest = document.getElementById('contact-topic');
  const requestType = document.getElementById('contact-request-type');
  const message = document.getElementById('contact-message');
  document.querySelectorAll('[data-topic]').forEach(link => link.addEventListener('click', () => {
    if (interest) {
      const topic = link.dataset.topic || '';
      const option = Array.from(interest.options).find(item => item.value === topic || item.textContent.trim() === topic);
      if (option) interest.value = option.value;
      else if (/SSHE|HST|segurança/i.test(topic)) interest.value = 'SSHE / HST';
      else if (/ISO/i.test(topic)) interest.value = 'ISO Performance';
      else if (/compliance|risco/i.test(topic)) interest.value = 'Compliance e Gestão de Riscos';
      else if (/FP&A|analytics|finance/i.test(topic)) interest.value = 'FP&A e Intelligence Analytics';
      else if (/capacita|formação|programa/i.test(topic)) interest.value = 'Programas de capacitação';
      else if (/empresarial|gestão|organiza/i.test(topic)) interest.value = 'Soluções para organizações';
    }
  }));
  document.querySelectorAll('[data-course]').forEach(link => link.addEventListener('click', () => {
    if (requestType) requestType.value = 'Formação individual';
    if (interest) interest.value = 'Programas de capacitação';
    if (message) {
      const line = 'Formação de interesse: ' + (link.dataset.course || 'Programa à medida');
      const current = message.value.trim();
      if (!current.includes(line)) message.value = (current ? current + '\n\n' : '') + line;
    }
  }));
  document.querySelectorAll('[data-contact-path]').forEach(link => link.addEventListener('click', () => {
    if (requestType) requestType.value = link.dataset.contactPath === 'business' ? 'Pedido empresarial' : 'Formação individual';
  }));
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Hero text rotates while the background image stays fixed.
  const heroCopy = document.querySelector('.hero-copy');
  let heroTitle = document.getElementById('hero-title');
  let heroParagraph = heroCopy && heroCopy.querySelector(':scope > p');
  const heroFrames = [
    { title: 'Pessoas preparadas.<br><em>Organizações mais fortes.</em>', text: 'Capacitação prática e soluções de gestão para quem faz o trabalho acontecer em Moçambique.' },
    { title: 'Competências que<br><em>se traduzem em resultados.</em>', text: 'Desenvolva capacidades aplicáveis ao trabalho e fortaleça os processos da sua organização.' },
    { title: 'Conhecimento prático.<br><em>Melhor desempenho.</em>', text: 'Programas de capacitação e soluções especializadas para desafios reais de profissionais e equipas.' }
  ];
  let heroTimer = null;
  let heroIndex = 0;
  let heroObserver = null;
  function setupHeroRotation() {
    if (!heroCopy || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    heroTitle = heroCopy.querySelector('#hero-title');
    heroParagraph = heroCopy.querySelector(':scope > p');
    if (!heroTitle || !heroParagraph) return;
    if (heroTimer) window.clearInterval(heroTimer);
    heroIndex = 0;
    const startTimer = () => {
      if (heroTimer) window.clearInterval(heroTimer);
      heroTimer = window.setInterval(() => {
        if (!document.visibilityState || document.visibilityState === 'visible') {
          heroIndex = (heroIndex + 1) % heroFrames.length;
          heroCopy.classList.add('hero-copy-fade');
          window.setTimeout(() => {
            heroTitle.innerHTML = heroFrames[heroIndex].title;
            heroParagraph.textContent = heroFrames[heroIndex].text;
            heroCopy.classList.remove('hero-copy-fade');
            heroCopy.classList.remove('hero-copy-changing');
            void heroCopy.offsetWidth;
            heroCopy.classList.add('hero-copy-changing');
          }, 220);
        }
      }, 5200);
    };
    startTimer();
  }
  if (heroCopy && window.MutationObserver) {
    heroObserver = new MutationObserver(() => {
      const currentTitle = heroCopy.querySelector('#hero-title');
      const currentParagraph = heroCopy.querySelector(':scope > p');
      if (currentTitle && currentParagraph && (currentTitle !== heroTitle || currentParagraph !== heroParagraph)) {
        // WordPress can replace the hero content after initial page load; restart against the new nodes.
        setupHeroRotation();
      }
    });
    heroObserver.observe(heroCopy, { childList: true, subtree: true });
  }
  setupHeroRotation();

  const contactForm = document.getElementById('contact-form');
  if (contactForm) contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    const status = contactForm.querySelector('.form-status');
    const submit = contactForm.querySelector('button[type="submit"]');
    if (!contactForm.reportValidity()) return;
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());
    ['name', 'email', 'org', 'requestType', 'interest', 'message', 'website'].forEach(key => {
      data[key] = String(data[key] || '').trim();
    });
    if (!data.name || !data.email || !data.requestType || !data.interest) {
      if (status) status.textContent = 'Preencha os campos obrigatórios antes de enviar.';
      return;
    }
    if (status) status.textContent = 'A enviar o seu pedido…';
    if (submit) submit.disabled = true;
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Não foi possível enviar o pedido neste momento.');
      if (status) status.textContent = 'Pedido enviado com sucesso. A equipa ALINVEST recebeu o seu contacto.';
      contactForm.reset();
    } catch (error) {
      if (status) status.textContent = error.message || 'O envio falhou. Tente novamente ou contacte info@alinvest-group.com directamente.';
    } finally {
      if (submit) submit.disabled = false;
    }
  });
})();
