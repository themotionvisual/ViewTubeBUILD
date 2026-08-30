import assert from "node:assert/strict";
import test from "node:test";
import {
  expectedSimpleAuthMethod,
  resolveSimpleAuthOperation,
  routeSimpleAuth,
} from "./simple-auth-route.mjs";

const parsed = (value) => new URL(value, "https://viewtube.live");

test("flat and compatibility auth paths resolve to one router", () => {
  const cases = [
    ["/api/auth-start", "start"],
    ["/api/auth/google/start", "start"],
    ["/api/auth-callback", "callback"],
    ["/api/auth/google/callback", "callback"],
    ["/api/auth-session", "session"],
    ["/api/auth/session", "session"],
    ["/api/auth-logout", "logout"],
    ["/api/auth/logout", "logout"],
  ];

  for (const [pathname, operation] of cases) {
    assert.equal(resolveSimpleAuthOperation({ pathname, parsedUrl: parsed(pathname) }), operation);
  }
});
test("Vercel rewrite operation preserves the public flat URL contract", () => {
  const parsedUrl = parsed("/api/auth?__vt_auth_operation=callback&state=state-1&code=code-1");
  assert.equal(resolveSimpleAuthOperation({ pathname: "/api/auth", parsedUrl }), "callback");
  assert.equal(parsedUrl.searchParams.get("state"), "state-1");
  assert.equal(parsedUrl.searchParams.get("code"), "code-1");
});

test("auth operations enforce their public methods", async () => {
  assert.equal(expectedSimpleAuthMethod("start"), "GET");
  assert.equal(expectedSimpleAuthMethod("callback"), "GET");
  assert.equal(expectedSimpleAuthMethod("session"), "GET");
  assert.equal(expectedSimpleAuthMethod("logout"), "POST");

  let status = 0;
  let headers = {};
  let body = "";
  const res = {
    writeHead(nextStatus, nextHeaders) {
      status = nextStatus;
      headers = nextHeaders;
    },
    end(nextBody = "") {
      body = String(nextBody);
    },
  };
  const parsedUrl = parsed("/api/auth-logout");
  const handled = await routeSimpleAuth({
    req: { headers: {} },
    res,
    method: "GET",
    pathname: "/api/auth-logout",
    parsedUrl,
  });

  assert.equal(handled, true);
  assert.equal(status, 405);
  assert.equal(headers.Allow, "POST");
  assert.match(body, /not allowed/i);
});

test("unrelated API paths are not claimed by the auth router", async () => {
  const handled = await routeSimpleAuth({
    req: { headers: {} },
    res: {},
    method: "GET",
    pathname: "/api/release",
    parsedUrl: parsed("/api/release"),
  });
  assert.equal(handled, false);
});
