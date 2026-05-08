import { spawn } from "node:child_process";

const children = [];

const run = (name, cmd, args, color) => {
  const child = spawn(cmd, args, {
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
    shell: false,
  });
  children.push(child);

  const prefix = `\x1b[${color}m[${name}]\x1b[0m`;
  child.stdout.on("data", (chunk) => process.stdout.write(`${prefix} ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`${prefix} ${chunk}`));
  child.on("exit", (code) => {
    process.stdout.write(`${prefix} exited (${code ?? "null"})\n`);
    shutdown();
  });
};

const shutdown = () => {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
};

process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});

run("vite", process.platform === "win32" ? "npm.cmd" : "npm", ["run", "dev"], "36");
run(
  "billing",
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["run", "billing:dev"],
  "35",
);
