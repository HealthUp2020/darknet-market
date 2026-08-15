import index from "./public/index.html";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index,
  },
  // Serve static files from ./public (e.g. iframe background variants in /backgrounds)
  async fetch(req) {
    const { pathname } = new URL(req.url);
    if (pathname === "/" || pathname.includes("..")) return new Response("Not found", { status: 404 });
    const file = Bun.file("./public" + pathname);
    if (await file.exists()) return new Response(file);
    return new Response("Not found", { status: 404 });
  },
  development: {
    // HMR is disabled: Bun's HMR client double-evaluates PixiJS's side-effectful
    // extension registration, throwing "Extension type mask-effect already has a handler".
    hmr: false,
    console: true,
  },
});

console.log(`NETRUNNER://BLACK_MARKET — http://localhost:${server.port}`);
