# Jaipur Simulator (cyberpunk reskin) — Claude Design prompts (Stage 1 / P0)

A set of prompts for generating the visual assets for Stage 1 from [UI_ELEMENTS.md](UI_ELEMENTS.md) (tokens, goods cards, P0 player panels, HUD). The prompts are in English — image/design generation tools usually give better results in that language. The style is based on the decisions in [UI_DECISIONS.md](UI_DECISIONS.md), section 9 (a mix of Ghost in the Shell + Cyberpunk 2077).

Every prompt starts with a shared "style anchor" — paste it in each time so all elements keep a consistent aesthetic.

## Step 0. Design system (generate this first, before individual elements)

Before you design the individual elements from sections A–F, first generate a cohesive design system (palette, typography, component language, iconography, states, grid) — the prompt below produces a full style guide that then becomes the reference point for all the prompts later in this document.

```
Create a complete design system for a cyberpunk anime-styled card/board game UI.

CONCEPT
A digital trading-card game about black-market trading in a cyberpunk megacity —
mechanically similar to a Jaipur-style resource trading game (market of cards, value
tokens, bonus tokens, player hand/stats panels, action buttons, turn-based HUD).
1 human player vs 3 AI bot opponents.

ART DIRECTION
Mixed influence of two references, blended intentionally rather than picking one:
- Ghost in the Shell: cool tech-noir mood, muted deep navy/near-black base, minimalist
  geometric linework, glass/holographic panel textures, restrained and elegant.
- Cyberpunk 2077: bold saturated neon accent glow (magenta, gold, electric cyan) used
  sparingly on high-value/rare elements to create visual hierarchy.
The base UI should read as calm and legible; neon glow is a deliberate signal for
"this is rare/important," not a blanket aesthetic applied everywhere.

DELIVERABLES — please define and show all of the following as a cohesive style guide:

1. COLOR PALETTE
   - Base/neutral colors: page background, panel background, panel border, primary text,
     secondary/muted text (dark navy tech-noir family, anchored around #0a0e16 background
     and #141a24 panels, #4fc3d9 as the neutral cyan UI accent).
   - Rarity/category accent colors with glow treatment: a "rare tier" set (electric cyan,
     neon gold, neon magenta — each with a defined glow/shadow spec) and a "common tier"
     set (muted purple, muted terminal green, muted burnt orange — no glow, subdued).
   - System/utility colors: error/warning (red-tinted glass), success/confirmation,
     disabled state.
   - Show every color as a swatch with hex value and its semantic name/usage.

2. TYPOGRAPHY
   - A type scale (headings, body, small/caption, numeric/data display) suited to a
     sci-fi HUD — consider a technical/monospace typeface for data readouts (scores,
     counters, log/terminal panel) paired with a clean geometric sans for headings/labels.
   - Define weight, letter-spacing, and casing conventions (e.g. all-caps labels vs
     sentence-case body text).

3. COMPONENT LANGUAGE
   - Card frame anatomy: shared structure for all trading cards (border treatment for
     rare vs common tier, corner ornamentation, illustration area, label area).
   - Token/chip anatomy: circular value tokens vs hexagonal bonus tokens vs a unique
     "special" seal token — define what visually separates these three token families.
   - Panel anatomy: glass-panel treatment used for player/bot stat panels and the log
     panel (background blur/texture, border glow, corner radius or angled-corner style).
   - Button anatomy: base button shape (angled sci-fi terminal corners vs rounded),
     default/hover/active/disabled states, and how a "system action" button (e.g. reset)
     should read differently from a "gameplay action" button.

4. ICONOGRAPHY STYLE
   - A short style guide for all icons (line weight, fill vs outline, corner treatment,
     size grid) so icons for actions, tokens, and card illustrations stay visually
     consistent even when designed in separate passes.

5. STATE & FEEDBACK LANGUAGE
   - How selection/highlight state looks (e.g. selected card glow), how "active turn"
     is signaled, how error/system banners look, how disabled elements are dimmed.

6. SPACING & LAYOUT GRID
   - A basic spacing scale and grid/alignment principles for arranging panels, card
     rows, and HUD elements on a single-screen game board layout.

Output this as a single cohesive style guide (swatches, type specimens, component
examples side by side) so it can be used as the reference sheet before designing
individual UI assets (cards, tokens, buttons, panels) one by one.
```

---

## Shared style anchor

