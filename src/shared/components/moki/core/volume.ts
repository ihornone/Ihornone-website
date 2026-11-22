import { mixHex } from './skins'

/** Shared by Vue and React: a soft, satin material, attached to the live silhouette. */
export function volumeDefinitions(id: string, ink: string) {
  const light = mixHex(ink, '#ffffff', 0.30)
  const mid = mixHex(ink, '#ffffff', 0.065)
  const shade = mixHex(ink, '#111115', 0.28)
  return `<radialGradient id="${id}-material" data-light="softbox" gradientUnits="userSpaceOnUse" cx="-42" cy="-57" r="185" fx="-48" fy="-62">
    <stop offset="0" stop-color="${light}"/><stop offset="0.32" stop-color="${mid}"/>
    <stop offset="0.64" stop-color="${ink}"/><stop offset="1" stop-color="${shade}"/>
  </radialGradient>
  <filter id="${id}-rim" data-light="rim" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="soft"/>
    <feOffset in="soft" dx="-4" dy="-7" result="shifted"/>
    <feComposite in="SourceAlpha" in2="shifted" operator="out" result="edge"/>
    <feFlood flood-color="#050509" flood-opacity="0.2"/>
    <feComposite in2="edge" operator="in"/>
  </filter>
  <filter id="${id}-shadow" x="-25%" y="-25%" width="150%" height="160%" color-interpolation-filters="sRGB">
    <feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="#24232b" flood-opacity="0.14"/>
  </filter>`
}
