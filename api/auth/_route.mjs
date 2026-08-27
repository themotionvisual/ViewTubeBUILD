import {
  beginSimpleGoogleAuth,
  completeSimpleGoogleAuth,
  logoutSimpleSession,
  readSimpleSession,
} from "../../server/simple-auth.mjs";

export const routeSimpleAuth = async (req, res) => {
  const method = String(req.method || "GET").toUpperCase();
  const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname.replace(/\/$/, "") || "/";

  if (method === "GET" && pathname === "/api/auth/google/start") {
    await beginSimpleGoogleAuth({ req, res, parsedUrl });
    return;
  }
  if (method === "GET" && pathname === "/api/auth/google/callback") {
    await completeSimpleGoogleAuth({ req, res, parsedUrl });
    return;
  }
  if (method === "GET" && pathname === "/api/auth/session") {
    await readSimpleSession({ req, res });
    return;
  }
  if (method === "POST" && pathname === "/api/auth/logout") {
    await logoutSimpleSession({ req, res });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify({ error: "Not found." }));
};
