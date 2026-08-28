import { logoutSimpleSession } from "../../server/simple-auth.mjs";

export default async function handler(req, res) {
  if (String(req.method || "POST").toUpperCase() !== "POST") {
    res.writeHead(405, { "Allow": "POST", "Cache-Control": "no-store" });
    res.end();
    return;
  }
  await logoutSimpleSession({ req, res });
}
