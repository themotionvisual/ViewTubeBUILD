import { beginSimpleGoogleAuth } from "../server/simple-auth.mjs";

export default async function handler(req, res) {
  if (String(req.method || "GET").toUpperCase() !== "GET") {
    res.writeHead(405, { Allow: "GET", "Cache-Control": "no-store" });
    res.end();
    return;
  }
  const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  await beginSimpleGoogleAuth({ req, res, parsedUrl });
}