```
Cyberpunk anime game UI asset. Mixed art direction: Ghost in the Shell cool tech-noir
(muted deep navy #0a0e16 background, minimalist geometric linework, glass/holographic
texture) combined with Cyberpunk 2077 neon accents (bold saturated glow on important
elements). Flat vector-style icon/card illustration, clean crisp silhouette, centered
composition, no background clutter, digital trading-card-game asset quality, sharp edges,
high contrast. Thin cyan (#4fc3d9) structural linework as base accent.
```

---

## A. Goods value tokens

### 1. Token — AI Cores (rare)
```
[STYLE ANCHOR] + Circular token icon depicting an "AI Core" — a glowing crystalline
processor orb with visible internal circuitry, wrapped in intense electric cyan glow
(#00fff0), holographic energy rings around the edge. Rare-tier item: strongest neon glow
of the set. Numeral placeholder area at bottom for a point value (5 or 7). Token rim:
brushed dark metal with cyan light strip.
```

### 2. Token — Illegal implants (rare)
```
[STYLE ANCHOR] + Circular token icon depicting an illegal black-market cyberware implant
— a sleek chrome bio-mechanical component (spinal node or ocular implant) with exposed
wiring, wrapped in neon gold/yellow glow (#f4ff5c). Rare-tier item: strong neon glow.
Numeral placeholder area at bottom for a point value (5 or 6). Token rim: brushed dark
metal with gold light strip.
```

### 3. Token — Stolen corporate data (rare)
```
[STYLE ANCHOR] + Circular token icon depicting stolen corporate data — a holographic
data shard / encrypted drive fragment with visible binary/glyph texture, wrapped in
neon magenta/pink glow (#ff2e88). Rare-tier item: strong neon glow. Numeral placeholder
area at bottom for a point value (5, same across all copies). Token rim: brushed dark
metal with magenta light strip.
```

### 4. Token — Pharma contraband (common)
```
[STYLE ANCHOR] + Circular token icon depicting bootleg nano-pharma contraband — a small
vial/ampoule with glowing liquid and a warning glyph label, muted soft purple accent
(#8a6fd8), NO strong glow (common-tier item, subdued lighting). Numeral placeholder area
at bottom for a point value (1, 2, 3 or 5). Token rim: matte dark metal with thin purple
line.
```

### 5. Token — Cracked software (common)
```
[STYLE ANCHOR] + Circular token icon depicting cracked/pirated software — a floating
holographic terminal window fragment with green scrolling code glyphs, muted terminal
green accent (#3ddc84), NO strong glow (common-tier item, subdued lighting). Numeral
placeholder area at bottom for a point value (1, 2, 3 or 5). Token rim: matte dark metal
with thin green line.
```

### 6. Token — Street weaponry (common)
```
[STYLE ANCHOR] + Circular token icon depicting street-grade weapon parts — a stripped-down
pistol slide / weapon component with scratched metal texture, muted burnt orange-red
accent (#d9603f), NO strong glow (common-tier item, subdued lighting). Numeral placeholder
area at bottom for a point value (1, 2, 3 or 4). Token rim: matte dark metal with thin
orange line.
```

## B. Bonus tokens

### 7. Bonus token — selling 3 cards at once
```
[STYLE ANCHOR] + Hexagonal (not circular, to visually differ from value tokens) bonus
token, engraved with a small "×3" glyph and a stacked-cards icon, moderate cyan-white
glow, mid-tier visual weight (smaller/simpler glow than the 5+ tier token). Numeral
placeholder area for bonus value (1, 2 or 3).
```

### 8. Bonus token — selling 4 cards at once
```
[STYLE ANCHOR] + Hexagonal bonus token, engraved with a small "×4" glyph and a
stacked-cards icon, stronger cyan-magenta gradient glow than the ×3 tier. Numeral
placeholder area for bonus value (4, 5 or 6).
```

### 9. Bonus token — selling 5+ cards at once
```
[STYLE ANCHOR] + Hexagonal bonus token, engraved with a small "×5+" glyph and a
stacked-cards icon, the strongest, most elaborate glow of the three bonus tiers —
full rainbow-neon rim (cyan-magenta-gold) to signal maximum value. Numeral placeholder
area for bonus value (8, 9 or 10).
```

### 10. Special token — "Fixer Reputation"
```
[STYLE ANCHOR] + Unique one-of-a-kind octagonal seal/badge token, distinct from all
other tokens — depicts a stylized fixer's insignia (a masked/hooded broker silhouette
inside a circuit-pattern seal), engraved "+5", intense multicolor neon glow (cyan rim
with magenta core light), ornate holographic security-seal texture like a corporate
verification stamp. Should read as clearly more prestigious/rare than any other token
in the set.
```

