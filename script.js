/* Underground Frequency · criticalbass.com
   Landing page interactions */

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Starfield ---------- */
  const canvas = document.getElementById('starfield');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let stars = [];
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.floor((w * h) / 9000);
      stars = Array.from({ length: Math.min(target, 260) }, () => makeStar());
    };

    const makeStar = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.2,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      tw: Math.random() * Math.PI * 2,
      twS: 0.015 + Math.random() * 0.03,
      hue: Math.random() < 0.3 ? 'm' : (Math.random() < 0.5 ? 'c' : 'w')
    });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        s.tw += s.twS;
        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h;
        if (s.y > h) s.y = 0;
        const alpha = 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(s.tw));
        let color;
        if (s.hue === 'c') color = `rgba(0, 255, 255, ${alpha})`;
        else if (s.hue === 'm') color = `rgba(255, 0, 180, ${alpha * 0.8})`;
        else color = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();
  } else if (canvas) {
    canvas.style.display = 'none';
  }

  /* ---------- Nav scroll state + scroll progress ---------- */
  const nav = document.getElementById('nav');
  const progress = document.getElementById('scroll-progress');
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = max > 0 ? (y / max * 100) + '%' : '0%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const delay = Math.min(i * 60, 300);
          e.target.style.setProperty('--reveal-delay', `${delay}ms`);
          e.target.classList.add('revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('revealed'));
  }

  /* ---------- Work filter ---------- */
  const filterButtons = document.querySelectorAll('.filter');
  const tiles = document.querySelectorAll('.tile');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      tiles.forEach(t => {
        const match = cat === 'all' || t.getAttribute('data-cat') === cat;
        t.classList.toggle('hidden', !match);
      });
    });
  });

  /* ---------- Case study overlay ---------- */
  const overlay = document.getElementById('case-overlay');
  const overlayContent = document.getElementById('case-overlay-content');
  const overlayClose = document.getElementById('case-overlay-close');
  const overlayPrev = document.getElementById('case-overlay-prev');
  const overlayNext = document.getElementById('case-overlay-next');
  const overlayScroll = document.getElementById('case-overlay-scroll');
  const caseData = document.getElementById('case-data');

  if (overlay && overlayContent && caseData) {
    const caseOrder = Array.from(caseData.querySelectorAll('.case-source'))
      .map(el => el.getAttribute('data-case-id'));
    let currentIdx = -1;
    let lastFocused = null;

    const renderCase = (idx) => {
      if (idx < 0 || idx >= caseOrder.length) return;
      const id = caseOrder[idx];
      const source = caseData.querySelector(`.case-source[data-case-id="${id}"]`);
      if (!source) return;
      overlayContent.innerHTML = source.innerHTML;
      if (overlayScroll) overlayScroll.scrollTop = 0;
      currentIdx = idx;
    };

    const openCase = (id, triggerEl) => {
      const idx = caseOrder.indexOf(id);
      if (idx < 0) return;
      lastFocused = triggerEl || document.activeElement;
      renderCase(idx);
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => overlayClose && overlayClose.focus(), 60);
    };

    const closeCase = () => {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      currentIdx = -1;
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    };

    const stepCase = (delta) => {
      if (currentIdx < 0) return;
      const next = (currentIdx + delta + caseOrder.length) % caseOrder.length;
      renderCase(next);
    };

    tiles.forEach(tile => {
      const id = tile.getAttribute('data-case');
      if (!id) return;
      tile.addEventListener('click', () => openCase(id, tile));
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCase(id, tile);
        }
      });
    });

    overlayClose && overlayClose.addEventListener('click', closeCase);
    overlayPrev && overlayPrev.addEventListener('click', () => stepCase(-1));
    overlayNext && overlayNext.addEventListener('click', () => stepCase(1));

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target === overlayScroll) closeCase();
    });

    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') closeCase();
      else if (e.key === 'ArrowRight') stepCase(1);
      else if (e.key === 'ArrowLeft') stepCase(-1);
    });
  }

  /* ---------- Smooth anchor offset for fixed nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          const top = el.getBoundingClientRect().top + window.scrollY - 20;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });
})();
