'use client';

import { useState, useEffect, useRef } from 'react';
import { Moki } from './Moki';

const SOCIALS = [
  {
    name: 'Telegram',
    href: 'https://t.me/ihornone',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.5 2L2 9.5l6 2.5 2.5 6 3-3.5 4.5 3.5 3.5-16z" />
        <path d="M8 12l10-7-7 8" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/ihornone',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    href: 'https://github.com/ihornone',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    ),
  },
  {
    name: 'Threads',
    href: 'https://threads.net/@ihornone',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19.25 12.05c-.14-4.66-3.8-7.8-8.25-7.8-4.94 0-8.75 3.77-8.75 8.75s3.81 8.75 8.75 8.75c3.27 0 6.13-1.67 7.5-4.22" />
        <path d="M15.5 10.5c-.88-1.54-2.52-2.25-4.5-2.25-3 0-5 2-5 4.5s2 4.5 5 4.5c2.5 0 4-1.25 4.5-2.75" />
        <path d="M15.5 10.5v4" />
      </svg>
    ),
  },
];

export default function MokiCornerWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  // Scale-from-trigger entrance: the panel grows out of the mascot
  // (origin-bottom-right). Reduced motion keeps opacity feedback only.
  const panelMotion = reduced
    ? 'transition-[opacity,visibility] duration-150'
    : 'transition-[opacity,transform,visibility] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]';
  const panelState = isOpen
    ? 'opacity-100 translate-y-0 scale-100 visible'
    : `opacity-0 pointer-events-none invisible ${reduced ? '' : 'translate-y-1.5 scale-[0.92]'}`;

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 pointer-events-auto select-none"
    >
      {/* Clean compact socials popup - opens UPWARDS above the mascot */}
      <div
        aria-hidden={!isOpen}
        inert={!isOpen}
        style={{
          position: 'absolute',
          bottom: 'calc(100% + 12px)',
          right: 0,
          width: '190px',
        }}
        className={`bg-white border-2 border-[#1E1414] rounded-2xl p-2 shadow-[0_8px_0_#1E1414] flex flex-col gap-1 origin-bottom-right ${panelMotion} ${panelState}`}
      >
        {SOCIALS.map((item) => (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#1E1414] hover:bg-[#FAF1EC] hover:text-[#95553C] transition-colors no-underline"
          >
            <span className="shrink-0 text-[#1E1414]">{item.icon}</span>
            <span>{item.name}</span>
          </a>
        ))}
      </div>

      {/* Mascot Button without framing container */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Соцмережі"
        aria-expanded={isOpen}
        className="group relative flex items-center justify-center cursor-pointer p-0 bg-transparent border-0 outline-none transition-transform duration-200 hover:scale-110 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 drop-shadow-[0_8px_16px_rgba(30,20,20,0.18)]"
      >
        <Moki
          size={64}
          shape="squircle"
          color="#D09AFC"
          expression={isOpen ? 'excite' : 'heureux'}
          follow="page"
        />
      </button>
    </div>
  );
}
