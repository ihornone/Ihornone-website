'use client';

import { useState, useEffect } from 'react';
import { Moki } from './Moki';
import type { ShapeId, ExpressionId, StateId } from './index';

const SHAPES_CYCLE: ShapeId[] = [
  'squircle',
  'galet',
  'capsule',
  'hexagone',
  'nuage',
  'goutte',
  'triangle',
  'cercle',
];

interface Props {
  size?: number;
  color?: string;
  paper?: string;
  expression?: ExpressionId;
  state?: StateId;
  follow?: boolean | 'page' | 'area';
  interval?: number;
  className?: string;
}

export default function MokiMorpher({
  size = 320,
  color = '#D09AFC',
  paper = '#FAF1EC',
  expression = 'heureux',
  state = 'idle',
  follow = 'page',
  interval = 3200,
  className = '',
}: Props) {
  const [shapeIndex, setShapeIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setShapeIndex((prev) => (prev + 1) % SHAPES_CYCLE.length);
    }, interval);
    return () => window.clearInterval(timer);
  }, [interval]);

  const handleNextShape = () => {
    setShapeIndex((prev) => (prev + 1) % SHAPES_CYCLE.length);
  };

  return (
    <div
      onClick={handleNextShape}
      className="inline-flex items-center justify-center cursor-pointer w-full h-full"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNextShape();
        }
      }}
      aria-label="Змінити форму Мокі"
    >
      <Moki
        size={size}
        shape={SHAPES_CYCLE[shapeIndex]}
        color={color}
        expression={expression}
        state={state}
        follow={follow}
        playing={false}
        paper={paper}
        decorative={false}
        label="Мокі"
        className={className}
      />
    </div>
  );
}
