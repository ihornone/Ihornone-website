/**
 * High-performance, tactile interaction & animation engine for ihornone portfolio
 * GPU-accelerated transforms, zero layout thrashing, 60-120fps smoothness, reduced-motion compliant.
 */

export function initSiteAnimations(): () => void {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  // 1. Scroll Progress Indicator
  const progressBar = document.getElementById('scroll-progress-bar');
  let tickingScroll = false;

  function updateScrollProgress() {
    if (!progressBar) return;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) {
      progressBar.style.width = '0%';
      return;
    }
    const currentProgress = Math.min(Math.max((window.scrollY / totalHeight) * 100, 0), 100);
    progressBar.style.width = `${currentProgress}%`;
    tickingScroll = false;
  }

  function onScroll() {
    if (!tickingScroll) {
      window.requestAnimationFrame(updateScrollProgress);
      tickingScroll = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateScrollProgress();

  // 2. Scroll Reveal Observer
  const animObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          animObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '80px 0px 80px 0px' }
  );

  document.querySelectorAll('[data-animate]').forEach((el) => {
    if (prefersReducedMotion) {
      el.classList.add('is-visible');
    } else {
      animObserver.observe(el);
    }
  });

  // 3. Number Counter Ticker ([data-count-to])
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          counterObserver.unobserve(el);
          animateCounter(el);
        }
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
    const duration = 1400; // ms
    const startTime = performance.now();

    function update(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = ease * target;

      el.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
      }
    }

    requestAnimationFrame(update);
  }

  document.querySelectorAll('[data-count-to]').forEach((el) => {
    counterObserver.observe(el);
  });

  // 4. Interactive Card Spotlight (Mouse-following specular glow)
  const spotlightCards = document.querySelectorAll<HTMLElement>('.spotlight-card');
  const cleanups: (() => void)[] = [];

  if (isFinePointer && !prefersReducedMotion) {
    spotlightCards.forEach((card) => {
      let isHovered = false;
      let rafId: number | null = null;
      let lastX = -999;
      let lastY = -999;

      function onMouseMove(e: MouseEvent) {
        const rect = card.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;

        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            card.style.setProperty('--mouse-x', `${lastX}px`);
            card.style.setProperty('--mouse-y', `${lastY}px`);
            rafId = null;
          });
        }
      }

      function onMouseEnter() {
        isHovered = true;
      }

      function onMouseLeave() {
        isHovered = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        card.style.setProperty('--mouse-x', '-999px');
        card.style.setProperty('--mouse-y', '-999px');
      }

      card.addEventListener('mouseenter', onMouseEnter, { passive: true });
      card.addEventListener('mousemove', onMouseMove, { passive: true });
      card.addEventListener('mouseleave', onMouseLeave, { passive: true });

      cleanups.push(() => {
        card.removeEventListener('mouseenter', onMouseEnter);
        card.removeEventListener('mousemove', onMouseMove);
        card.removeEventListener('mouseleave', onMouseLeave);
      });
    });
  }

  // 5. Interactive 3D Card Tilt
  const tiltCards = document.querySelectorAll<HTMLElement>('.tilt-card');
  if (isFinePointer && !prefersReducedMotion) {
    tiltCards.forEach((card) => {
      let rafId: number | null = null;

      function onMouseMove(e: MouseEvent) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const normX = (x - centerX) / centerX; // -1 to 1
        const normY = (y - centerY) / centerY; // -1 to 1

        const maxTilt = 4.5; // degrees for refined subtlety
        const rotX = -normY * maxTilt;
        const rotY = normX * maxTilt;

        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            card.style.transform = `perspective(900px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.012, 1.012, 1)`;
            rafId = null;
          });
        }
      }

      function onMouseLeave() {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      }

      card.addEventListener('mousemove', onMouseMove, { passive: true });
      card.addEventListener('mouseleave', onMouseLeave, { passive: true });

      cleanups.push(() => {
        card.removeEventListener('mousemove', onMouseMove);
        card.removeEventListener('mouseleave', onMouseLeave);
      });
    });
  }

  // 6. Fullscreen Hero Subtle Mouse Parallax
  const heroContainer = document.querySelector<HTMLElement>('.hero-interactive-container');
  const heroImage = document.querySelector<HTMLElement>('.hero-parallax-image');

  if (heroContainer && heroImage && isFinePointer && !prefersReducedMotion) {
    let heroRaf: number | null = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isHeroActive = false;

    function renderHero() {
      if (!isHeroActive && Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1) {
        heroImage!.style.transform = '';
        heroRaf = null;
        return;
      }

      // Smooth lerp damping
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      heroImage!.style.transform = `scale(1.04) translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      heroRaf = requestAnimationFrame(renderHero);
    }

    function onHeroMouseMove(e: MouseEvent) {
      const rect = heroContainer!.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const normY = (e.clientY - rect.top) / rect.height - 0.5;

      targetX = -normX * 18; // 18px range
      targetY = -normY * 18;

      if (!heroRaf) {
        isHeroActive = true;
        heroRaf = requestAnimationFrame(renderHero);
      }
    }

    function onHeroMouseLeave() {
      isHeroActive = false;
      targetX = 0;
      targetY = 0;
    }

    heroContainer.addEventListener('mousemove', onHeroMouseMove, { passive: true });
    heroContainer.addEventListener('mouseleave', onHeroMouseLeave, { passive: true });

    cleanups.push(() => {
      heroContainer.removeEventListener('mousemove', onHeroMouseMove);
      heroContainer.removeEventListener('mouseleave', onHeroMouseLeave);
      if (heroRaf) cancelAnimationFrame(heroRaf);
    });
  }

  // Teardown function for page transitions
  return () => {
    window.removeEventListener('scroll', onScroll);
    animObserver.disconnect();
    counterObserver.disconnect();
    cleanups.forEach((cleanup) => cleanup());
  };
}
