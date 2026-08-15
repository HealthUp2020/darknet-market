# Background prompts

Claude Design prompts for the NIGHT MARKET **stage background** — the environment that sits
behind the play surface. Delivered as self-contained, parallax-layered HTML so the layers can be
wired straight into the game's `.env` background.

Core principle: the center card market is the hero. The background frames it with perspective +
haze and keeps the center dark and calm; all detail lives at the far distance and edges.
No real-world text — an invented faction-sigil / glyph system replaces all signage.

All three variants share the **teal + orange** palette (matching the acrylic token art) and the
same layered build; they differ only in **density / mood**.

## Index
- `00-background-spec.md` — **shared spec** — paste at the top of every variant prompt.
- `01-calm-foggy.md` — Option A · haze + negative space, sparse neon. Safest, most premium.
- `02-alive-neon.md` — Option B · dense living neon street in the far layers. Most vibrant.
- `03-industrial-vault.md` — Option C · robotic logistics bay, terminal crates, secured vault. Coldest.

Generate all three, drop them in the `game` folder, and I'll wire each behind the stage so you can
A/B/C them on localhost.
