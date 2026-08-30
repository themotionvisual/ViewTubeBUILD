import {
  beginSimpleGoogleAuth,
  completeSimpleGoogleAuth,
  logoutSimpleSession,
  readSimpleSession,
} from "./simple-auth.mjs";

const REWRITE_OPERATION_PARAM = "__vt_auth_operation";

const SIMPLE_AUTH_ROUTES = Object.freeze({
  "/api/auth-start": { operation: "start", method: "GET" },
  "/api/auth/google/start": { operation: "start", method: "GET" },
  "/api/auth-callback": { operation: "callback", method: "GET" },
  "/api/auth/google/callback": { operation: "callback", method: "GET" },
  "/api/auth-session": { operation: "session", method: "GET" },
  "/api/auth/session": { operation: "session", method: "GET" },
  "/api/auth-logout": { operation: "logout", method: "POST" },
  "/api/auth/logout": { operation: "logout", method: "POST" },
});

const OPERATION_METHODS = Object.freeze({
  start: "GET",
  callback: "GET",
  session: "GET",
  logout: "POST",
});

export const resolveSimpleAuthOperation = ({ pathname, parsedUrl }) => {
  const rewrittenOperation = String(
    parsedUrl?.searchParams?.get(REWRITE_OPERATION_PARAM) || "",
  ).trim();
  if (rewrittenOperation in OPERATION_METHODS) return rewrittenOperation;
  return SIMPLE_AUTH_ROUTES[pathname]?.operation || null;
};
export const expectedSimpleAuthMethod = (operation) =>
  OPERATION_METHODS[operation] || null;

export const routeSimpleAuth = async ({ req, res, method, pathname, parsedUrl }) => {
  const operation = resolveSimpleAuthOperation({ pathname, parsedUrl });
  if (!operation) return false;

  const expectedMethod = expectedSimpleAuthMethod(operation);
  if (method !== expectedMethod) {
    res.writeHead(405, {
      Allow: expectedMethod,
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    });
    res.end(JSON.stringify({ error: `Method ${method} is not allowed for this authorization route.` }));
    return true;
  }

  if (operation === "start") {
    await beginSimpleGoogleAuth({ req, res, parsedUrl });
    return true;
  }
  if (operation === "callback") {
    await completeSimpleGoogleAuth({ req, res, parsedUrl });
    return true;
  }
  if (operation === "session") {
    await readSimpleSession({ req, res });
    return true;
  }

  await logoutSimpleSession({ req, res });
  return true;
};
