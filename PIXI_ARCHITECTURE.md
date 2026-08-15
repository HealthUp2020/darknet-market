# PixiJS card table — architecture

How the game renders. The UI is a **hybrid**: DOM/CSS for the HUD, **PixiJS (WebGL)** for the interactive card table. This document explains the setup, the boundaries, and how to extend it. Related: [UI_DECISIONS.md](UI_DECISIONS.md) (UI decisions), [BOT_LOGIC.md](BOT_LOGIC.md) (bot AI), [UI_ELEMENTS.md](UI_ELEMENTS.md) (asset inventory).

## 1. Why hybrid (not full-canvas)

PixiJS is a GPU-accelerated 2D **renderer**, not a full framework. We use it only where it pays off — the animated, art-heavy, touch-driven **card table** (market row + inventory row). Everything else stays DOM/CSS:

| Rendered by DOM/CSS | Rendered by PixiJS |
|---|---|
| Turn indicator, token piles, bonus piles | Market cards (row) |
| Bot stat panels, player score, stepper | Inventory/hand cards (row) |
| Action buttons, error banner | Card frames, per-good icons, glow |
| System-terminal log | Selection + hover states |

Rationale: DOM is better for crisp text, easy layout, and accessibility (log, buttons, panels); Pixi removes the DOM layout/perf limits that previously forced cards down to tiny icons, so the card table can carry real art and animation. Full-canvas was considered and rejected as a larger rewrite for little gain here.

## 2. Build / bundling

The game uses **Bun's HTML-import bundling** so npm modules (PixiJS) resolve in the browser.

- [server.ts](server.ts): `import index from "./public/index.html"` and serve it via `Bun.serve({ routes: { "/": index }, development: { hmr: true } })`. Bun bundles the HTML plus everything it references.
- [public/index.html](public/index.html): references are **relative** (`./style.css`, `<script type="module" src="./game.js">`) so the bundler picks them up. The script is an **ES module** (required for `import`).
- [public/game.js](public/game.js): `import { Application, Container, Graphics, Text, Sprite, Texture, Rectangle } from "pixi.js";`

Run: `bun run dev` (i.e. `bun run server.ts`) → http://localhost:3000. No Vite/webpack; PixiJS 8.x is in `dependencies` in [package.json](package.json).

## 3. Rendering model

The game keeps the existing **full re-render on every state change** philosophy (see [UI_DECISIONS.md](UI_DECISIONS.md) §10). `render()` updates all DOM HUD parts, then calls `drawTable()` to rebuild the Pixi scene. `drawTable()` clears `tableRoot.removeChildren()` and redraws both card rows from `state`.

```
state change ──> render() ──┬─> DOM HUD (innerHTML / textContent)
                            └─> drawTable() ──> tableRoot rebuild (Pixi)
```

### Key Pixi objects ([game.js](public/game.js))
- `pixiApp` — the `Application` (one WebGL context, one canvas mounted in `#table-mount`).
- `tableRoot` — a `Container` on the stage; cleared and repopulated each `drawTable()`.
- `iconTex` — map `good -> Texture`, built once in `initPixi()`.
- `makeCard(good, zone, idx, selected, w, h)` — returns a `Container` (frame `Graphics` + icon `Sprite` + label `Text`), wired for interaction.
- `drawRow(...)` / `drawLabel(...)` — lay out a row of cards / a section label.

### Init order
`render()` runs first (DOM works immediately; `drawTable()` no-ops until Pixi is ready), then `initPixi()` runs async — creates the app, builds textures, then calls `drawTable()`.

## 4. Icons as textures

Per-good icons live in the `ICONS` map as inline SVG strings using `currentColor`. `currentColor` does **not** resolve in an SVG loaded as an image, so in `initPixi()` each icon's `currentColor` is **replaced with the good's accent hex** (`ACCENT_HEX`) before building the texture:

```js
iconTex[g] = await svgTexture(ICONS[g].replaceAll("currentColor", ACCENT_HEX[g]));
```

`svgTexture()` builds an `Image` from a `data:image/svg+xml` URI, `await img.decode()`, then `Texture.from(img)` — reliable across browsers.

## 5. Card visual language (matches the Claude Design mockups)

