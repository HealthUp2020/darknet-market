# Everdell-style motion language (shared spec)

Paste this block at the **top of every** Everdell-style element prompt in this folder
(`02`–`06`). It ports the *motion feel* of Everdell (Dire Wolf Digital) onto NIGHT MARKET's
cyberpunk visuals — gentle, tactile, arcing, weighty, sequenced — **without** importing its
forest/paper art. This deliberately supersedes the design system's earlier "fast + damped,
no bounce, 120–320ms" spec for these animations (Everdell is slower and has a soft settle).

```
MOTION LANGUAGE — "Everdell-style" (Dire Wolf) adapted to NIGHT MARKET
Replicate Everdell's digital MOTION feel, NOT its art. Keep the NIGHT MARKET visuals exactly
(neon tech-noir, glass, angled geometry, Chakra Petch + IBM Plex Mono, CR). Do NOT add forest/
paper/organic art. Only the way things MOVE becomes Everdell-like:
- Character: gentle, tactile, unhurried, weighty, sequenced. Pieces feel physically handled —
  lifted, arced through the air, set down with a soft settle. Satisfying, never snappy/arcade.
- Easing: smooth ease-in-out, cubic-bezier(.34,.08,.16,1). Landings add a GENTLE settle — a
  ~4–6% overshoot that damps in ONE small step (tasteful weight, never a cartoon spring).
- Anticipation: a tiny lift + scale (~1.03) before a piece travels; a soft squash (scaleY ~.96
  →1) on landing.
- Duration: slower, breathing — travel 340–520ms; micro (hover/press) 150–200ms; sequences
  stagger 70–90ms between items.
- Travel path: ARCING (curved), not straight — like a hand placing a card. The piece rises (z-lift
  + shadow grows softer/larger) at pickup and lowers (shadow tightens) on landing.
- Feedback: valid targets BREATHE with a soft neon glow (slow 1.8s pulse). Hover = gentle lift +
  shadow + faint accent glow. Selection = steady lift + glow. No harsh flashes/strobe.
- Neon restraint: accents brighten gently during motion, never strobe. Rare-tier keeps its glow.
- Respect prefers-reduced-motion: cross-fades / instant state, no travel.
Self-contained HTML (inline CSS + JS, Google Fonts only, NO libraries — CSS @keyframes + Web
Animations API). Loop/replayable. Include a comment SPEC block (keyframe · props · duration · easing).
```

Colour/type tokens to keep consistent: bg `#0a0e16` / panel `#141a24` / border `#26334a`;
rare cyan `#00e5ff`, gold `#ffc94d`, magenta `#ff2d96`; common purple `#8578ad`, green `#6fa07d`,
orange `#b97a4b`; Chakra Petch labels + IBM Plex Mono numbers; currency CR.
