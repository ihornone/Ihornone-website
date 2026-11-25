'use client';

import { useEffect, useId, useImperativeHandle, useRef, useState, type Ref, type RefObject } from 'react';
import { BotEngine, type BotFrame, type Look } from './core/engine';
import { DEFAULT_EXPRESSION, EXPRESSION_BY_ID, type ExpressionId } from './core/expressions';
import { DEFAULT_COLOR, DEFAULT_SHAPE, inkOf, SHAPE_BY_ID, type ShapeId, type ColorValue } from './core/skins';
import { STATE_BY_ID, type StateId } from './core/states';
import { clampDuration, defaultCycle, offsetOf, type Block } from './core/cycles';
import { MokiArtwork } from './MokiArtwork';

const defaultBlocks = defaultCycle().blocks;

/** Compact fingerprint of a rendered frame. The rAF loop compares signatures
    instead of pushing state every tick, so a visually settled mascot costs
    zero React re-renders; the full SVG diff runs only while something moves. */
function frameSignature(f: BotFrame): string {
  let s = f.bodyPath + f.bodyAlpha.toFixed(4) + (f.dotsBehind ? 1 : 0);
  for (const e of f.eyes) s += e.d + e.matrix + e.alpha.toFixed(4);
  for (const d of f.dots) s += `${d.x},${d.y},${d.r},${d.opacity},${d.color ?? ''},${d.depth ?? ''},${d.d ?? ''},${d.rot ?? ''}`;
  for (const a of f.arcs) s += `${a.id}${a.t.toFixed(4)}${a.opacity.toFixed(4)}${a.width}${a.front}${a.back}${a.grad.x1},${a.grad.y1},${a.grad.x2},${a.grad.y2},${a.grad.stops.join('')}`;
  if (f.notif) s += `n${f.notif.x},${f.notif.y},${f.notif.r}`;
  if (f.notch) s += `c${f.notch.x},${f.notch.y},${f.notch.r}`;
  return s;
}

export type FollowMode = false | true | 'page' | 'area';
export interface PlaybackPosition { block: number; state: StateId; elapsed: number; time: number; }
export interface MokiHandle { getSvg(): SVGSVGElement | null; seek(block: number, offset?: number): void; }
export interface MokiProps {
  shape?: ShapeId;
  /** A palette id or any picked `#rrggbb` hex. */
  color?: ColorValue;
  expression?: ExpressionId;
  state?: StateId;
  size?: number;
  playing?: boolean;
  cycle?: Block[];
  /** Tracking is opt-in. true is an alias for 'page'. */
  follow?: FollowMode;
  /** Only points inside this element activate follow='area'. */
  followArea?: RefObject<HTMLElement | null>;
  frozenAt?: number;
  label?: string;
  className?: string;
  paper?: string;
  decorative?: boolean;
  onPlayback?: (position: PlaybackPosition) => void;
  gaze?: (time: number) => Look;
  ref?: Ref<MokiHandle>;
}

