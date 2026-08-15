# Animation — value token pile: pile-up & spend-on-sell

Prompt for Claude Design. Produces a self-contained animated HTML prototype of the NIGHT MARKET
value-token piles: how they build up, and how tokens are spent from the pile when the OPERATOR
sells goods. Review/tune the motion here, then port the keyframes into the game.

```
Design an ANIMATED PROTOTYPE for NIGHT MARKET showing the VALUE-TOKEN PILE: how tokens
pile up, and how they are spent from the pile when the OPERATOR sells goods. Output a
single self-contained HTML file (inline CSS + JS) that plays the animation and can be
replayed with a trigger, so the motion and feel can be reviewed in isolation before it is
wired into the game.

CONTEXT — the mechanic
On the "Market Prices" board, each good has a vertical STACK of translucent circuit-etched
value tokens (see TOKEN APPEARANCE below). The
TOP token shows the current CR payout for that good; the tokens beneath are the lower future
payouts (the price steps down as stock is sold). When the OPERATOR sells N cards of a good,
they collect the top N tokens as credits (CR): those tokens leave the pile, the pile settles,
and the new (lower-value) top token is revealed. This prototype animates exactly that.

DESIGN SYSTEM — match the NIGHT MARKET system exactly
- Base tech-noir navy: #0a0e16 background, #141a24 panels/token faces, #26334a borders,
  cool-white text (#e6eef7), cyan #4fc3d9 as the neutral accent.
- NEON = rarity signal only. Rare tier glows (electric cyan #00e5ff / neon gold #ffc94d /
  neon magenta #ff2d96, 3-layer glow: 0 0 6px .55 / 20px .28 / 48px .12). Common tier is
  MATTE — muted purple #8578ad / green #6fa07d / orange #b97a4b, no glow. If everything
  glows nothing is rare.
- Type: Chakra Petch for labels (ALL CAPS, wide tracking) + IBM Plex Mono for ALL numbers.
  Currency is CR. Load both from Google Fonts.
- Geometry: angled corner cuts, never rounded. Glass panel background for the board slice.

TOKEN APPEARANCE — match this physical reference (translucent circuit-etched acrylic chips)
The value tokens are modelled on real laser-cut translucent acrylic gaming tokens:
- SHAPE: an elongated hexagon / octagon with chamfered (beveled) corners — angular and
  crisp, like a laser-cut chip. NOT circular. Roughly 1.4:1 wide.
- MATERIAL: translucent, frosted-glossy acrylic that looks INTERNALLY BACKLIT — the accent
  color glows softly through the body of the token (semi-transparent, so overlapping tokens
  in a stack let the ones beneath show through faintly). A bright specular highlight rides
  the top beveled edge to sell the glassy depth.
- SURFACE ETCHING: fine engraved CIRCUIT-BOARD TRACES across the face — thin right-angled
  lines, little solder-node dots, and short branch stubs, like PCB artwork, in a slightly
  brighter tint of the token color. Some tokens (e.g. the current TOP token) carry a larger
  central circuit SIGIL/glyph.
- COLOR: the token's accent hue (rare cyan/gold/magenta, common purple/green/orange) as a
  translucent glowing body — reference photo shows an electric-blue set and an orange set.
  Rare tokens have the outer 3-layer glow; common tokens are the same translucent-acrylic
  treatment but MATTE (no outer glow), just the internal color.
- VALUE: engraved into the token in IBM Plex Mono, glowing in the accent color; the TOP token
  is larger and carries the value + the central sigil.
- STACK: tokens overlap vertically as thin beveled slivers (column-reverse, each peeking
  ~6px above the one below); because they're translucent the stack reads as layered glass.

REMAINING-AMOUNT READOUT — players MUST read "how many tokens are left" at a glance
This is the core requirement: across all piles at once, remaining stock must be unmistakable.
Use three redundant channels per pile:
1) COUNT CHIP (primary, precise): a mono "×N" badge on/under each pile = exact tokens left.
   It ROLLS DOWN by the number spent on each sale. This is the definitive readout.
2) DEPLETION GAUGE (at-a-glance): a slim SEGMENTED bar up the side of the stack — one lit
   segment per remaining token (or proportional fill vs. the pile's starting height) — so a
   player can scan which goods are running dry without reading any numbers.
3) STACK HEIGHT (texture): the visible sliver stack shrinks as tokens are spent (cap the
   rendered slivers at ~5 and show a small "+k" if more, but the COUNT CHIP always states
   the true N).
Also show each pile's CURRENT top value (CR) prominently — value + count together drive the
sell decision.
STATE TIERS (color + behavior):
- HEALTHY: normal accent.
- LOW (N <= 2): count chip + gauge shift to a warning tint and the top token gives a slow
  pulse — "almost sold out".
- EMPTY (N = 0): the slot collapses to a dashed "—" with a desaturated "SOLD OUT" micro-label;
  that good can no longer be sold. Make this state visually final and obvious.

MOTION LANGUAGE (use throughout)
Fast and damped: durations 120–320ms, easing cubic-bezier(.2,.9,.25,1). No bounces, no
springy overshoot. Glow intensifies on lift; a pulsing dot marks any "active" state.

SCENE
A slice of the glass "Market Prices" board showing 3 good piles side by side, each with its
top CR value, its "×N" COUNT CHIP and its DEPLETION GAUGE:
- a RARE pile with plenty of stock (glowing, e.g. AI Cores / cyan, top value 7, ×7 left);
- a COMMON pile mid-depletion (matte, e.g. Cracked Software / green, top value 3, ×5 left);
- a pile that is nearly empty (e.g. Street Weaponry / orange, ×2 left) so the LOW and, after a
  sale, EMPTY / "SOLD OUT" states are demonstrated.
To one side, a small OPERATOR readout: "CR" with a mono number (the sink that spent tokens fly
into). A design-system gameplay button labelled "SELL ▸" (angled, cyan) re-triggers the sell
animation on a chosen pile; a small "REPLAY" resets all piles to full.

ANIMATION 1 — PILE UP (plays on load / reset)
The pile assembles: tokens settle into place from just above, staggered bottom-to-top (~40ms
apart). Each token: opacity 0->1 and translateY(-10px -> 0) into its slot, eased to rest
(no bounce). The TOP token settles last, then gives a brief accent-glow pulse as its value
ticks in. Total ~600–800ms. Reads as the pile "building".

ANIMATION 2 — SPEND ON SELL (the main effect; triggered by SELL ▸)
Selling 2 tokens from a chosen pile:
1) LIFT — the top 1–2 tokens rise off the pile: translateY up ~14px, scale 1 -> 1.06, rim
   glow intensifies. ~140ms.
2) FLY — they travel along a short eased path to the OPERATOR CR readout, shrinking (scale
   ~0.5) and fading as they arrive, with a faint cyan afterglow trail. ~320ms,
   cubic-bezier(.2,.9,.25,1). Rare tokens keep their glow in flight; common tokens do not.
3) CREDIT — as each token lands, a "+N CR" label pops at the readout (floats up ~20px and
   fades over ~500ms) and the CR number COUNTS UP by that amount in mono over ~400ms.
4) SETTLE + DEPLETE — the remaining pile shifts up to close the gap (~180ms) and the NEW top
   token is promoted (grows from sliver -> full top token, reveals its lower value with a soft
   accent flash). IN THE SAME BEAT, the remaining-amount readout updates so the loss of stock
   is unmistakable: the COUNT CHIP "×N" rolls down by the number spent (~250ms mono roll), one
   GAUGE segment extinguishes per token spent, and the sliver stack loses that many slivers.
   If the sale drops the pile into LOW or EMPTY, transition into that state here (warning tint,
   or collapse to the dashed "SOLD OUT" slot).
Choreography: overlap the steps for flow (tokens begin flying while the pile starts settling
and the count begins rolling). The player should see the token leave AND the "left in pile"
number/gauge drop as one connected motion. Keep it crisp and legible — UI feedback, not fireworks.

EDGE CASES / STATES
- Empty pile: collapses to the dashed "—" / "SOLD OUT" state (see STATE TIERS); that good can
  no longer be sold.
- prefers-reduced-motion: skip the flight; instantly update the top value, the COUNT CHIP and
  the gauge with a simple 120ms fade — the remaining amount must still update clearly.

DELIVERABLE
- One self-contained HTML file: the mini prices board (2–3 piles) + OPERATOR CR readout +
  SELL ▸ and REPLAY controls.
- Loops / replays cleanly.
- Comment the CSS/JS with the exact durations + easings used, and include a short spec block
  at the top listing each keyframe (name, property changes, duration, easing) so it can be
  lifted directly into the game.

CONSTRAINTS
- Fully self-contained: inline CSS + JS. Fonts from Google Fonts CDN (Chakra Petch, IBM Plex
  Mono). NO animation libraries — hand-rolled CSS @keyframes + the Web Animations API only,
  so it ports into the vanilla-JS game unchanged.
- Numbers always IBM Plex Mono. Neon only on rare tier. No emoji, no exclamation marks.
```
