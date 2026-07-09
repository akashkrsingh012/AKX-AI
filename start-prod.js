const { spawn } = require("child_process");
const path = require("path");

const backendServices = [
  { name: "Gateway", dir: "backend/gateway", command: "node", args: ["index.js"], delay: 0 },
  { name: "Auth Service", dir: "backend/services/auth", command: "node", args: ["index.js"], delay: 500 },
  { name: "Chat Service", dir: "backend/services/chat", command: "node", args: ["index.js"], delay: 500 },
  { name: "Agent Service", dir: "backend/services/agent", command: "node", args: ["index.js"], delay: 500 },
  { name: "Billing Service", dir: "backend/services/billing", command: "node", args: ["index.js"], delay: 500 },
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

console.log("Starting AKX AI Production Backend Services...");

backendServices.forEach((service) => {
  setTimeout(() => startService(service), service.delay);
});

process.on("SIGINT", () => {
  console.log("\n[System] Shutting down all processes...");
  children.forEach(({ name, process: child }) => {
    console.log(`[System] Killing ${name}...`);
    child.kill("SIGINT");
  });
  process.exit();
});
