import type { Ref } from 'react';
import type { BotFrame } from './core/engine';
import { isLightInk, mixHex } from './core/skins';
import { NOTIF_BLUE } from './core/decor';
import { volumeDefinitions } from './core/volume';

export interface ArtworkProps { frame: BotFrame; id: string; ink: string; paper?: string; size?: number; svgRef?: Ref<SVGSVGElement>; happyEyes?: number; bodyTransform?: string; }
/** Shared SVG renderer for the React component and deterministic image exports. */
export function MokiArtwork({frame,id,ink,paper='#f9f9f9',size=320,svgRef,happyEyes=0,bodyTransform}:ArtworkProps){
 const safePaper=/^#[\da-f]{6}$/i.test(paper)?paper:'#f9f9f9';
  const dot=(item:BotFrame['dots'][number],i:number)=>{
    const fill=item.color??(item.depth===undefined?ink:mixHex(safePaper,ink,item.depth));
    return item.d?<path key={i} d={item.d} transform={`translate(${item.x} ${item.y}) rotate(${item.rot??0}) scale(100)`} fill={fill} opacity={item.opacity}/>:<circle key={i} cx={item.x} cy={item.y} r={item.r} fill={fill} opacity={item.opacity}/>;
  };
  // The eyes are holes punched in the body, so on a near-white ink they would
  // vanish into it: dark eyes there, paper eyes on every other ink.
  const eyePaper=isLightInk(ink)?'#333331':safePaper;
  return (
    <svg ref={svgRef} width={size} height={size} viewBox="-158 -158 316 316" className="h-auto max-w-full" role="img" aria-label="Animated Moki avatar" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <g dangerouslySetInnerHTML={{__html:volumeDefinitions(id,ink)}}/>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={-158} y={-158} width={316} height={316}>
          <path d={frame.bodyPath} fill="#fff"/>
          {frame.eyes.map((eye,i)=><path key={i} d={eye.d} transform={eye.matrix} opacity={eye.alpha*(1-happyEyes)} fill="#000"/>)}
          {happyEyes>0&&frame.eyes.map((eye,i)=><path key={`happy-${i}`} data-eye-kind="happy" d="M-14 4 Q0 -19 14 4 Q0 -5 -14 4Z" transform={eye.matrix} opacity={eye.alpha*happyEyes} fill="#000"/>)}
          {frame.notch&&<circle cx={frame.notch.x} cy={frame.notch.y} r={frame.notch.r} fill="#000"/>}
        </mask>
        {frame.arcs.map(arc=><linearGradient key={arc.id} id={`${id}-${arc.id}`} gradientUnits="userSpaceOnUse" x1={arc.grad.x1} y1={arc.grad.y1} x2={arc.grad.x2} y2={arc.grad.y2}>{arc.grad.stops.map((stop,i)=><stop key={i} offset={i/(arc.grad.stops.length-1)} stopColor={stop}/>)}</linearGradient>)}
      </defs>
      <g data-reaction="tickle" transform={bodyTransform}>
      <g fill="none" strokeLinecap="round">{frame.arcs.map(arc=><path key={arc.id} d={arc.back} stroke={`url(#${id}-${arc.id})`} strokeWidth={arc.width} opacity={arc.opacity}/>)}</g>
      {frame.dotsBehind&&<g>{frame.dots.map(dot)}</g>}
      <g opacity={frame.bodyAlpha} filter={`url(#${id}-shadow)`}>
        <path d={frame.bodyPath} fill={eyePaper}/>
        <g mask={`url(#${id}-mask)`} data-volume="body">
          <rect x={-158} y={-158} width={316} height={316} fill={`url(#${id}-material)`}/>
          <path d={frame.bodyPath} fill="#000" filter={`url(#${id}-rim)`}/>
        </g>
      </g>
      {!frame.dotsBehind&&<g>{frame.dots.map(dot)}</g>}
      {frame.notif&&<circle cx={frame.notif.x} cy={frame.notif.y} r={frame.notif.r} fill={NOTIF_BLUE}/>}
      <g fill="none" strokeLinecap="round">{frame.arcs.map(arc=><path key={arc.id} d={arc.front} stroke={`url(#${id}-${arc.id})`} strokeWidth={arc.width} opacity={arc.opacity}/>)}</g>
      </g>
    </svg>
  );
}