- Angled clip-path silhouette drawn as a `Graphics` polygon (bevelled top-left / bottom-right).
- **Rare** goods (AI Cores / Implants / Corp Data): accent-colored border + a faint accent "halo" poly behind + icon drop-shadow feel via the glow color.
- **Common** goods: dim accent line, no glow.
- **Drones** (special resource): dashed cyan border.
- **Selected**: bright cyan (`#00fff0`) border + label brightened.
- **Hover** (desktop): the card lifts a few px (`c.y = c.baseY - 4`).
- Accent colors per good are in `ACCENT` (0xRRGGBB for Pixi) and `ACCENT_HEX` (strings for SVG).

## 6. Interaction

Each card `Container` sets `eventMode = "static"`, `cursor = "pointer"`, an explicit `hitArea` (`Rectangle`), and a `pointertap` handler that toggles the card's index in `selectedMarket` / `selectedHand` and calls `render()`. `pointertap` works for both mouse and touch. Action buttons remain DOM and read those same selection Sets.

## 7. Responsive + mobile

- `drawTable()` computes `cardW` clamped to `[84, 124]px` from the mount's width, then sizes the **canvas to the full card-row width** (`contentW`), which may exceed the viewport.
- `#table-mount` is `overflow-x: auto` (set in JS in `initPixi()` for robustness — a CSS-only rule was being computed as `visible`), so on narrow screens the row becomes **horizontally swipe-scrollable** while cards stay readable. Verified: 309px viewport → 652px content, scrollable.
- `canvas.style.touchAction = "pan-x pan-y"` lets the browser pan (scroll the table / page) while Pixi still receives taps.
- Resolution: `Math.min(devicePixelRatio, 2)` with `autoDensity` for crisp rendering on retina without over-drawing.
- A `ResizeObserver` on the mount redraws **only when width changes** (guard via `lastTableWidth` + `requestAnimationFrame`) — otherwise `drawTable()` setting the mount height re-triggers the observer and throws a "ResizeObserver loop" warning.

## 8. Debugging

The card table is canvas, so there is no DOM to inspect. `window.game` exposes live handles for the console / automated checks:

```js
window.game.state            // current game state (getter)
window.game.selectedMarket   // Set of selected market indices (getter)
window.game.selectedHand     // Set of selected hand indices (getter)
window.game.botPlay(...)     // plus takeCard / takeCamels / sellCards / exchangeCards / newGame / render
```

## 9. Target platforms & next steps

- **Web + mobile-web:** done. Responsive canvas, touch input, horizontal-scroll card rows.
- **PWA (installable):** not yet — add a web app manifest + service worker to enable "Add to Home Screen" and offline load.
- **Native app (App Store / Play Store):** wrap the same web build in **Capacitor** (or Cordova). No game code changes; adds platform SDK/build config.
- **Full-fidelity card art:** the Pixi foundation now makes it feasible to render the full 380×532 mockup illustrations as textures — e.g. a tap-to-zoom detail overlay, or larger animated cards on the table — without the DOM layout limits that forced the compact icon version.
- **Animations (not yet added):** deal-in, card-fly-to-hand, sell/particle effects — natural next polish, all within Pixi's ticker.

## 10. Gotchas / lessons (already handled)

- ES module required for `import` — plain `<script>` won't resolve bare specifiers.
- `currentColor` in SVG textures renders black — bake the color in first (§4).
- CSS `overflow-x` on the mount was computing to `visible`; set it in JS instead (§7).
- ResizeObserver loop warning — width-change guard + rAF (§7).
- Full re-render replaces card elements, so don't hold references to a card `Container` across a `render()` (they're recreated).
- **Bun dev-server logs `Error: Extension type mask-effect already has a handler` (x2)** on load. It's Bun's dev-bundler client runtime double-evaluating PixiJS's side-effectful extension registration (not HMR — persists with `hmr:false`; not our code — the cards use polygon fills, not Pixi masks). It is **benign**: rendering, interaction, and the bot loop all work. The clean fix is a production build (`bun build ./public/index.html --outdir=dist` and serve the static output) — no dev runtime, no double-eval, clean console. That's also the intended deploy path (and the base for PWA/Capacitor).
