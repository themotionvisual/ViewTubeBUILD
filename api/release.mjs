import { getReleaseMetadata } from "../server/release-metadata.mjs";

export default async function handler(req, res) {
  if (String(req.method || "GET").toUpperCase() !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json(getReleaseMetadata());
}
