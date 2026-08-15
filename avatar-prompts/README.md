# Operator avatar prompts (ROC-213)

Claude Design prompts for the four operator **robot avatars** — characterful salvage-machine
portraits (NieR:Automata "machine lifeform" vibe) replacing the generic avatar glyphs in the
rival panels + operator HUD (and menu/end screens where avatars appear).

Same pipeline as `../background-prompts` and the card art: Kasia generates in Claude Design,
delivers the assets, and they get wired into `public/game.js` (`rivalHTML` / operator HUD).

- `00-operator-machines.md` — shared style spec + the four distinct operator variants.

**Deliverable format:** four **square** avatar portraits (head + shoulders/upper torso), transparent
background, consistent front-lit angle, sized to read at a small chip (~40–64px). Prefer
self-contained **SVG** (crisp + tintable) if practical; transparent PNG otherwise.