## C. Goods cards

### 11. Card — AI Cores
```
[STYLE ANCHOR] + Trading card front, portrait orientation. Large central illustration
of a glowing AI core crystal/processor matching token #1's iconography, intense electric
cyan glow. Card frame: dark navy with thin cyan glowing border (rare-tier frame treatment,
slightly more ornate corner details than common cards). Top area reserved for card name
label, no text baked in — just the frame + illustration.
```

### 12. Card — Illegal implants
```
[STYLE ANCHOR] + Trading card front, portrait orientation. Large central illustration of
a chrome bio-mechanical implant matching token #2's iconography, neon gold/yellow glow.
Card frame: dark navy with thin gold glowing border (rare-tier frame treatment, ornate
corners). Top area reserved for card name label, no text baked in.
```

### 13. Card — Stolen corporate data
```
[STYLE ANCHOR] + Trading card front, portrait orientation. Large central illustration of
a holographic data shard matching token #3's iconography, neon magenta/pink glow. Card
frame: dark navy with thin magenta glowing border (rare-tier frame treatment, ornate
corners). Top area reserved for card name label, no text baked in.
```

### 14. Card — Pharma contraband
```
[STYLE ANCHOR] + Trading card front, portrait orientation. Central illustration of a
glowing nano-pharma vial matching token #4's iconography, muted soft purple accent,
subdued lighting. Card frame: dark navy with plain thin purple line border (common-tier
frame, simpler than rare cards, no ornate corners). Top area reserved for card name label.
```

### 15. Card — Cracked software
```
[STYLE ANCHOR] + Trading card front, portrait orientation. Central illustration of a
floating terminal/code fragment matching token #5's iconography, muted terminal green
accent, subdued lighting. Card frame: dark navy with plain thin green line border
(common-tier frame, simple). Top area reserved for card name label.
```

### 16. Card — Street weaponry
```
[STYLE ANCHOR] + Trading card front, portrait orientation. Central illustration of
stripped weapon parts matching token #6's iconography, muted burnt orange-red accent,
subdued lighting. Card frame: dark navy with plain thin orange line border (common-tier
frame, simple). Top area reserved for card name label.
```

### 17. Card — Courier drone
```
[STYLE ANCHOR] + Trading card front, portrait orientation. Central illustration of a
small autonomous delivery drone — sleek quadcopter silhouette with a single cyan optical
sensor eye, silver-white chassis with cyan trim lighting. Distinct card frame treatment
from goods cards: metallic silver-white border instead of colored, to visually mark it
as a "special resource" card, not a tradeable good. Top area reserved for card name label.
```

## D. Player panels (P0 elements)

### 23. Player stats panel (full)
```
[STYLE ANCHOR] + UI panel design (rectangular card/box element, landscape orientation)
for displaying a human player's stats in a game HUD: reserved zones for hand card count,
drone/camel count, and score number. Dark glass panel background with subtle cyan edge
glow, holographic HUD readout aesthetic (like a heads-up display overlay), thin scan-line
texture. No text baked in — layout/frame only, ready for numbers to be overlaid.
```

### 24. Bot stats panel (compact)
```
[STYLE ANCHOR] + Same UI panel family as the player stats panel (#23) but visually
"locked/obscured" feeling — slightly dimmer glass, a small padlock or static-noise
texture overlay in the corner to signal hidden information (opponent's hand isn't
visible). Same reserved zones for hand count, drone count, score. Dark glass panel,
subtle cyan edge glow, HUD readout aesthetic.
```

### 25. Active-turn indicator
```
[STYLE ANCHOR] + A glowing frame/border overlay treatment to indicate "this player's
turn is active" — an animated-looking pulsing neon cyan-to-magenta gradient outline
that could wrap around a stats panel (#23/#24). Should read as an alert/highlight state,
distinct enough to be noticed at a glance but not overwhelming. Provide as a border/frame
graphic, not a full panel.
```

## F. HUD (controls)

### 31. Button — "Take 1 card from the market"
```
[STYLE ANCHOR] + Cyberpunk UI button design, rectangular with clipped/angled corners
(sci-fi terminal button shape), dark glass base with thin cyan border, icon of a single
card being lifted/grabbed. Include a hover/active state variant with brighter cyan glow.
No text baked in, icon + frame only.
```

