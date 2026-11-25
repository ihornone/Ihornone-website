/**
 * Masterclass GSAP & ScrollTrigger Unified Animation Suite.
 *
 * Implements the signature word-by-word rising reveal and spring-pop entrance
 * universally across ALL elements, sections, headers, cards, and pages:
 *  - 1. Top progress bar & navbar scroll blur
 *  - 2. Page Intro (Navbar drop-in)
 *  - 3. Signature Hero headline (words rise + sticker tag pop + buttons spring)
 *  - 4. Universal Heading reveals (every h1, h2, h3 across all pages)
 *  - 5. Universal Card & Section reveals (clean, solid upward glide, no weird scrubs)
 *  - 6. Cascading grid staggers
 *  - 7. High-precision GSAP `quickTo` magnetic pull on ALL interactive buttons
 *  - 8. 3D Perspective tilt with lighting on all bento and project cards
 *  - 9. Animated numerical tickers
 *  - 10. Footer upward cascade on scroll
 *  - 11. Complete lifecycle management with `gsap.context()` for Astro View Transitions
 *  - 12. Full `prefers-reduced-motion` compliance
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initSiteAnimations(): () => void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  const ctx = gsap.context(() => {
    /* ─────────────────────────────────────────────────────────────────────────
       1. Top Scroll Progress Bar & Navbar Scrolled State via ScrollTrigger
       ───────────────────────────────────────────────────────────────────────── */
    const progressBar = document.getElementById('scroll-progress-bar');
    const blurBar = document.getElementById('top-scroll-blur-bar');
    const navbarPocket = document.getElementById('navbar-pocket');

    if (progressBar || blurBar || navbarPocket) {
      ScrollTrigger.create({
        start: 'top top',
        end: 'max',
        onUpdate: (self) => {
          if (progressBar) {
            gsap.set(progressBar, { scaleX: self.progress });
          }
          const isScrolled = self.scroll() > 15;
          if (blurBar) {
            blurBar.classList.toggle('opacity-0', !isScrolled);
            blurBar.classList.toggle('opacity-100', isScrolled);
            blurBar.classList.toggle('invisible', !isScrolled);
            blurBar.classList.toggle('visible', isScrolled);
          }
          navbarPocket?.classList.toggle('is-scrolled', isScrolled);
        },
      });
    }

    /* ─────────────────────────────────────────────────────────────────────────
       2. Page Intro: Navbar Drop-In
       ───────────────────────────────────────────────────────────────────────── */
    if (navbarPocket && !prefersReducedMotion) {
      gsap.fromTo(
        navbarPocket,
        { y: -25, opacity: 0 },
        // 0.5s: this runs on EVERY page navigation (view transitions), so it
        // stays inside the marketing-intro budget instead of a slow 0.8s.
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.05 },
      );
    }

    /* ─────────────────────────────────────────────────────────────────────────
       3. Universal Text Splitting for Headings [data-reveal-text]
       ───────────────────────────────────────────────────────────────────────── */
    const textTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal-text]'));

    textTargets.forEach((el) => {
      if (el.dataset.revealReady === 'true') return;

      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
      if (inView || el.closest('.hero-title')) {
        el.classList.add('is-visible', 'is-ready');
        el.dataset.revealReady = 'true';
        return;
      }

      let index = 0;
      const newNodes: Node[] = [];
      const wrapWord = (word: string) => {
        const span = document.createElement('span');
        span.className = 'reveal-word';
        span.style.setProperty('--i', String(index++));
        span.textContent = word;
        newNodes.push(span, document.createTextNode(' '));
      };

      const hasElementChildren = Array.from(el.childNodes).some(
        (n) => n.nodeType === Node.ELEMENT_NODE,
      );

      if (hasElementChildren) {
        for (const node of Array.from(el.childNodes)) {
          if (node.nodeType === Node.TEXT_NODE) {
            for (const word of (node.textContent || '').split(/\s+/).filter(Boolean)) {
              wrapWord(word);
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const child = node as HTMLElement;
            child.classList.add('reveal-word');
            child.style.setProperty('--i', String(index++));
            newNodes.push(child, document.createTextNode(' '));
          }
        }
      } else {
        const source = el.dataset.revealText || el.textContent || '';
        const words = source.trim().split(/\s+/).filter(Boolean);
        if (!words.length) return;
        words.forEach(wrapWord);
      }

      el.textContent = '';
      newNodes.forEach((n) => el.appendChild(n));
      el.classList.add('reveal-text');
      el.classList.add('is-ready');
      el.dataset.revealReady = 'true';
    });

    /* ─────────────────────────────────────────────────────────────────────────
       4. Signature Hero Entrance (Homepage)
       ───────────────────────────────────────────────────────────────────────── */
    const heroTitle = document.querySelector<HTMLElement>('.hero-title');
    const heroBtnPrimary = document.querySelector<HTMLElement>('.hero-btn-primary');
    const heroContainer = document.querySelector<HTMLElement>('.hero-interactive-container');
    const heroCentralMoki = heroContainer?.querySelector<HTMLElement>('.hero-text-block .moki-interactive-node');
    const heroChips = heroContainer?.querySelectorAll<HTMLElement>('.hero-chips > *');

    // Make hero immediately visible and solid with zero flash or disappearance
    heroTitle?.classList.add('is-visible');
    heroBtnPrimary?.classList.add('is-visible');
    heroContainer?.classList.add('is-hero-ready');
    if (heroCentralMoki) {
      gsap.set(heroCentralMoki, { clearProps: 'all' });
    }
    if (heroChips) {
      gsap.set(heroChips, { clearProps: 'all' });
    }

    /* ─────────────────────────────────────────────────────────────────────────
       5. Universal Heading Reveals on Scroll (All Headings across all pages)
       ───────────────────────────────────────────────────────────────────────── */
    textTargets.forEach((el) => {
      if (el.classList.contains('hero-title')) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        el.classList.add('is-visible');
        return;
      }

      if (prefersReducedMotion) {
        el.classList.add('is-visible');
      } else {
        const words = el.querySelectorAll<HTMLElement>('.reveal-word');
        const tags = el.querySelectorAll<HTMLElement>('[data-tag], .pill-badge, span[class*="bg-[#"]');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: () => el.classList.add('is-visible'),
          },
        });

        if (words.length) {
          tl.fromTo(
            words,
            { opacity: 0, y: 28, rotate: 1.5 },
            {
              opacity: 1,
              y: 0,
              rotate: 0,
              duration: 0.85,
              stagger: 0.035,
              ease: 'power4.out',
            },
            0,
          );
        }

        if (tags.length) {
          tl.fromTo(
            tags,
            { scale: 0.85, opacity: 0, rotate: -3 },
            { scale: 1, opacity: 1, rotate: 0, duration: 0.75, ease: 'back.out(1.8)' },
            0.2,
          );
        }
      }
    });

    /* ─────────────────────────────────────────────────────────────────────────
       6. Universal Section & Card Reveals on Scroll (Solid, Clean Entrance)
       ───────────────────────────────────────────────────────────────────────── */
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-animate]'));

    if (prefersReducedMotion) {
      revealTargets.forEach((el) => el.classList.add('is-visible'));
    } else {
      // 6A. Staggered Grid Containers (Cards in 3/4 columns, process, bento, reviews)
      document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((container) => {
        if (container.closest('.hero-text-block')) return;

        const items = Array.from(container.children) as HTMLElement[];
        if (!items.length) return;

        const rect = container.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
          container.classList.add('is-visible');
          items.forEach((item) => item.classList.add('is-visible'));
          return;
        }

        container.classList.add('is-visible');

        gsap.fromTo(
          items,
          {
            opacity: 0,
            y: 32,
            scale: 0.98,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            stagger: 0.07,
            ease: 'power3.out',
            // Free the inline transform once settled: leftover identity
            // matrices would otherwise sit on every card for the page's
            // lifetime and pin FLIP/tilt interactions that write transform.
            clearProps: 'transform',
            scrollTrigger: {
              trigger: container,
              start: 'top 88%',
              once: true,
              onEnter: () => {
                items.forEach((item) => item.classList.add('is-visible'));
              },
            },
          },
        );
      });

      // 6B. Standalone Sections & Single Cards
      revealTargets.forEach((el) => {
        const parentStagger = el.parentElement?.closest('[data-stagger]');
        if (parentStagger && parentStagger !== el) return;
        if (el.hasAttribute('data-stagger')) return;
        if (el.closest('.hero-text-block')) return;

        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
          el.classList.add('is-visible');
          return;
        }

        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
              onEnter: () => el.classList.add('is-visible'),
            },
          },
        );
      });
    }

    /* ─────────────────────────────────────────────────────────────────────────
       7. Footer Upward Entrance
       ───────────────────────────────────────────────────────────────────────── */
    const footer = document.querySelector('footer');
    if (footer && !prefersReducedMotion) {
      const footerElements = footer.querySelectorAll<HTMLElement>('.grid > div, .border-t, .space-y-4');
      if (footerElements.length) {
        gsap.fromTo(
          footerElements,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: footer,
              start: 'top 92%',
              once: true,
            },
          },
        );
      }
    }

    /* ─────────────────────────────────────────────────────────────────────────
       8. Numerical Counter Tickers
       ───────────────────────────────────────────────────────────────────────── */
    const counterTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-count-to]'));

    counterTargets.forEach((el) => {
      const target = parseFloat(el.getAttribute('data-count-to') || '0');
      const prefix = el.getAttribute('data-count-prefix') || '';
      const suffix = el.getAttribute('data-count-suffix') || '';
      const decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);

      if (prefersReducedMotion) {
        el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
        return;
      }

      const countObj = { val: 0 };
      gsap.to(countObj, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
        onUpdate: () => {
          el.textContent = `${prefix}${countObj.val.toFixed(decimals)}${suffix}`;
        },
      });
    });

    /* ─────────────────────────────────────────────────────────────────────────
       9. Universal High-Precision Magnetic Pull on Buttons
       ───────────────────────────────────────────────────────────────────────── */
    if (isFinePointer && !prefersReducedMotion) {
      const magneticSelectors = [
        '[data-magnetic]',
        '.pill-btn-primary',
        '.pill-btn-lilac',
        '.pill-btn-outline',
        '.brand-cat-icon',
        '.filter-tab',
      ].join(', ');

      document.querySelectorAll<HTMLElement>(magneticSelectors).forEach((el) => {
        const strength = parseFloat(el.dataset.magnetic || '8');
        const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power2.out' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power2.out' });

        const onMouseMove = (e: MouseEvent) => {
          const rect = el.getBoundingClientRect();
          const normX = (e.clientX - rect.left) / (rect.width / 2) - 1;
          const normY = (e.clientY - rect.top) / (rect.height / 2) - 1;
          xTo(normX * strength);
          yTo(normY * strength);
        };

        const onMouseLeave = () => {
          xTo(0);
          yTo(0);
        };

        el.addEventListener('mousemove', onMouseMove, { passive: true });
        el.addEventListener('mouseleave', onMouseLeave, { passive: true });
      });
    }

    /* ─────────────────────────────────────────────────────────────────────────
       10. 3D Perspective Tilt on All Bento & Project Cards
       ───────────────────────────────────────────────────────────────────────── */
    if (isFinePointer && !prefersReducedMotion) {
      const cardSelectors = ['.bento-card', '.project-card', 'article.bg-white'].join(', ');

      document.querySelectorAll<HTMLElement>(cardSelectors).forEach((card) => {
        const maxTilt = parseFloat(card.dataset.tilt || '3.5');
        const rxTo = gsap.quickTo(card, 'rotationX', { duration: 0.45, ease: 'power2.out' });
        const ryTo = gsap.quickTo(card, 'rotationY', { duration: 0.45, ease: 'power2.out' });

        const onMouseMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const normX = (e.clientX - rect.left) / (rect.width / 2) - 1;
          const normY = (e.clientY - rect.top) / (rect.height / 2) - 1;
          rxTo(-normY * maxTilt);
          ryTo(normX * maxTilt);
        };

        const onMouseLeave = () => {
          rxTo(0);
          ryTo(0);
        };

        card.addEventListener('mousemove', onMouseMove, { passive: true });
        card.addEventListener('mouseleave', onMouseLeave, { passive: true });
      });
    }

    // Refresh ScrollTrigger after webfonts settle to ensure pin positions are exact
    document.fonts?.ready?.then(() => {
      ScrollTrigger.refresh();
    });
  });

  return () => {
    ctx.revert();
  };
}
