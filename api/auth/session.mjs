import { readSimpleSession } from "../../server/simple-auth.mjs";

export default async function handler(req, res) {
  if (String(req.method || "GET").toUpperCase() !== "GET") {
    res.writeHead(405, { "Allow": "GET", "Cache-Control": "no-store" });
    res.end();
    return;
  }
  await readSimpleSession({ req, res });
}
