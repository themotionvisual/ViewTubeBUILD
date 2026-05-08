import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const envPath = path.join(cwd, ".env");
const localEnvPath = path.join(cwd, ".env.local");

const REQUIRED = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_CREATOR_PLUS",
  "STRIPE_PRICE_PRO_INTELLIGENCE",
  "STRIPE_PRICE_BUSINESS_TEAM",
  "STRIPE_PRICE_TOPUP_5",
  "STRIPE_PRICE_TOPUP_10",
  "STRIPE_PRICE_TOPUP_25",
  "VITE_BILLING_API_BASE",
];

const readKeyValues = (filePath) => {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split("\n")) {
    const clean = line.trim();
    if (!clean || clean.startsWith("#")) continue;
    const idx = clean.indexOf("=");
    if (idx <= 0) continue;
    const key = clean.slice(0, idx).trim();
    const value = clean.slice(idx + 1).trim();
    out[key] = value;
  }
  return out;
};

const local = readKeyValues(localEnvPath);
const base = readKeyValues(envPath);
const merged = { ...base, ...local, ...process.env };

const missing = REQUIRED.filter((k) => !String(merged[k] || "").trim());

console.log("ViewTubeX Billing Env Check");
console.log(`cwd: ${cwd}`);
console.log(`sources: ${fs.existsSync(envPath) ? ".env " : ""}${fs.existsSync(localEnvPath) ? ".env.local" : ""}`.trim() || "sources: process.env only");
console.log("");

if (missing.length === 0) {
  console.log("PASS: all required billing vars are present.");
  process.exit(0);
}

console.log("MISSING:");
for (const key of missing) {
  console.log(`- ${key}`);
}
console.log("");
console.log("Next:");
console.log("1) Copy .env.billing.example to .env.local");
console.log("2) Fill Stripe keys + price ids");
console.log("3) Re-run: npm run billing:check-env");
process.exit(1);
