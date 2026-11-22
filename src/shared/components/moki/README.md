# Moki — скопируй одну папку

Скопируй **всю папку `moki`** в `src` своего React-проекта. Все внутренние файлы уже здесь. Дополнительные библиотеки, конструктор, редактор и экспорт не нужны.

Нужны React 19 и настроенный Tailwind CSS 4. Если папка находится внутри `src`, Tailwind обычно находит её автоматически. Для папки за пределами сканируемых исходников добавь её путь через `@source` в своём Tailwind-файле.

```tsx
import { Moki } from './moki';

export function Example() {
  return <Moki shape="squircle" color="creme" size={240} />;
}
```

Меняй `shape`, `color`, `expression` и `state` через React state — компонент обновится без перезагрузки и перемонтирования. Нажатие вызывает пружинистую реакцию с весёлыми глазками.

## Курсор

```tsx
<Moki />                    // самостоятельный взгляд
<Moki follow="page" />      // следит по всей странице
```

Только в нужном блоке:

```tsx
'use client';
import { useRef } from 'react';
import { Moki } from './moki';

export function Hero() {
  const area = useRef<HTMLElement>(null);
  return (
    <section ref={area} className="rounded-3xl p-8">
      <Moki follow="area" followArea={area} />
    </section>
  );
}
```

## Параметры

- `shape`: cercle, galet, squircle, capsule, triangle, hexagone, nuage, goutte.
- `color`: encre, creme, brun, rouge, orange, ambre, vert, turquoise, bleu, violet, lilas, rose, gris, або довільний HEX виду `#cf99fc`.
- `expression`: neutre, attentif, surpris, excite, heureux, hilare, colere, triste, effraye, mefiant, confus, curieux, fier, timide, blase, somnolent.
- `state`: idle, thinking, wink, wide, alert, notify, exclaim, sleep, egg, hexagon, play, orbit, burst, comet.
- `size`: размер в px, по умолчанию 320; уменьшается до ширины контейнера.
- `follow`: false (по умолчанию), true / 'page' или 'area'.
- `followArea`: ref на область, только для 'area'.
- `playing`: проигрывать цикл, по умолчанию false.
- `cycle`: собственный массив `{ state, duration }`, секунды.
- `frozenAt`: статичный кадр без анимационного цикла.
- `className`, `label`: Tailwind-классы и доступное имя кнопки.
- `paper`: фон внутри глаз, HEX из шести цифр, по умолчанию #f9f9f9.
- `decorative`: неинтерактивная миниатюра.
- `onPlayback`: callback `{ block, state, elapsed, time }`.
- `ref`: `MokiHandle` с `getSvg()` и `seek(block, offset?)`.

Типы `MokiProps`, `MokiHandle`, `ShapeId`, `ColorId`, `ColorValue`, `ExpressionId`, `StateId`, палитра `COLORS`, формы `SHAPES`, выражения `EXPRESSIONS` и состояния `STATES` экспортируются из того же `./moki`.

## Next.js / Astro

Next.js: у компонента уже есть `'use client'`. Обёртка с useState / useRef также должна быть клиентской.

Astro с интеграцией React: `<Moki client:load />`. Для отслеживания в конкретной области создай React-обёртку Hero, как выше, и подключи `<Hero client:load />`.

## Что внутри

`index.ts` — вход для импорта. `Moki.tsx` — поведение. `MokiArtwork.tsx` — SVG. `core/` — внутренний движок. Менять внутренние файлы для подключения не требуется.

Оригинальный движок bloub: Jérémy Perret, MIT. Лицензия включена в эту папку. Moki не связан с x.ai; MIT покрывает код, а не права на исходный воспроизводимый дизайн.