/** Live React companion. Geometry and animation are the original bloub engine. */
export function Moki({shape=DEFAULT_SHAPE,color=DEFAULT_COLOR,expression=DEFAULT_EXPRESSION,state='idle',size=320,playing=false,cycle=defaultBlocks,follow=false,followArea,frozenAt,label='Moki',className='',paper='#FAF1EC',decorative=false,onPlayback,gaze,ref}: MokiProps) {
  const id=`moki-${useId().replace(/[^a-zA-Z0-9_-]/g,'')}`;
  const [engine]=useState(()=>new BotEngine(100,state,SHAPE_BY_ID.get(shape)?.radii??null,EXPRESSION_BY_ID.get(expression)??null));
  const [frame,setFrame]=useState<BotFrame>(()=>({...engine.sample(frozenAt??0)}));
  const [current,setCurrent]=useState<StateId>(state);
  const [reduced,setReduced]=useState(false);
  const clock=useRef(0),pokeUntil=useRef(0),gazeStart=useRef(0),pokeDirection=useRef(1);
  const svg=useRef<SVGSVGElement>(null);
  const pointer=useRef<{x:number;y:number}|null>(null);
  /* Cached layout boxes: measured on pointer/scroll/resize events, never per
     frame — a getBoundingClientRect inside the rAF loop invalidates layout
     every tick (the engine writes DOM right before the read). */
  const svgRect=useRef<DOMRect|null>(null);
  const areaRect=useRef<DOMRect|null>(null);
  const lastFrameSig=useRef('');
  const player=useRef({index:0,started:0,elapsed:0,running:false,lastNotify:-Infinity,state});
  const config=useRef({state,playing,cycle,follow,followArea,onPlayback,gaze});
  config.current={state,playing,cycle,follow,followArea,onPlayback,gaze};
  const ink=inkOf(color);
  const snapshot=()=>{
    const next={...engine.sample(frozenAt??(clock.current+(window.matchMedia('(prefers-reduced-motion: reduce)').matches?1:0)))};
    lastFrameSig.current=frameSignature(next);
    setFrame(next);
  };
  const setPose=(next:StateId)=>{engine.setState(next,clock.current);player.current.state=next;setCurrent(next);};
  const seek=(index:number,offset=0)=>{
    const blocks=config.current.cycle;
    if(!blocks.length)return;
    const next=Math.max(0,Math.min(blocks.length-1,Math.floor(index)));
    const block=blocks[next]!;
    const elapsed=Math.max(0,Math.min(block.duration,offset));
    Object.assign(player.current,{index:next,started:clock.current-elapsed,elapsed,lastNotify:-Infinity});
    pokeUntil.current=0;setPose(block.state);snapshot();
  };
  useImperativeHandle(ref,()=>({getSvg:()=>svg.current,seek}));

  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);
    return()=>media.removeEventListener('change',update);
  },[]);
  useEffect(()=>{
    engine.setShape(SHAPE_BY_ID.get(shape)?.radii??null,clock.current);
    engine.setExpression(EXPRESSION_BY_ID.get(expression)??null,clock.current);snapshot();
  },[engine,shape,expression,frozenAt,reduced]);
  useEffect(()=>{
    if(!playing){pokeUntil.current=0;setPose(state);snapshot();}
  },[engine,state,frozenAt]);
  useEffect(()=>{
    const p=player.current;
    if(playing&&!p.running){p.started=clock.current-p.elapsed;}
    else if(!playing&&p.running){p.elapsed=clock.current-p.started;}
    p.running=playing;
    if(playing&&cycle.length){p.index=Math.min(p.index,cycle.length-1);setPose(cycle[p.index]!.state);}
    snapshot();
  },[engine,playing,cycle]);

  useEffect(()=>{gazeStart.current=clock.current;if(gaze)engine.setLook(gaze(0),clock.current-1/60,1/60);},[engine,gaze]);

  useEffect(()=>{
    pointer.current=null;engine.setLook(null,clock.current);
    if(!follow||frozenAt!==undefined||reduced)return;
    const measure=()=>{
      svgRect.current=svg.current?.getBoundingClientRect()??null;
      areaRect.current=config.current.follow==='area'?config.current.followArea?.current?.getBoundingClientRect()??null:null;
    };
    measure();
    const move=(event:PointerEvent)=>{
      if(event.pointerType==='touch'||!Number.isFinite(event.clientX)||!Number.isFinite(event.clientY)){pointer.current=null;return;}
      pointer.current={x:event.clientX,y:event.clientY};
      measure();
    };
    const release=()=>{pointer.current=null;engine.setLook(null,clock.current);};
    window.addEventListener('pointermove',move,{passive:true});
    window.addEventListener('scroll',measure,{passive:true});
    window.addEventListener('resize',measure,{passive:true});
    document.addEventListener('pointerleave',release);
    window.addEventListener('blur',release);
    return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('scroll',measure);window.removeEventListener('resize',measure);document.removeEventListener('pointerleave',release);window.removeEventListener('blur',release);release();};
  },[engine,follow,followArea,frozenAt,reduced]);

  useEffect(()=>{
    if(frozenAt!==undefined||reduced){snapshot();return;}
    let raf=0,last:number|undefined;
    function tick(ms:number){
      clock.current+=last===undefined?0:Math.min((ms-last)/1000,0.064);last=ms;
      const c=config.current,p=player.current;
      if(pokeUntil.current&&clock.current>=pokeUntil.current)pokeUntil.current=0;
      if(c.playing&&c.cycle.length){
        const block=c.cycle[p.index]??c.cycle[0]!;
        p.elapsed=clock.current-p.started;
        if(p.elapsed>=clampDuration(block.state,block.duration)){
          p.index=(p.index+1)%c.cycle.length;p.started=clock.current;p.elapsed=0;setPose(c.cycle[p.index]!.state);
        }
      }
      let target=c.gaze?c.gaze(clock.current-gazeStart.current):null;
      const point=pointer.current,box=svgRect.current;
      if(!c.gaze&&c.follow&&point&&box&&box.width>0&&box.height>0&&STATE_BY_ID.get(p.state)?.baseFace){
        const area=c.follow==='area'?areaRect.current:null;
        const allowed=c.follow!=='area'||(area&&area.width>0&&area.height>0&&point.x>=area.left&&point.x<=area.right&&point.y>=area.top&&point.y<=area.bottom);
        if(allowed){
          const halfWidth=Math.max(1,(area?.width??window.innerWidth)/2),halfHeight=Math.max(1,(area?.height??window.innerHeight)/2);
          const nx=Math.max(-1,Math.min(1,(point.x-box.left-box.width/2)/halfWidth));
          const ny=Math.max(-1,Math.min(1,(point.y-box.top-box.height/2)/halfHeight));
          target={yaw:nx*16,pitch:10-ny*13,mix:1,spin:0,wander:0};
        }
      }
      engine.setLook(target,clock.current,c.gaze?1/60:BotEngine.LOOK_MORPH);
      const next={...engine.sample(clock.current)};
      const sig=frameSignature(next);
      // The poke squash animates through re-renders (bodyTransform is derived
      // in render from pokeUntil), so it always pushes a frame; otherwise the
      // frame is pushed only when the engine output actually changed — an
      // idle mascot costs zero React re-renders.
      if(pokeUntil.current>0||sig!==lastFrameSig.current){
        lastFrameSig.current=sig;
        setFrame(next);
      }
      if(clock.current-p.lastNotify>=0.1){
        p.lastNotify=clock.current;
        c.onPlayback?.({block:p.index,state:p.state,elapsed:p.elapsed,time:offsetOf(c.cycle,p.index)+p.elapsed});
      }
      raf=requestAnimationFrame(tick);
    }
    raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);
  },[engine,frozenAt,reduced]);

  const poke=()=>{
    if(frozenAt!==undefined||reduced)return;
    pokeDirection.current*=-1;pokeUntil.current=clock.current+1.1;snapshot();
  };
  // A quick squash, little hop and damped wobble, all local to the live SVG.
  const reactionTime=pokeUntil.current?1.1-(pokeUntil.current-clock.current):-1;
  let bodyTransform:string|undefined;
  let happyEyes=0;
  if(reactionTime>=0&&reactionTime<1.1){
    const keys=[
      [0,1,1,0,0], [0.14,1.14,0.84,0,-5], [0.34,0.95,1.08,-21,6],
      [0.52,1.08,0.92,0,-3], [0.7,0.99,1.025,-4,1.5], [0.9,1.015,0.99,0,-0.6], [1.1,1,1,0,0]
    ];
    const end=keys.findIndex(key=>key[0]!>reactionTime);
    const from=keys[Math.max(0,end-1)]!,to=keys[Math.max(1,end)]!;
    const progress=Math.min(1,Math.max(0,(reactionTime-from[0]!)/(to[0]!-from[0]!)));
    const ease=progress*progress*(3-2*progress);
    const value=(index:number)=>from[index]!+(to[index]!-from[index]!)*ease;
    bodyTransform=`translate(0 ${value(3).toFixed(3)}) rotate(${(value(4)*pokeDirection.current).toFixed(3)} 0 90) translate(0 100) scale(${value(1).toFixed(3)} ${value(2).toFixed(3)}) translate(0 -100)`;
    happyEyes=reactionTime<0.14?reactionTime/0.14:reactionTime<0.7?1:Math.max(0,(1.1-reactionTime)/0.4);
  }
  const Root=decorative?'span':'button';
  return <Root type={decorative?undefined:'button'} aria-label={decorative?undefined:label} aria-hidden={decorative||undefined} data-state={current} data-eyes={happyEyes>0.5?'happy':'open'} data-follow={follow||'off'} onClick={decorative?undefined:poke} className={`inline-flex max-w-full touch-manipulation items-center justify-center rounded-3xl border-0 bg-transparent p-0 align-middle outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D09AFC] focus-visible:ring-offset-2 ${className}`}>
    <MokiArtwork svgRef={svg} happyEyes={happyEyes} bodyTransform={bodyTransform} frame={frame} id={id} ink={ink} paper={paper} size={size}/>
  </Root>;
}
export default Moki;