### 32. Button — "Take all drones"
```
[STYLE ANCHOR] + Same button family/shape as #31. Icon depicting a small cluster of
drone silhouettes (matching card #17's drone design) being collected/swept together.
Include hover/active glow state. Icon + frame only, no text.
```

### 33. Button — "Sell selected"
```
[STYLE ANCHOR] + Same button family/shape as #31. Icon depicting a card being exchanged
for a credits/currency glyph (a stylized coin or data-credit symbol), suggesting a sell
transaction. Include hover/active glow state. Icon + frame only, no text.
```

### 34. Button — "Exchange selected"
```
[STYLE ANCHOR] + Same button family/shape as #31. Icon depicting two arrows in a circular
swap/exchange pattern between two card silhouettes. Include hover/active glow state.
Icon + frame only, no text.
```

### 35. Button — "New game"
```
[STYLE ANCHOR] + Same button family/shape as #31 but visually distinct as a "reset/system"
action rather than a gameplay action — icon of a circular refresh/reload arrow with a
small power-cycle glyph. Slightly different accent color (e.g. neutral white-cyan instead
of the gameplay buttons' pure cyan) to separate it from in-game actions. Icon + frame only.
```

### 36. +/− stepper for selecting drones to exchange
```
[STYLE ANCHOR] + Compact stepper UI control: two small angled-corner buttons ("−" and
"+") flanking a digital counter display window (like a small holographic number readout)
in the center. Same dark glass + cyan border language as the other buttons, but smaller
scale. Icon + frame only, no live number baked in.
```

### 37. Error / system message banner
```
[STYLE ANCHOR] + Horizontal notification banner UI element, styled like a system alert
from a cyberpunk terminal/HUD — dark red-tinted glass background (#4a2323-derived) with
a glitch/static texture edge, thin red-orange warning glow border, small warning-triangle
or corrupted-data glyph icon on the left side. Reserved empty text area. No text baked in.
```

### 38. Action log / history panel
```
[STYLE ANCHOR] + A scrollable terminal/console panel design — dark background with faint
scan-line texture, monospace-style text area feel (even though no text is baked in),
thin cyan top border with a small terminal-prompt icon (e.g. ">_" glyph) in the header.
Should read as a "hacker terminal log" aesthetic. Frame only, empty content area.
```

### 39. Turn indicator (text)
```
[STYLE ANCHOR] + A slim horizontal HUD readout bar element for displaying whose turn it
is — holographic text-display strip with a subtle animated scan-line, small pulsing
status-dot icon on the left (color-shiftable between cyan = player turn / magenta =
bot turn / gray = game over). Frame + status-dot only, no text baked in.
```

---

## G. Main game screen — "the stage" (full board layout)

The prior sections (A–F) are individual assets. This prompt composes them into the **main
game screen** — the board where the whole game is played and where the mechanics become
legible at a glance. Layout philosophy borrowed from Everdell (an immersive themed
environment where every mechanic has a clear spatial home, the full game state readable
on one screen), applied to NIGHT MARKET's own Jaipur-derived mechanics (market row, hand,
value tokens, sell/exchange/take) in the cyberpunk / Ghost in the Shell style.

Run this as its own prompt (it does not use the per-element STYLE ANCHOR — it carries the
full system inline):

