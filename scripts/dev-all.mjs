import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const accountPort = Number(process.env.BILLING_PORT || 3000);
const accountHealthUrl = `http://localhost:${accountPort}/api/account/snapshot`;
const appHealthUrl = "http://localhost:5173/api/account/snapshot";
const modeIndex = process.argv.indexOf("--mode");
const mode = modeIndex >= 0 ? process.argv[modeIndex + 1] : "development";

if (!Number.isInteger(accountPort) || accountPort <= 0 || accountPort > 65_535) {
  throw new Error(`Invalid BILLING_PORT: ${process.env.BILLING_PORT}`);
}
if (mode !== "development" && mode !== "staging") {
  throw new Error(`Unsupported development mode: ${mode}`);
}

const children = [];
let shuttingDown = false;
let resolveTermination;
const termination = new Promise((resolve) => {
  resolveTermination = resolve;
});

const colorPrefix = (name, color) => `\x1b[${color}m[${name}]\x1b[0m`;

const pipeWithPrefix = (stream, target, prefix) => {
  let pending = "";
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    const lines = `${pending}${chunk}`.split(/\r?\n/);
    pending = lines.pop() || "";
    for (const line of lines) target.write(`${prefix} ${line}\n`);
  });
  stream.on("end", () => {
    if (pending) target.write(`${prefix} ${pending}\n`);
  });
};

const isRunning = (child) => child.exitCode === null && child.signalCode === null;

const waitForExit = (child) => {
  if (!isRunning(child)) return Promise.resolve();
  return new Promise((resolve) => child.once("exit", resolve));
};

const shutdown = async (exitCode = 0) => {
  if (shuttingDown) return termination;
  shuttingDown = true;

  for (const { child } of children) {
    if (isRunning(child)) child.kill("SIGTERM");
  }

  const forceKillTimer = setTimeout(() => {
    for (const { child } of children) {
      if (isRunning(child)) child.kill("SIGKILL");
    }
  }, 2_000);
  forceKillTimer.unref();

  await Promise.all(children.map(({ child }) => waitForExit(child)));
  clearTimeout(forceKillTimer);
  process.exitCode = exitCode;
  resolveTermination();
  return termination;
};

const run = (name, args, color) => {
  const prefix = colorPrefix(name, color);
  const child = spawn(npmCommand, args, {
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
    shell: false,
  });
  children.push({ name, child });

  pipeWithPrefix(child.stdout, process.stdout, prefix);
  pipeWithPrefix(child.stderr, process.stderr, prefix);

  child.on("error", (error) => {
    process.stderr.write(`${prefix} failed to start: ${error.message}\n`);
    if (!shuttingDown) void shutdown(1);
  });
  child.on("exit", (code, signal) => {
    process.stdout.write(`${prefix} exited (${code ?? signal ?? "unknown"})\n`);
    if (!shuttingDown) void shutdown(code === 0 ? 1 : (code ?? 1));
  });

  return child;
};

const delay = (milliseconds) => new Promise((resolve) => {
  setTimeout(resolve, milliseconds);
});

const waitForAccountSnapshot = async (url, label, child, timeoutMs = 15_000) => {
  const startedAt = Date.now();
  let lastFailure = "no response";

  while (Date.now() - startedAt < timeoutMs) {
    if (!isRunning(child)) throw new Error(`${label} exited before becoming healthy.`);
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(1_000),
      });
      const snapshot = await response.json().catch(() => null);
      if (response.ok && snapshot?.authentication) return;
      lastFailure = `HTTP ${response.status}`;
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error);
    }
    await delay(150);
  }

  throw new Error(`${label} failed its account health check: ${lastFailure}`);
};

process.on("SIGINT", () => void shutdown(0));
process.on("SIGTERM", () => void shutdown(0));

const main = async () => {
  const api = run("api", ["run", "api:dev"], "35");
  await waitForAccountSnapshot(accountHealthUrl, "Account/API server", api);
  process.stdout.write(`${colorPrefix("stack", "32")} account API ready on ${accountHealthUrl}\n`);

  const webScript = mode === "staging" ? "dev:staging:web" : "dev:web";
  const web = run("vite", ["run", webScript], "36");
  await waitForAccountSnapshot(appHealthUrl, "Vite account proxy", web);
  process.stdout.write(`${colorPrefix("stack", "32")} ViewTube ready on http://localhost:5173\n`);

  await termination;
};

try {
  await main();
} catch (error) {
  process.stderr.write(`${colorPrefix("stack", "31")} ${error instanceof Error ? error.message : String(error)}\n`);
  if (!shuttingDown) await shutdown(1);
  else await termination;
}
