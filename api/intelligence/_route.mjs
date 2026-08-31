import { handleIntelligenceReportRoute } from "../../server/intelligence-report.mjs";

const readBody = async (req, maxBytes = Number.POSITIVE_INFINITY) => new Promise((resolve, reject) => {
  const chunks = [];
  let size = 0;
  req.on("data", (chunk) => {
    size += chunk.length;
    if (size > maxBytes) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      reject(error);
      return;
    }
    chunks.push(chunk);
  });
  req.on("error", reject);
  req.on("end", () => resolve(Buffer.concat(chunks)));
});

const json = (res, status, payload) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(payload));
};

export const routeIntelligenceRequest = async (req, res) => {
  const method = String(req.method || "GET").toUpperCase();
  const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname.replace(/\/$/, "") || "/";
  if (method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Cache-Control": "no-store" });
    res.end();
    return;
  }
  try {
    const handled = await handleIntelligenceReportRoute({ req, res, method, pathname, parsedUrl, json, readBody });
    if (!handled && !res.writableEnded) json(res, 404, { error: `Not found: ${method} ${pathname}` });
  } catch (error) {
    if (!res.writableEnded) json(res, Number(error?.statusCode) || 500, { error: error instanceof Error ? error.message : "Intelligence request failed." });
  }
};

export default routeIntelligenceRequest;

