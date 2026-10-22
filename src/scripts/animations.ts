/**
 * High-performance, tactile interaction & animation engine for the ihornone portfolio.
 *
 * Design rules:
 *  - One single `requestAnimationFrame` loop drives every pointer-driven effect.
 *  - Reveals run on CSS transitions; JS only toggles classes and stamps `--i`.
 *  - Interactive transforms are written as CSS variables so they compose with
 *    the reveal transform instead of overwriting it.
 *  - `prefers-reduced-motion` disables motion but never hides content.
 */

interface TiltTarget {
  el: HTMLElement;
  maxTilt: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  active: boolean;
}

interface MagneticTarget {
  el: HTMLElement;
  strength: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  active: boolean;
}

interface HeroParallax {
  container: HTMLElement;
  layers: HTMLElement[];
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  active: boolean;
}

export function initSiteAnimations(): () => void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const cleanups: (() => void)[] = [];

  /* ─────────────────────────────────────────────────────────────────────────
     1. Shared rAF scheduler
     ───────────────────────────────────────────────────────────────────────── */
  const frameJobs: (() => void)[] = [];
  let frameId: number | null = null;

  function requestFrame() {
    if (frameId !== null) return;
    frameId = requestAnimationFrame(() => {
      frameId = null;
      for (let i = 0; i < frameJobs.length; i++) frameJobs[i]();
    });
  }

  function stopFrame() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────
     2. Scroll state — progress bar + navbar blur, one listener, rAF-throttled
     ───────────────────────────────────────────────────────────────────────── */
  const progressBar = document.getElementById('scroll-progress-bar');
  const blurBar = document.getElementById('top-scroll-blur-bar');
  const navbarPocket = document.getElementById('navbar-pocket');
  let lastScrollY = window.scrollY;

  function readScrollState() {
    const y = window.scrollY;

    if (progressBar) {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total <= 0 ? 0 : Math.min(Math.max((y / total) * 100, 0), 100);
      progressBar.style.transform = `scaleX(${(pct / 100).toFixed(4)})`;
    }

    if (blurBar) {
      const isScrolled = y > 15;
      blurBar.classList.toggle('opacity-0', !isScrolled);
      blurBar.classList.toggle('opacity-100', isScrolled);
      // `visibility` keeps the browser from compositing the full-width
      // backdrop blur while the bar is hidden — that filter is expensive.
      blurBar.classList.toggle('invisible', !isScrolled);
      blurBar.classList.toggle('visible', isScrolled);
    }

    navbarPocket?.classList.toggle('is-scrolled', y > 15);

    lastScrollY = y;
  }

  function onScroll() {
    requestFrame();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  frameJobs.push(readScrollState);
  readScrollState();
  cleanups.push(() => window.removeEventListener('scroll', onScroll));

  /* ─────────────────────────────────────────────────────────────────────────
     3. Scroll reveal — threshold 0 keeps tall sections working
     ───────────────────────────────────────────────────────────────────────── */
  const revealTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-animate]'));

  // Stamp the stagger index so grids are not limited to eight items any more.
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, index) => {
      (child as HTMLElement).style.setProperty('--i', String(index));
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0, rootMargin: '0px 0px -8% 0px' }
  );

  revealTargets.forEach((el) => {
    if (prefersReducedMotion) {
      el.classList.add('is-visible');
    } else {
      revealObserver.observe(el);
    }
  });

  cleanups.push(() => revealObserver.disconnect());

  /* ─────────────────────────────────────────────────────────────────────────
     4. Text reveal — split headings into words, reveal them one by one
     ───────────────────────────────────────────────────────────────────────── */
  const textTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal-text]'));

  if (textTargets.length) {
    textTargets.forEach((el) => {
      if (el.dataset.revealReady === 'true') return;

      const source = el.dataset.revealText || el.textContent || '';
      const words = source.trim().split(/\s+/).filter(Boolean);
      if (!words.length) return;

      el.textContent = '';
      el.classList.add('reveal-text');

      words.forEach((word, index) => {
        const span = document.createElement('span');
        span.className = 'reveal-word';
        span.style.setProperty('--i', String(index));
        span.textContent = word;
        el.appendChild(span);
        if (index < words.length - 1) el.appendChild(document.createTextNode(' '));
      });

      el.dataset.revealReady = 'true';
    });

    const textObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          textObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    textTargets.forEach((el) => {
      if (prefersReducedMotion) {
        el.classList.add('is-visible');
      } else {
        textObserver.observe(el);
      }
    });

    cleanups.push(() => textObserver.disconnect());
  }

  /* ─────────────────────────────────────────────────────────────────────────
     5. Counter ticker
     ───────────────────────────────────────────────────────────────────────── */
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        counterObserver.unobserve(el);
        animateCounter(el);
      });
    },
    { threshold: 0.1 }
  );

  function animateCounter(el: HTMLElement) {
    if (prefersReducedMotion) return;

    const target = parseFloat(el.getAttribute('data-count-to') || '0');
    const prefix = el.getAttribute('data-count-prefix') || '';
    const suffix = el.getAttribute('data-count-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
    const duration = 1600;
    const startTime = performance.now();

    function update(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(2, -10 * progress);
      el.textContent = `${prefix}${(ease * target).toFixed(decimals)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
      }
    }

    requestAnimationFrame(update);
  }

  document.querySelectorAll('[data-count-to]').forEach((el) => counterObserver.observe(el));
  cleanups.push(() => counterObserver.disconnect());

  /* ─────────────────────────────────────────────────────────────────────────
     6. Spotlight — mouse-following specular glow on cards
     ───────────────────────────────────────────────────────────────────────── */
  if (isFinePointer && !prefersReducedMotion) {
    const spotlightCards = Array.from(document.querySelectorAll<HTMLElement>('.spotlight-card, .bento-card'));

    spotlightCards.forEach((card) => {
      let rafId: number | null = null;
      let lastX = -999;
      let lastY = -999;

      function onMouseMove(e: MouseEvent) {
        const rect = card.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;

        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            card.style.setProperty('--mouse-x', `${lastX.toFixed(1)}px`);
            card.style.setProperty('--mouse-y', `${lastY.toFixed(1)}px`);
            rafId = null;
          });
        }
      }

      function onMouseLeave() {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        card.style.setProperty('--mouse-x', '-999px');
        card.style.setProperty('--mouse-y', '-999px');
      }

      card.addEventListener('mousemove', onMouseMove, { passive: true });
      card.addEventListener('mouseleave', onMouseLeave, { passive: true });

      cleanups.push(() => {
        card.removeEventListener('mousemove', onMouseMove);
        card.removeEventListener('mouseleave', onMouseLeave);
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     7. 3D tilt — writes CSS variables so it composes with the reveal
     ───────────────────────────────────────────────────────────────────────── */
  const tiltTargets: TiltTarget[] = [];

  if (isFinePointer && !prefersReducedMotion) {
    document.querySelectorAll<HTMLElement>('.tilt-card').forEach((el) => {
      const target: TiltTarget = {
        el,
        maxTilt: parseFloat(el.dataset.tilt || '5'),
        targetX: 0,
        targetY: 0,
        currentX: 0,
        currentY: 0,
        active: false,
      };
      tiltTargets.push(target);

      function onMouseMove(e: MouseEvent) {
        const rect = el.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / (rect.width / 2) - 1;
        const normY = (e.clientY - rect.top) / (rect.height / 2) - 1;

        target.targetX = normX * target.maxTilt;
        target.targetY = -normY * target.maxTilt;
        target.active = true;
        el.style.willChange = 'transform';
        requestFrame();
      }

      function onMouseLeave() {
        target.targetX = 0;
        target.targetY = 0;
        target.active = false;
        requestFrame();
      }

      el.addEventListener('mousemove', onMouseMove, { passive: true });
      el.addEventListener('mouseleave', onMouseLeave, { passive: true });

      cleanups.push(() => {
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('mouseleave', onMouseLeave);
        el.style.willChange = '';
      });
    });

    frameJobs.push(() => {
      let needsFrame = false;

      for (const t of tiltTargets) {
        if (!t.active && Math.abs(t.currentX) < 0.05 && Math.abs(t.currentY) < 0.05) {
          if (t.currentX !== 0 || t.currentY !== 0) {
            t.currentX = 0;
            t.currentY = 0;
            t.el.style.setProperty('--tilt-x', '0deg');
            t.el.style.setProperty('--tilt-y', '0deg');
            t.el.style.willChange = '';
          }
          continue;
        }

        needsFrame = true;
        t.currentX += (t.targetX - t.currentX) * 0.12;
        t.currentY += (t.targetY - t.currentY) * 0.12;
        t.el.style.setProperty('--tilt-x', `${t.currentY.toFixed(2)}deg`);
        t.el.style.setProperty('--tilt-y', `${t.currentX.toFixed(2)}deg`);
      }

      if (needsFrame) requestFrame();
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     8. Magnetic buttons — the button leans toward the cursor
     ───────────────────────────────────────────────────────────────────────── */
  const magneticTargets: MagneticTarget[] = [];

  if (isFinePointer && !prefersReducedMotion) {
    document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
      const target: MagneticTarget = {
        el,
        strength: parseFloat(el.dataset.magnetic || '8'),
        targetX: 0,
        targetY: 0,
        currentX: 0,
        currentY: 0,
        active: false,
      };
      magneticTargets.push(target);

      function onMouseMove(e: MouseEvent) {
        const rect = el.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / (rect.width / 2) - 1;
        const normY = (e.clientY - rect.top) / (rect.height / 2) - 1;

        target.targetX = normX * target.strength;
        target.targetY = normY * target.strength;
        target.active = true;
        requestFrame();
      }

      function onMouseLeave() {
        target.targetX = 0;
        target.targetY = 0;
        target.active = false;
        requestFrame();
      }

      el.addEventListener('mousemove', onMouseMove, { passive: true });
      el.addEventListener('mouseleave', onMouseLeave, { passive: true });

      cleanups.push(() => {
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('mouseleave', onMouseLeave);
      });
    });

    frameJobs.push(() => {
      let needsFrame = false;

      for (const m of magneticTargets) {
        if (!m.active && Math.abs(m.currentX) < 0.05 && Math.abs(m.currentY) < 0.05) {
          if (m.currentX !== 0 || m.currentY !== 0) {
            m.currentX = 0;
            m.currentY = 0;
            m.el.style.setProperty('--mag-x', '0px');
            m.el.style.setProperty('--mag-y', '0px');
          }
          continue;
        }

        needsFrame = true;
        m.currentX += (m.targetX - m.currentX) * 0.15;
        m.currentY += (m.targetY - m.currentY) * 0.15;
        m.el.style.setProperty('--mag-x', `${m.currentX.toFixed(2)}px`);
        m.el.style.setProperty('--mag-y', `${m.currentY.toFixed(2)}px`);
      }

      if (needsFrame) requestFrame();
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     9. Hero parallax — pointer-driven, damped
     ───────────────────────────────────────────────────────────────────────── */
  const heroContainer = document.querySelector<HTMLElement>('.hero-interactive-container');
  const heroLayers = Array.from(document.querySelectorAll<HTMLElement>('.hero-parallax-layer'));

  if (heroContainer && heroLayers.length && isFinePointer && !prefersReducedMotion) {
    const hero: HeroParallax = {
      container: heroContainer,
      layers: heroLayers,
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      active: false,
    };

    function onHeroMouseMove(e: MouseEvent) {
      const rect = hero.container.getBoundingClientRect();
      hero.targetX = -((e.clientX - rect.left) / rect.width - 0.5) * 22;
      hero.targetY = -((e.clientY - rect.top) / rect.height - 0.5) * 22;
      hero.active = true;
      requestFrame();
    }

    function onHeroMouseLeave() {
      hero.targetX = 0;
      hero.targetY = 0;
      hero.active = false;
      requestFrame();
    }

    hero.container.addEventListener('mousemove', onHeroMouseMove, { passive: true });
    hero.container.addEventListener('mouseleave', onHeroMouseLeave, { passive: true });

    frameJobs.push(() => {
      if (!hero.active && Math.abs(hero.currentX) < 0.1 && Math.abs(hero.currentY) < 0.1) {
        hero.currentX = 0;
        hero.currentY = 0;
        hero.layers.forEach((layer) => {
          layer.style.setProperty('--px', '0px');
          layer.style.setProperty('--py', '0px');
        });
        return;
      }

      hero.currentX += (hero.targetX - hero.currentX) * 0.07;
      hero.currentY += (hero.targetY - hero.currentY) * 0.07;

      hero.layers.forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth || '1');
        layer.style.setProperty('--px', `${(hero.currentX * depth).toFixed(2)}px`);
        layer.style.setProperty('--py', `${(hero.currentY * depth).toFixed(2)}px`);
      });

      requestFrame();
    });

    cleanups.push(() => {
      hero.container.removeEventListener('mousemove', onHeroMouseMove);
      hero.container.removeEventListener('mouseleave', onHeroMouseLeave);
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     10. Teardown
     ───────────────────────────────────────────────────────────────────────── */
  return () => {
    stopFrame();
    cleanups.forEach((cleanup) => cleanup());
    frameJobs.length = 0;
  };
}
