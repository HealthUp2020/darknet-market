# NIGHT MARKET background — shared spec

Paste this block at the top of each of the three background variant prompts
(`01`–`03`). They differ ONLY in density/mood; everything below is common.

```
SHARED SPEC — NIGHT MARKET stage background
Build the STAGE BACKGROUND for a cyberpunk black-market card game (Ghost in the Shell / Cyberpunk
2077 tone). This sits BEHIND the play surface, so it must stay dark and calm in the CENTER (a card
market sits there) and push all detail to the EDGES and FAR DISTANCE. It frames the game; it never
competes with it.

Composition / framing:
- One-point PERSPECTIVE CORRIDOR receding to a vanishing point in the upper-center, so the middle
  reads as a bright, empty "pocket" where the cards will sit. Left and right walls recede back.
- Keep the lower-center + center clear and low-contrast. Heaviest detail lives top, far, and edges.

Build as PARALLAX LAYERS (back → front), each a separate element so it can be wired into the game:
1. Far skyline — blurred neon city, heavy bokeh, barely moves.
2. Volumetric light shaft — an overhead beam down the center, SLOWLY breathing (intensity pulse).
3. Corridor architecture — receding machines / crates / structures, soft focus, desaturated.
4. Atmosphere — drifting fog + falling rain; a drone silhouette crosses the corridor ~every 20s.
5. Wet-floor reflection — the neon reflected on a wet ground plane below (subtle shimmer). REQUIRED —
   this sells the look more than anything.
6. Foreground grime — vignette, faint scanlines / CRT bloom, dust motes drifting in the light shaft.

Palette — TEAL + ORANGE (must match the game's blue/orange acrylic tokens):
- Cool teal/cyan world light; base bg #0a0e16, panel-dark #141a24.
- Warm ORANGE faction accents (signage, stencils, hot machine glow).
- Rare-tier cyan #00e5ff highlights used sparingly.

NO REAL-WORLD TEXT — replace all Chinese/Japanese/real signage with an INVENTED visual language:
- A recurring FACTION SIGIL = the circuit-etched glyph on the game's orange tokens; repeat it as neon
  signage, floor stencils, and crate stamps for cohesion.
- Abstract angular alien glyphs on the neon signs (unreadable, atmospheric only).
- Recolored terminal "code-rain" readouts + barcodes / dot-matrix / hex blocks as surface texture.

Motion (all SLOW, peripheral, never near center): light-shaft breathing, rain + drifting fog, a
crossing drone every ~20s, faint neon flicker/buzz, floor-reflection shimmer.

Deliverable: ONE self-contained HTML file (inline CSS + JS, Google Fonts only, NO libraries — CSS
@keyframes + Web Animations API), sized 1600×900, looping. Honor prefers-reduced-motion (freeze
motion, keep the still composition). Include a comment SPEC block listing the layers + their
animations (property · duration · easing).
```
