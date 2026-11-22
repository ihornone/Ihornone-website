'use client';

import { useState, useRef, useEffect } from 'react';
import { Moki, type ShapeId, type ExpressionId, type StateId } from './index';

interface Props {
  size?: number;
  shape?: ShapeId;
  color?: string;
  initialExpression?: ExpressionId;
  initialState?: StateId;
  follow?: boolean | 'page' | 'area';
  showSpeech?: boolean;
  defaultSpeech?: string;
  showHint?: boolean;
  className?: string;
}

const PHRASES = [
  'Привіт! Я Мокі 🐾',
  'Погладь мене ще раз! ✨',
  'Кодю без вихідних ⚡',
  'Чистий код і швидкий запуск 🚀',
  'Telegram-боти — це моя любов 💜',
  'Мурр! Чудовий проєкт 🐱',
];

export default function MokiCompanion({
  size = 220,
  shape = 'squircle',
  color = '#1E1414',
  initialExpression = 'heureux',
  initialState = 'idle',
  follow = 'page',
  showSpeech = true,
  defaultSpeech = 'Привіт! Я Мокі 🐾',
  showHint = true,
  className = '',
}: Props) {
  const [expression, setExpression] = useState<ExpressionId>(initialExpression);
  const [state, setState] = useState<StateId>(initialState);
  const [speech, setSpeech] = useState(defaultSpeech);
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);
  const bubbleTimeout = useRef<number | null>(null);

  const expressionsList: ExpressionId[] = ['heureux', 'excite', 'curieux', 'attentif', 'fier', 'hilare'];
  const statesList: StateId[] = ['idle', 'wink', 'thinking', 'alert', 'play'];

  const handlePoke = () => {
    const nextCount = pokeCount + 1;
    setPokeCount(nextCount);

    // Pick a fun random expression and state
    const nextExpr = expressionsList[nextCount % expressionsList.length] ?? 'excite';
    const nextState = statesList[nextCount % statesList.length] ?? 'play';
    setExpression(nextExpr);
    setState(nextState);

    // Pick speech phrase
    const nextPhrase = PHRASES[nextCount % PHRASES.length] ?? PHRASES[0]!;
    setSpeech(nextPhrase);
    setIsBubbleVisible(true);

    if (bubbleTimeout.current) {
      window.clearTimeout(bubbleTimeout.current);
    }
    bubbleTimeout.current = window.setTimeout(() => {
      setIsBubbleVisible(false);
      setExpression('heureux');
      setState('idle');
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (bubbleTimeout.current) window.clearTimeout(bubbleTimeout.current);
    };
  }, []);

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none group cursor-pointer ${className}`}
      onClick={handlePoke}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePoke();
        }
      }}
      aria-label="Мокі — клікни, щоб погладити"
    >
      {/* Speech bubble */}
      {showSpeech && (
        <div
          className={`absolute -top-12 z-20 transition-all duration-300 pointer-events-none transform ${
            isBubbleVisible ? 'opacity-100 -translate-y-1 scale-100' : 'opacity-0 translate-y-2 scale-90 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100'
          }`}
        >
          <div className="relative px-3.5 py-1.5 rounded-2xl bg-white border-2 border-[#1E1414] shadow-[0_4px_0_#D09AFC] text-[#1E1414] text-xs font-black whitespace-nowrap">
            {speech}
            {/* Bubble arrow */}
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-[#1E1414] rotate-45"></div>
          </div>
        </div>
      )}

      {/* Moki Mascot Core */}
      <div className="transition-transform duration-300 group-hover:scale-105 active:scale-95">
        <Moki
          size={size}
          shape={shape}
          color={color}
          expression={expression}
          state={state}
          follow={follow}
          paper="#FAF1EC"
          label="Мокі"
        />
      </div>
    </div>
  );
}
