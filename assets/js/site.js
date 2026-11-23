(function () {
  'use strict';

  // Reliable refresh-position persistence. Restore after dynamic content and media settle.
  (function preserveRefreshPosition(){
    if (window.__alinvestRefreshPosition) return;
    window.__alinvestRefreshPosition = true;
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (_) {}
    const key = 'alinvest-scroll-v2:' + location.pathname + location.search;
    let frame = 0;
    const save = () => {
      try { sessionStorage.setItem(key, JSON.stringify({x:window.scrollX||0,y:window.scrollY||0,at:Date.now()})); } catch (_) {}
    };
    window.addEventListener('scroll', () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; save(); });
    }, {passive:true});
    window.addEventListener('pagehide', save);
    window.addEventListener('beforeunload', save);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
    const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    if (!nav || nav.type !== 'reload') return;
    let saved;
    try { saved = JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (_) {}
    if (!saved || !Number.isFinite(saved.y) || Date.now() - (saved.at || 0) > 30*60*1000) return;
    let stopped = false, attempts = 0, observer = null, interval = null;
    const stop = () => {
      if (stopped) return;
      stopped = true;
      if (observer) observer.disconnect();
      if (interval) clearInterval(interval);
    };
    const cancelByUser = () => stop();
    ['wheel','touchstart','pointerdown','keydown'].forEach(type => window.addEventListener(type,cancelByUser,{passive:true,once:true}));
    const restore = () => {
      if (stopped) return;
      attempts++;
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const targetY = Math.min(saved.y, maxY);
      window.scrollTo(saved.x || 0, targetY);
      if (Math.abs((window.scrollY || 0) - saved.y) < 3 || attempts >= 100) stop();
    };
    const start = () => {
      if (stopped || interval) return;
      restore();
      interval = setInterval(restore,100);
      if ('ResizeObserver' in window) {
        observer = new ResizeObserver(restore);
        observer.observe(document.documentElement);
        if (document.body) observer.observe(document.body);
      }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(restore).catch(()=>{});
      window.addEventListener('load',restore,{once:true});
      setTimeout(stop,10000);
    };
    window.addEventListener('pageshow',start,{once:true});
    if (document.readyState === 'complete') start();
  })();

  const menuBtn = document.getElementById('menuBtn');
  const mobileLinks = document.getElementById('mobileLinks');
  if (menuBtn && mobileLinks) {
    menuBtn.addEventListener('click', () => {
      const open = mobileLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
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
        menuBtn.setAttribute('aria-label', 'Abrir menu');
        menuBtn.textContent = '☰';
        menuBtn.focus();
      }
    });
  }
  const interest = document.getElementById('contact-topic');
  const requestType = document.getElementById('contact-request-type');
  const message = document.getElementById('contact-message');
  const intakeParams = new URLSearchParams(window.location.search);
  const storedIntake = (() => { try { const v=sessionStorage.getItem('alinvest-intake'); if(!v)return null; sessionStorage.removeItem('alinvest-intake'); return JSON.parse(v); } catch (_) { return null; } })();
  const intakeType = intakeParams.get('pedido') || (storedIntake && storedIntake.pedido);
  if (['individual', 'empresarial', 'organizacao'].includes(intakeType)) {
    const individual = intakeType === 'individual';
    const businessTraining = intakeType === 'empresarial';
    const area = intakeParams.get('area') || (storedIntake && storedIntake.area) || (intakeType === 'organizacao' ? 'Soluções para organizações' : 'Programas de capacitação');
    const topic = intakeParams.get('tema') || (storedIntake && storedIntake.tema) || '';
    const origin = intakeParams.get('origem') || (storedIntake && storedIntake.origem) || (individual ? 'Capacitação individual' : businessTraining ? 'Capacitação empresarial' : 'Soluções para organizações');
    if (requestType) requestType.value = individual ? 'Formação individual' : 'Pedido empresarial';
    if (interest) {
      const option = Array.from(interest.options).find(item => item.value === area || item.textContent.trim() === area);
      if (option) interest.value = option.value;
    }
    if (message) {
      const opening = individual ? 'Gostaria de receber orientação sobre uma capacitação individual.' : businessTraining ? 'A nossa organização pretende capacitar a equipa e gostaria de receber orientação sobre uma proposta.' : 'Gostaria de conversar sobre uma solução para a nossa organização.';
      message.value = [opening, topic ? 'Área ou tema de interesse: ' + topic : '', 'Página de origem: ' + origin].filter(Boolean).join('\n\n');
    }
  }
  document.addEventListener('click', event => { const a=event.target.closest('[data-intake]'); if(!a)return; try{sessionStorage.setItem('alinvest-intake',JSON.stringify({pedido:a.dataset.intake,area:a.dataset.intakeArea||'',tema:a.dataset.intakeTopic||'',origem:a.dataset.intakeOrigin||''}));}catch(_){} });
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

  // Hero slideshow with static fallback imagery.
  const hero = document.querySelector('.hero');
  const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
  const heroCopy = document.querySelector('.hero-copy');
  let heroTitle = document.getElementById('hero-title');
  let heroParagraph = heroCopy && heroCopy.querySelector(':scope > p');
  const fallbackSlides = [
    'https://images.pexels.com/photos/30678211/pexels-photo-30678211.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/30689114/pexels-photo-30689114.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/6694486/pexels-photo-6694486.jpeg?auto=compress&cs=tinysrgb&w=1920'
  ];
  const heroFrames = [
    { title: 'Pessoas preparadas.<br><em>Organizações mais fortes.</em>', text: 'Capacitação prática e soluções de gestão para quem faz o trabalho acontecer em Moçambique.' },
    { title: 'Competências que<br><em>se traduzem em resultados.</em>', text: 'Desenvolva capacidades aplicáveis ao trabalho e fortaleça os processos da sua organização.' },
    { title: 'Conhecimento prático.<br><em>Melhor desempenho.</em>', text: 'Programas de capacitação e soluções especializadas para desafios reais de profissionais e equipas.' }
  ];
  let heroIndex = 0;
  let heroTimer = null;
  let copyTimer = null;
  // Use the homepage's approved fallback slide images.
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

  let formStartedAt = Date.now();
  const contactForm = document.getElementById('contact-form');
  if (contactForm) contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    const status = contactForm.querySelector('.form-status');
    const submit = contactForm.querySelector('button[type="submit"]');
    if (!contactForm.reportValidity()) return;
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());
    data.formStartedAt = String(formStartedAt);
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
      formStartedAt = Date.now();
    } catch (error) {
      if (status) status.textContent = error.message || 'O envio falhou. Tente novamente ou contacte info@alinvest-group.com directamente.';
    } finally {
      if (submit) submit.disabled = false;
    }
  });
})();
