const { spawn } = require("child_process");
const path = require("path");

// Single unified server — no gateway needed.
// Auth service now mounts all routes (auth, chat, agent, billing) in one process.
const services = [
  { name: "Server", dir: "backend/services/auth", command: "node", args: ["index.js"], delay: 0 },
];

const children = [];

function startService(service) {
  const absoluteDir = path.resolve(__dirname, service.dir);
  console.log(`[System] Starting ${service.name} in ${service.dir}...`);

  const child = spawn(service.command, service.args, {
    cwd: absoluteDir,
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "production", FORCE_COLOR: "1" },
  });

  children.push({ name: service.name, process: child });

  child.stdout.on("data", (data) => {
    data
      .toString()
      .split("\n")
      .forEach((line) => {
        if (line.trim()) console.log(`[${service.name}] ${line}`);
      });
  });

  child.stderr.on("data", (data) => {
    data
      .toString()
      .split("\n")
      .forEach((line) => {
        if (line.trim()) console.error(`[${service.name}] ${line}`);
      });
  });

  child.on("close", (code) => {
    console.log(`[System] ${service.name} process exited with code ${code}`);
    if (code !== 0 && code !== null) {
      console.log(`[System] Restarting ${service.name} in 3 seconds...`);
      setTimeout(() => startService(service), 3000);
    }
  });
}

console.log("Starting AKX AI Production Server...");

services.forEach((service) => {
  setTimeout(() => startService(service), service.delay);
});

process.on("SIGINT", () => {
  console.log("\n[System] Shutting down...");
  children.forEach(({ name, process: child }) => {
    console.log(`[System] Killing ${name}...`);
    child.kill("SIGINT");
  });
  process.exit();
});
