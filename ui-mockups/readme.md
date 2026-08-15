# NIGHT MARKET — Design System

Cyberpunk anime-styled UI system for a digital trading-card/board game: black-market
trading in a megacity, Jaipur-style mechanics (market row, value tokens, bonus tokens,
player hand/stat panels), 1 human "Operator" vs 3 AI bots.

**"NIGHT MARKET" is a placeholder working title** — no logo exists; render the name in
plain display type (Chakra Petch 600, ALL CAPS, tracked) wherever a mark would go.

**Sources:** built from a written art-direction brief only (no Figma, codebase, or
image references). Direction: Ghost in the Shell (calm tech-noir navy base, minimal
geometric linework, holographic glass) blended with Cyberpunk 2077 (saturated neon
accents used *sparingly* as a rarity/importance signal, never blanket decoration).

## The one rule
The base UI is calm and legible. **Glow = rare/important.** If everything glows,
nothing is rare. Common-tier elements never glow; body text never glows.

## Content fundamentals
- Player is addressed as **OPERATOR**. Bots have handle-style names: `VULT-3R`, `NØMAD`, `SPECTRE-9`.
- Labels/headings: ALL CAPS, tracked, `//` between segments — `MARKET // ROW`, `OPERATOR // YOU`.
- System messages speak terminal: mono prefix `SYS.ERR 402 //`, `SYS.OK //`, then a sentence-case message.
- Log lines: `> ` prefix, lowercase, mono — `> vult-3r sold 3× synth-silk  +6 cr`.
- Body copy: sentence case, concise, declarative. No exclamation marks. **No emoji.**
- Numbers always monospace. Currency is `CR` (credits), suffixed: `12,480 CR`.

## Visual foundations
- **Color:** deep navy base (`#0a0e16` page, `#141a24` panels, `#26334a` borders);
  cool-white text ramp; `#4fc3d9` neutral cyan for all interactive UI. Rare tier =
  electric cyan / neon gold / neon magenta with a 3-layer glow (6px .55 / 20px .28 /
  48px .12). Common tier = muted purple / green / orange, borders at 55% opacity, matte.
  System: red-tinted glass for error+warning, green for success.
- **Type:** Chakra Petch (display/labels/body — machined corner cuts suit the HUD);
  IBM Plex Mono (ALL numerals, data readouts, terminal). Caps + wide tracking for labels
  (+0.18em), sentence case for body. Scale in `tokens/typography.css`.
- **Geometry:** angled corner cuts (12px panels/cards, 7px buttons) instead of rounding.
  Radius only on value tokens (circle) and tiny system chips (2px). Panels cut TL+BR,
  cards cut TR, buttons cut TL+BR.
- **Glass:** `rgba(20,26,36,.72)` + 14px backdrop blur + cyan hairline
  `rgba(79,195,217,.22)` + faint top-left highlight + deep drop shadow. Used for all
  HUD panels so the board reads through them.
- **Textures:** faint scanlines in illustration wells; faint 24px cyan grid on the board
  background. Both ≤5% opacity — felt, not seen.
- **Motion:** fast and damped — 120/200ms, `cubic-bezier(.2,.9,.25,1)`. Hover =
  brighter fill + soft cyan glow; press = darker + 1px down; selection = 6px lift.
  Pulsing dot (`ds-pulse`) marks the active turn. No bounces.
- **States:** selected = cyan border + `--glow-ui` + lift; active turn = one glowing
  glass panel + pulsing dot; disabled = opacity .38 + grayscale, glows stripped.
- **Backgrounds:** flat `--bg-page` with optional `--texture-grid`; no gradients except
  radial neon light-leaks behind glass panels, and only in decorative contexts.

## Iconography
No bespoke icon set exists. **Lucide via CDN** (`https://unpkg.com/lucide@latest`),
1.5px stroke (`lucide.createIcons({attrs:{'stroke-width':1.5}})`), outline only, no
fills. 24px grid, rendered at 16/20/24. Default color `--text-secondary`; accent color +
drop-shadow glow ONLY on rare-tier meanings. Unicode used deliberately: `印` on the seal
token, `>` and `_` in terminal text, `[ ]` brackets on system buttons. No emoji.
FLAG: Lucide is a substitution — replace with a custom set for production.

## Index
- `styles.css` → imports `tokens/` (fonts, colors, typography, spacing, effects, base)
- `components/actions/Button` — gameplay + system buttons
- `components/cards/GameCard` — trading-card frame (rare/common tiers)
- `components/tokens/TokenChip` — value circle / bonus hex / seal diamond
- `components/panels/GlassPanel` — glass HUD panel, active-turn treatment
- `components/feedback/SystemBanner` — error/success/info banners
- `guidelines/` — foundation specimen cards + `style-guide.html` (full reference sheet)
- `SKILL.md` — agent skill entry point

## Intentional additions
- `SystemBanner`, `TokenChip.seal` label override — implied by the brief's feedback/token requirements.

## Caveats / substitutions
- Fonts load from Google Fonts CDN (Chakra Petch, IBM Plex Mono) — no binaries in-project.
- Lucide icons from CDN (see above).
- No logo, no illustration art — cards ship with striped placeholder wells; drop real
  art into `GameCard`'s `illustration` prop.
