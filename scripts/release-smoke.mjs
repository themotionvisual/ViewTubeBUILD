import { chromium } from "playwright";

const baseUrl = String(process.env.VT_SMOKE_BASE_URL || "http://localhost:5173").replace(/\/$/, "");
const releaseResponse = await fetch(`${baseUrl}/api/release`, { signal: AbortSignal.timeout(5_000) });
if (!releaseResponse.ok) throw new Error(`/api/release returned HTTP ${releaseResponse.status}.`);
const release = await releaseResponse.json();
for (const key of ["app", "commit", "branch", "environment", "deployedAt", "url"]) {
  if (!(key in release)) throw new Error(`/api/release is missing ${key}.`);
}

const accountResponse = await fetch(`${baseUrl}/api/account/snapshot`, { signal: AbortSignal.timeout(5_000) });
if (!accountResponse.ok) throw new Error(`/api/account/snapshot returned HTTP ${accountResponse.status}.`);
const account = await accountResponse.json();
if (!("authentication" in account)) throw new Error("Account snapshot is missing authentication state.");

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  for (const route of ["/", "/account/connect", "/local-analytics"]) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
    if (!response?.ok()) throw new Error(`${route} returned HTTP ${response?.status() ?? "unknown"}.`);
    await page.locator("body").waitFor({ state: "visible" });
  }
  if (pageErrors.length) throw new Error(`Browser errors: ${pageErrors.join(" | ")}`);
} finally {
  await browser.close();
}

console.log(`Release smoke passed against ${baseUrl} (${release.commit}).`);
