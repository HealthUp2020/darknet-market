
## Progress tracking (Linear)

Roadmap + epics tracked in Linear.

- Team: RocketArminek (ROC)
- Project: Darknet Market — https://linear.app/rocketarminek/project/darknet-market-b191d75250a8/overview
- Epics live as issues in the project. Each carries **Size** and **Done %** in its description.
- When work maps to a roadmap epic, update the matching Linear issue (status/description) rather than tracking progress only in git.

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

**Working agreement — tests on the go.** Every new feature or bugfix lands with tests in the
same change. The test suite is a growing, permanent asset — never a one-off. This is part of DoD
(tests + CI green). Run `bun test` (or `bun test --watch` while developing) and keep it green
before considering work done.

**Independent testing by a different model.** Features are developed with Opus; tests are authored
independently by a *different* model so the developer's blind spots get covered. This runs as the
`independent-tester` subagent (`.claude/agents/independent-tester.md`, pinned `model: sonnet`) —
spawn it after a feature/fix to author/extend tests and run the suite. It writes tests only and
never modifies feature code; if a test surfaces a real bug it reports it back for the developer
model to fix. (`bun test` execution is deterministic; the point is independent test *authorship*.)

- Tests live in `tests/*.test.ts` and run with `bun test`.
- **Keep game logic pure and DOM-free so it's testable.** The rules engine is `public/engine.js`
  (no DOM, `state` passed explicitly); the renderer `public/game.js` imports from it. Tests import
  the engine directly — see `tests/engine.test.ts`. When adding gameplay, put the logic in the
  engine and cover it there; keep DOM/animation glue in `game.js`.
- Prefer deterministic states: build a controlled `state` object rather than relying on `newGame`'s
  RNG (`tests/engine.test.ts` has a `makeState` helper). Stock the `deck` so refills don't
  accidentally trigger deck-exhaustion game-end.

```ts#tests/example.test.ts
import { test, expect } from "bun:test";
import { sellCards } from "../public/engine.js";

test("selling banks the top token values", () => {
  const s = /* build a controlled state */;
  expect(sellCards(s, 0, "cloth", 2).ok).toBe(true);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.
