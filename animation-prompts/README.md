# Animation prompts

Claude Design prompts for crafting NIGHT MARKET's animations as **isolated, self-contained
HTML prototypes** — so the motion can be reviewed and tuned on its own before being wired
into the game.

Ground rules for every prompt in this folder (so the output ports cleanly into the vanilla
HTML/CSS/JS game, which has no animation library):
- **No external animation libraries** — hand-rolled CSS `@keyframes` + the Web Animations API only.
- Match the NIGHT MARKET design system (tokens in `../ui-mockups/tokens/`): navy tech-noir base,
  neon only on rare tier, Chakra Petch labels + IBM Plex Mono numbers, angled geometry, CR currency.
- Follow the design system's **motion language**: fast + damped, 120–260ms, `cubic-bezier(.2,.9,.25,1)`,
  pulsing dot for active state, **no bounces/overshoot**.
- Always honor `prefers-reduced-motion` (fall back to instant state changes).
- Each prototype should **loop / be replayable** and include a comment block listing the exact
  keyframes / durations / easings as a spec, so they lift straight into `public/game.js` + `public/style.css`.

See the general animation approach discussion in the chat, and the broader design prompts in
[../DESIGN_PROMPTS.md](../DESIGN_PROMPTS.md).

## Index
- `01-token-pile-spend.md` — value tokens piling up, and being spent from the pile on a Sell.

### Everdell-style motion set (Dire Wolf feel — gentle, tactile, arcing, weighty)
- `00-everdell-motion.md` — **shared motion spec** — paste at the top of every `02`–`06` prompt.
- `02-card-deal-in.md` — market deals its 7 cards in an arcing, staggered cascade.
- `03-take-card-to-hand.md` — a card arcs from the market into the fanned hand.
- `04-sell-collect.md` — sold value tokens arc to the CR readout (Everdell re-flavour of the spend anim).
- `05-card-hover-select.md` — tactile hover-lift, select-glow, and idle "breathing" of interactive cards.
- `06-turn-transition.md` — smooth turn/phase handoff (Everdell "season change" feel).
