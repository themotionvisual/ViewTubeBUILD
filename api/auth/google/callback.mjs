import { completeSimpleGoogleAuth } from "../../../server/simple-auth.mjs";

export default async function handler(req, res) {
  const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (String(req.method || "GET").toUpperCase() !== "GET") {
    res.writeHead(405, { "Allow": "GET", "Cache-Control": "no-store" });
    res.end();
    return;
  }
  await completeSimpleGoogleAuth({ req, res, parsedUrl });
}
