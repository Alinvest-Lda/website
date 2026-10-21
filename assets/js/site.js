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

  // Hero slideshow. WordPress page "home-hero-slides" can replace these three fallback images.
  const hero = document.querySelector('.hero');
  const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
  const heroCopy = document.querySelector('.hero-copy');
  let heroTitle = document.getElementById('hero-title');
  let heroParagraph = heroCopy && heroCopy.querySelector(':scope > p');
  const fallbackSlides = [
    'https://pikwizard.com/pw/medium/eb9a89ae1cc52cecbe9a5fd75a9d387f.jpg',
    'https://pikwizard.com/pw/medium/644abbf9cf192b6f15eeece08ce19076.jpg',
    'https://pikwizard.com/pw/medium/d015bb487ab58d6afe32f8be7013f290.jpg'
  ];
  const heroFrames = [
    { title: 'Pessoas preparadas.<br><em>Organizações mais fortes.</em>', text: 'Capacitação prática e soluções de gestão para quem faz o trabalho acontecer em Moçambique.' },
    { title: 'Competências que<br><em>se traduzem em resultados.</em>', text: 'Desenvolva capacidades aplicáveis ao trabalho e fortaleça os processos da sua organização.' },
    { title: 'Conhecimento prático.<br><em>Melhor desempenho.</em>', text: 'Programas de capacitação e soluções especializadas para desafios reais de profissionais e equipas.' }
  ];
  let heroIndex = 0;
  let heroTimer = null;
  let copyTimer = null;
  function setHeroSlides(images) {
    if (!Array.isArray(images) || !images.length || !hero) return;
    const safe = images.filter(src => typeof src === 'string' && (src.startsWith('https://') || src.startsWith('http://'))).slice(0, 3);
    if (!safe.length) return;
    safe.forEach((src, i) => {
      let slide = heroSlides[i];
      if (!slide) {
        slide = document.createElement('span');
        slide.className = 'hero-slide';
        slide.dataset.slide = String(i);
        hero.querySelector('.hero-backdrop').appendChild(slide);
        heroSlides.push(slide);
      }
      slide.style.backgroundImage = 'url("' + src.replace(/["\\]/g, '') + '")';
    });
  }
  window.ALINVEST_SET_HERO_SLIDES = setHeroSlides;
  setHeroSlides(fallbackSlides);
  function rotateHero() {
    if (!heroSlides.length || !heroCopy || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    heroTimer = window.setInterval(() => {
      if (document.visibilityState && document.visibilityState !== 'visible') return;
      const current = heroSlides[heroIndex % heroSlides.length];
      heroIndex = (heroIndex + 1) % Math.min(heroSlides.length, 3);
      const next = heroSlides[heroIndex];
      if (current) current.classList.remove('is-active');
      if (next) next.classList.add('is-active');
      if (!heroTitle || !heroParagraph || !heroFrames[heroIndex]) return;
      heroCopy.classList.add('hero-copy-fade');
      if (copyTimer) window.clearTimeout(copyTimer);
      copyTimer = window.setTimeout(() => {
        heroTitle.innerHTML = heroFrames[heroIndex].title;
        heroParagraph.textContent = heroFrames[heroIndex].text;
        heroCopy.classList.remove('hero-copy-fade');
      }, 320);
    }, 6500);
  }
  rotateHero();

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
