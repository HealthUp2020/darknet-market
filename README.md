# NIGHT MARKET

A cyberpunk trading card game — a 4-player, best-of-3 reskin of a Jaipur-inspired market game,
built with [Bun](https://bun.com). You play the OPERATOR against three rival machines, cornering
the supply of contraband goods.

**▶ Play: https://healthup2020.github.io/night-market/**

## Develop

```bash
bun run dev      # dev server with the Bun HTML bundler (http://localhost:3000)
bun test         # test suite (pure engine, bots, layout, match, persistence)
bun run sim      # bot balance simulation
```

- Game logic is a **pure, DOM-free engine** in `public/engine.js` (+ `strategies.js`, `layout.js`,
  `persistence.js`); the renderer is `public/game.js`. Tests import the engine directly.
- Bots: `easy` (reckless) · `normal` (heuristic) · `hard` (1-ply lookahead). See `BOT_LOGIC.md`.

## Deploy (GitHub Pages)

GitHub Pages is static-only, so the game ships as a static bundle (no Bun server):

```bash
bun run build    # -> dist/ (minified bundle + backgrounds + .nojekyll)
```

`.github/workflows/deploy.yml` runs on every push to `main`: it runs `bun test`, builds, and
deploys `dist/` to Pages. A red test suite blocks the deploy.