```
Design the MAIN GAME SCREEN ("the stage") for NIGHT MARKET — a cyberpunk anime
trading-card/board game. This is the primary board where the whole game is played and
where the mechanics are made legible at a glance. Output a single full-screen desktop
mockup (16:9), plus notes on how it reflows for mobile/portrait.

EXTEND THE EXISTING DESIGN SYSTEM
This must match and extend the "NIGHT MARKET" design system already established:
- Base: Ghost in the Shell tech-noir — deep navy (#0a0e16 page, #141a24 panels,
  #26334a borders), cool-white text, cyan (#4fc3d9) as the neutral interactive accent.
- Neon = rarity/importance signal ONLY (electric cyan / neon gold / neon magenta with
  3-layer glow); common tier is matte (muted purple/green/orange). If everything glows,
  nothing is rare. Body text and chrome never glow.
- Type: Chakra Petch (display/labels, ALL CAPS + wide tracking, "//" between segments)
  + IBM Plex Mono (all numbers, readouts, terminal). Currency is CR.
- Geometry: angled corner cuts (12px panels, 7px buttons), NOT rounded. Glass HUD panels
  (rgba(20,26,36,.72) + 14px blur + cyan hairline) so the environment reads through them.
- Player is OPERATOR; rival bots are handle-named (VULT-3R, NØMAD, SPECTRE-9).

LAYOUT PHILOSOPHY (the Everdell lesson)
Like Everdell's board, this is an immersive, illustrated ENVIRONMENT with the functional
UI anchored into it as clearly-zoned overlays — not a flat dashboard. One screen shows
the entire game state and every currently-available action, spatially organized so a new
player can read "what can I do and where" without a tutorial. Rich and atmospheric, but
the neon hierarchy keeps it legible, never cluttered.

THE ENVIRONMENT
A rain-slick neon black-market district in a megacity at night — a back-alley night
bazaar: market stalls, holographic signage/kanji, hanging cables, steam, puddles
reflecting neon. Rendered in a 3/4 top-down / gentle isometric painterly-but-clean anime
style (think a GITS-toned, calmer Night City). The environment is atmospheric background;
the glass HUD zones sit on top with clear anchoring (a stall = the market, a terminal =
the deck, etc.). Muted environment so neon UI accents pop.

THE ZONES (every mechanic must have a clear home)
1. CENTRAL MARKET — the shared "NIGHT MARKET" row: 7 face-up goods cards on a lit market
   stall/counter at screen center. This is the focal point. Beside it: the DRAW DECK as a
   face-down stack of data-cards with a remaining-count, and a small DISCARD.
2. MARKET PRICES BOARD (near the market) — the value-token economy: 6 goods, each a
   DESCENDING STACK of circular value tokens (top = current payout in CR). Rare goods
   (AI Cores/cyan, Illegal Implants/gold, Stolen Corporate Data/magenta) glow; common
   goods (Pharma Contraband/purple, Cracked Software/green, Street Weaponry/orange) matte.
   Plus 3 hexagonal BONUS token stacks (×3 / ×4 / ×5+) and one unique FIXER REPUTATION
   seal token (rotated-diamond, kanji 印, magenta, strongest glow) as the end-game prize.
3. OPERATOR ZONE (bottom, the player's tableau) — your HAND of goods cards fanned along
   the bottom edge (the tableau, Everdell-style), your DRONE FLEET (a cluster of small
   drone tokens = the "camel herd" resource, not counted against hand), and your OPERATOR
   HUD: score in CR (hero mono number), hand count, fleet count.
4. RIVAL OPERATORS (an edge, top-left like Everdell's opponents) — 3 compact glass HUD
   panels for VULT-3R / NØMAD / SPECTRE-9, each showing hand count, drones, CR score, and
   an ACTIVE-TURN treatment (glowing panel + pulsing cyan dot) when it's their turn.
   Opponent hands are hidden (face-down count only).
5. ACTION DOCK — the four moves, as gameplay buttons contextual to selection:
   TAKE 1 CARD · TAKE ALL DRONES · SELL SELECTED · EXCHANGE SELECTED, plus a +/− drone
   stepper for exchanges. One system-voice button (RESET MATCH, bracketed mono).
6. TURN BANNER — slim holographic readout at top: "OPERATOR // YOUR MOVE" (cyan) /
   "VULT-3R // EXECUTING" (magenta) / "MATCH // OVER" (gray), with a pulsing status dot.
7. SYSTEM TERMINAL — a collapsible hacker-terminal log panel (mono, "> " prefixed,
   lowercase lines like "> nomad sold 3× cracked software  +11 cr") on one side.
8. Top-right utility icons: settings, log toggle, fullscreen.

MECHANICS THE LAYOUT MUST EXPRESS (spatially obvious, no text needed)
- Cards flow from DECK → MARKET → your HAND (take), and HAND → SELL for CR at the current
  token price, or HAND+DRONES ⇄ MARKET (exchange). Show these as implied directional
  relationships / connective lines or arrows in the board composition.
- Selecting card(s) lights up which actions become available (show a selected card with
  the cyan ring + lift, and the valid action buttons brightened).
- Rare vs common is readable purely by glow.
- Whose turn it is is unmistakable (active rival panel + banner).

STATES TO SHOW IN THE MOCKUP
Depict a mid-game moment: a couple of market cards selected (cyan ring), the matching
action buttons active, one rival panel in active-turn glow, token stacks partially
depleted, a few CR in the operator score, the terminal showing 3–4 recent log lines.

DELIVERABLES
- One hero desktop mockup of the full stage (annotated call-outs optional).
- A short zone map / wireframe of the same layout (boxes + labels) proving the spatial
  hierarchy reads without art.
- A one-paragraph note on mobile/portrait reflow (stack zones vertically; market row and
  hand become horizontally swipe-scrollable; rival panels collapse to a compact strip).

CONSTRAINTS
- Reuse the existing tokens/components (GlassPanel, GameCard, TokenChip, Button,
  SystemBanner) — this screen composes them, it doesn't invent a new language.
- No emoji. No exclamation marks. Numbers always mono. Neon only on rare/important.
- Legibility first: the environment must never fight the game state.
```

