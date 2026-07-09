const { spawn, execSync } = require("child_process");
const path = require("path");

const frontendPort = process.env.FRONTEND_PORT || process.env.VITE_PORT || 3000;
const APP_URL = process.env.APP_URL || `http://localhost:${frontendPort}`;

const backendServices = [
  { name: "Gateway", dir: "backend/gateway", command: "npm", args: ["run", "dev"], delay: 0 },
  { name: "Auth Service", dir: "backend/services/auth", command: "npm", args: ["run", "dev"], delay: 800 },
  { name: "Chat Service", dir: "backend/services/chat", command: "npm", args: ["run", "dev"], delay: 800 },
  { name: "Agent Service", dir: "backend/services/agent", command: "npm", args: ["run", "dev"], delay: 800 },
  { name: "Billing Service", dir: "backend/services/billing", command: "npm", args: ["run", "dev"], delay: 800 },
];

const frontendService = {
  name: "Frontend",
  dir: "frontend",
  command: "npm",
  args: ["run", "dev"],
  delay: 2000,
  env: { VITE_PORT: String(frontendPort) },
};

const children = [];

// Kill any process holding a port (macOS/Linux)
function freePort(port) {
  try {
    const result = execSync(`lsof -ti :${port}`, { stdio: ["pipe", "pipe", "pipe"] })
      .toString()
      .trim();
    if (result) {
      const pids = result.split("\n").filter(Boolean);
      pids.forEach((pid) => {
        try {
          execSync(`kill -9 ${pid}`, { stdio: "ignore" });
          console.log(`[System] Freed port ${port} (killed PID ${pid})`);
        } catch (_) {}
      });
    }
  } catch (_) {
    // No process on port — that's fine
  }
}

function startService(service) {
  const absoluteDir = path.resolve(__dirname, service.dir);
  console.log(`[System] Starting ${service.name} in ${service.dir}...`);

  const child = spawn(service.command, service.args, {
    cwd: absoluteDir,
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, FORCE_COLOR: "1", ...(service.env || {}) },
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
      // For the frontend, free the port before retrying
      if (service.name === "Frontend") {
        console.log(`[System] Freeing port ${frontendPort} before restarting Frontend...`);
        freePort(frontendPort);
      }
      console.log(`[System] Restarting ${service.name} in 3 seconds...`);
      setTimeout(() => startService(service), 3000);
    }
  });
}

// Free port 3000 once at startup in case a stale process is holding it
freePort(frontendPort);

console.log("Starting AKX AI...");
console.log(`Application URL: ${APP_URL}`);
console.log("Internal services run on ports 8000-8004 (not exposed to browser).\n");

backendServices.forEach((service) => {
  setTimeout(() => startService(service), service.delay);
});

setTimeout(() => {
  startService(frontendService);
  console.log(`\nOpen ${APP_URL} in your browser once all services are ready.\n`);
}, frontendService.delay);

process.on("SIGINT", () => {
  console.log("\n[System] Shutting down all processes...");
  children.forEach(({ name, process: child }) => {
    console.log(`[System] Killing ${name}...`);
    child.kill("SIGINT");
  });
  process.exit();
});
