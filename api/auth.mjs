import { routeSimpleAuth } from "../server/simple-auth-route.mjs";

export default async function handler(req, res) {
  const method = String(req.method || "GET").toUpperCase();
  const parsedUrl = new URL(req.url || "/api/auth", `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname.replace(/\/$/, "") || "/";
  const handled = await routeSimpleAuth({ req, res, method, pathname, parsedUrl });

  if (!handled) {
    res.writeHead(404, {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    });
    res.end(JSON.stringify({ error: "Unknown authorization route." }));
  }
}