---

## H. Stage v2 — left price wall / center market (layout revision)

A layout revision of section G's stage: move the value-token board to a full-height **price
wall on the left**, and enthrone the **card market dead-center** as the focal point. Same
NIGHT MARKET design system and components — only the composition changes. Pairs with the
token-spend animation in [animation-prompts/01-token-pile-spend.md](animation-prompts/01-token-pile-spend.md)
(the left price wall is exactly what that animates).

```
Re-lay-out the NIGHT MARKET main game screen ("the stage"). This is a LAYOUT REVISION of the
existing stage (same design system, same components, same environment) — do NOT invent a new
visual language. Only the composition changes. Output an updated full-screen 16:9 hero mockup
plus a zone wireframe.

KEEP EXACTLY AS-IS (from the current stage):
- The NIGHT MARKET design system: navy tech-noir base, neon only on rare tier, Chakra Petch
  labels + IBM Plex Mono numbers, angled geometry, glass HUD panels, CR currency, the neon
  "Night Bazaar" environment (grid, cables, kanji signage, steam, puddle).
- The components: glass panels, GameCard, the value tokens, buttons, system banner, terminal.
- The player is OPERATOR; rivals are VULT-3R / NØMAD / SPECTRE-9.

NEW LAYOUT — the two required changes:
1) MARKET PRICES / TOKEN WALL -> LEFT SIDE. Move the value-token board to a full-height
   vertical panel down the LEFT edge: the 6 goods listed top-to-bottom, each row showing its
   translucent circuit-etched token pile with the current CR value, a mono "×N" tokens-left
   COUNT CHIP and a segmented DEPLETION GAUGE (Healthy / Low <=2 / Empty "SOLD OUT" states),
   with the 3 bonus tokens and the Fixer seal grouped at the bottom of this wall. It should
   read like a trading-floor price ticker mounted on the wall.
2) NIGHT MARKET -> CENTER, as the HEART of the board. The 7 offered goods cards sit dead-
   center as the dominant focal point — larger and more prominent than any other element,
   with a pool of light / framing that draws the eye. The draw DECK + DISCARD sit just beside
   the market. Everything else should feel arranged around this centre.

RELOCATE THE REST for balance (adjust as needed, but keep all zones present and legible):
- RIVAL OPERATORS (3 glass panels): move to the TOP / TOP-RIGHT as a compact row or stack
  (they no longer live on the left). Keep the active-turn glow + pulsing dot.
- SYSTEM TERMINAL: right rail (below/beside the rivals), collapsible.
- TURN BANNER: top-center (unchanged). Utility icons: top-right.
- OPERATOR ZONE: bottom — the fanned HAND centered under the market, the OPERATOR score/HUD
  and DRONE FLEET to one side, the ACTION DOCK (Take card / Take drones / Sell / Exchange +
  drone stepper, and the system-voice Reset) to the other.

READABILITY / MECHANICS (must still hold):
- Remaining stock in every pile is unmistakable at a glance (count chip + gauge + state tiers).
- Rare vs common readable purely by glow. Whose turn it is is unmistakable.
- The flow deck -> market -> hand, and hand -> sell (to the left price wall) still reads
  spatially; hint the sell relationship between the centre market/hand and the left token wall.
- Show a mid-game moment: a couple of market cards selected (cyan ring), matching dock buttons
  active, one rival in active-turn glow, a couple of token piles partly depleted (one Low), a
  few CR on the operator score, the terminal showing 3-4 recent lowercase log lines.

DELIVERABLES
- One hero desktop mockup of the revised stage.
- A zone wireframe (labelled boxes) proving the new hierarchy reads: LEFT price wall, CENTER
  market heart, TOP/RIGHT rivals + terminal, BOTTOM operator.
- One short note on mobile/portrait reflow (stack: market first, then price wall, hand, rivals).

CONSTRAINTS
- Compose the existing components; don't restyle them. Neon only on rare. Numbers always mono.
  No emoji, no exclamation marks. Legibility first — the environment never fights the state.
```
