/* =========================================================
   Comportamento compartilhado das 6 páginas.
   Preencha CONFIG com os dados reais do estúdio.
   ========================================================= */
(() => {
  'use strict';

  const CONFIG = {
    nome: '[NOME DA ESTÉTICA]',
    // Só números, com DDI e DDD. Ex.: 5511999999999.
    // Enquanto estiver vazio/placeholder, o link abre o WhatsApp para escolher o contato.
    whatsapp: '[WHATSAPP COM DDI]',
  };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- WhatsApp ---------- */
  const waUrl = (text) => {
    const num = String(CONFIG.whatsapp).replace(/\D/g, '');
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  };
  const waText = (phrase) => `Olá, ${CONFIG.nome}! Vim pelo site e gostaria de agendar ${phrase}.`;

  const setWa = (a, phrase) => {
    a.href = waUrl(waText(phrase));
    a.target = '_blank';
    a.rel = 'noopener';
  };
  $$('[data-wa]').forEach((a) => setWa(a, a.dataset.wa));

  /* ---------- menu ativo ---------- */
  const page = document.body.dataset.page;
  $$('[data-nav]').forEach((a) => {
    if (a.dataset.nav === page) a.setAttribute('aria-current', 'page');
  });

  /* ---------- header sólido ao rolar ---------- */
  const header = $('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- menu mobile em tela cheia ---------- */
  const menuBtn = $('.menu-btn');
  const menu = $('#menu-mobile');
  if (menuBtn && menu) {
    const closeBtn = $('.menu-close', menu);
    const open = () => {
      menu.hidden = false;
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      const first = $('a, button', menu);
      if (first) first.focus();
    };
    const close = (returnFocus = true) => {
      menu.hidden = true;
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      if (returnFocus) menuBtn.focus();
    };
    menuBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', () => close());
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const f = $$('a[href], button', menu);
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    $$('a', menu).forEach((a) => a.addEventListener('click', () => close(false)));
    window.matchMedia('(min-width: 1080px)').addEventListener('change', (m) => { if (m.matches && !menu.hidden) close(false); });
  }

  /* ---------- fotos: aparecem sozinhas quando o arquivo existir ---------- */
  $$('.ph img').forEach((img) => {
    const fig = img.closest('.ph');
    const ok = () => { if (img.naturalWidth > 0) fig.classList.add('is-loaded'); };
    const bad = () => { img.hidden = true; };
    if (img.complete) { img.naturalWidth > 0 ? ok() : bad(); }
    else {
      img.addEventListener('load', ok, { once: true });
      img.addEventListener('error', bad, { once: true });
    }
  });

  /* ---------- revelação suave ---------- */
  const rv = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach((el) => io.observe(el));
  }

  /* ---------- antes / depois ---------- */
  $$('.ba').forEach((ba) => {
    const r = $('.ba-range', ba);
    if (!r) return;
    const set = () => {
      ba.style.setProperty('--pos', `${r.value}%`);
      r.setAttribute('aria-valuetext', `${r.value}% mostrando o depois`);
    };
    r.addEventListener('input', set);
    set();
  });

  /* ---------- seletor de porte (pacotes) ---------- */
  const sizeRadios = $$('input[name="porte"]');
  if (sizeRadios.length) {
    const labels = { hatch: 'Hatch/Sedã', suv: 'SUV', picape: 'Picape' };
    const apply = () => {
      const cur = (sizeRadios.find((r) => r.checked) || sizeRadios[0]).value;
      $$('[data-price]').forEach((el) => { el.textContent = el.dataset[cur]; });
      $$('[data-porte-label]').forEach((el) => { el.textContent = labels[cur]; });
      $$('[data-wa-pkg]').forEach((a) => setWa(a, `uma avaliação para o pacote ${a.dataset.waPkg} (porte: ${labels[cur]})`));
    };
    sizeRadios.forEach((r) => r.addEventListener('change', apply));
    apply();
  }

  /* ---------- abas (FAQ) ---------- */
  $$('[role="tablist"]').forEach((list) => {
    const tabs = $$('[role="tab"]', list);
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    };
    select(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0], false);
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t, false));
      t.addEventListener('keydown', (e) => {
        let n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  });

  /* ---------- acordeões ---------- */
  $$('.acc-btn').forEach((btn) => {
    const p0 = document.getElementById(btn.getAttribute('aria-controls'));
    if (p0) p0.hidden = btn.getAttribute('aria-expanded') !== 'true';
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel) panel.hidden = open;
    });
  });

  /* ---------- subnavegação de serviços ---------- */
  const subLinks = $$('.subnav a[href^="#"]');
  if (subLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(subLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        subLinks.forEach((a) => a.removeAttribute('aria-current'));
        const a = map.get(en.target.id);
        if (a) {
          a.setAttribute('aria-current', 'true');
          a.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) sio.observe(s); });
  }

  /* ---------- galeria: filtros ---------- */
  const filters = $$('.filters button');
  const items = $$('.g-item');
  const live = $('#galeria-status');
  if (filters.length) {
    filters.forEach((b) => b.addEventListener('click', () => {
      const f = b.dataset.filter;
      filters.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      let n = 0;
      items.forEach((it) => {
        const show = f === 'todos' || it.dataset.cat === f;
        it.hidden = !show;
        if (show) n += 1;
      });
      if (live) live.textContent = `${n} fotos exibidas`;
    }));
  }

  /* ---------- galeria: lightbox ---------- */
  const lb = $('#lightbox');
  if (lb && items.length && typeof lb.showModal === 'function') {
    const stage = $('.lb-stage', lb);
    const cap = $('.lb-cap', lb);
    const count = $('.lb-count', lb);
    let list = [];
    let idx = 0;
    let opener = null;

    const render = () => {
      const it = list[idx];
      const fig = $('.ph', it).cloneNode(true);
      const img = $('img', fig);
      if (img) {
        img.loading = 'eager';
        const w = Number(img.getAttribute('width')) || 4;
        const h = Number(img.getAttribute('height')) || 3;
        fig.style.setProperty('--arn', (w / h).toFixed(4));
      }
      stage.replaceChildren(fig);
      cap.textContent = it.dataset.caption || '';
      count.textContent = `${idx + 1} de ${list.length}`;
    };
    const go = (d) => { idx = (idx + d + list.length) % list.length; render(); };

    items.forEach((it) => it.addEventListener('click', () => {
      list = items.filter((x) => !x.hidden);
      idx = list.indexOf(it);
      opener = it;
      render();
      lb.showModal();
      $('.lb-close', lb).focus();
    }));
    $('.lb-prev', lb).addEventListener('click', () => go(-1));
    $('.lb-next', lb).addEventListener('click', () => go(1));
    $('.lb-close', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    });
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target === stage) lb.close(); });
    lb.addEventListener('close', () => { if (opener) opener.focus(); });

    let x0 = null;
    stage.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      x0 = null;
    });
  }

  /* ---------- formulário de contato → WhatsApp ---------- */
  const form = $('#form-contato');
  if (form) {
    const params = new URLSearchParams(location.search);
    const pre = params.get('servico');
    const sel = $('#f-servico');
    if (pre && sel) {
      const opt = Array.from(sel.options).find((o) => o.value === pre || o.dataset.slug === pre);
      if (opt) sel.value = opt.value;
    }
    const status = $('.form-status', form);

    const check = (input, msg) => {
      const err = document.getElementById(`${input.id}-err`);
      const bad = !input.value.trim();
      input.setAttribute('aria-invalid', String(bad));
      if (err) err.textContent = bad ? msg : '';
      return !bad;
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = $('#f-nome');
      const carro = $('#f-carro');
      const okNome = check(nome, 'Informe seu nome para o estúdio saber com quem fala.');
      const okCarro = check(carro, 'Informe o modelo e o ano do carro.');
      if (!okNome || !okCarro) { (okNome ? carro : nome).focus(); return; }

      const servico = sel.value || 'Ainda não sei, quero uma avaliação';
      const horario = $('#f-horario').value.trim() || 'Qualquer horário';
      const msg = [
        `Olá, ${CONFIG.nome}! Vim pelo site e gostaria de agendar uma avaliação.`,
        '',
        `Nome: ${nome.value.trim()}`,
        `Carro/ano: ${carro.value.trim()}`,
        `Serviço de interesse: ${servico}`,
        `Melhor horário: ${horario}`,
      ].join('\n');

      const url = waUrl(msg);
      const win = window.open(url, '_blank');
      if (win) win.opener = null;
      status.innerHTML = '';
      const p = document.createElement('span');
      p.textContent = win ? 'Abrimos o WhatsApp com sua mensagem pronta. ' : 'O navegador bloqueou a nova aba. ';
      const a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'Abrir o WhatsApp de novo';
      status.append(p, a);
    });
  }

  /* ---------- ano no rodapé ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
