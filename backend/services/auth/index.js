import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// Import DB connections from all services to ensure each service's Mongoose instance is connected
import connectDB from "./config/db.js";
import connectChatDB from "../chat/config/db.js";
import connectAgentDB from "../agent/config/db.js";
import connectBillingDB from "../billing/config/db.js";

import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
import { protect } from "./middleware/auth.middleware.js";
import { getMe } from "./controllers/auth.controllers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load this service's env first, then overlay sibling service envs
// so all env vars (Razorpay, AI keys, etc.) are available in the unified process.
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../chat/.env"), override: false });
dotenv.config({ path: path.resolve(__dirname, "../agent/.env"), override: false });
dotenv.config({ path: path.resolve(__dirname, "../billing/.env"), override: false });

const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const port = Number(process.env.PORT) || (isProduction ? 10000 : 8001);

const app = express();

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

// ── Auth routes ─────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);

// /api/me  →  returns the currently-authenticated user (from DB via protect)
app.get("/api/me", protect, getMe);

// ── Middleware that injects x-user-id for downstream routers ────────────────
// Must come AFTER protect so req.user is populated
const injectUserId = (req, res, next) => {
  if (req.user) {
    req.headers["x-user-id"] = req.user._id?.toString() || req.user.userId?.toString() || "";
  }
  next();
};

// ── Chat routes ──────────────────────────────────────────────────────────────
const { default: chatRouter } = await import("../chat/routes/chat.routes.js");
app.use("/api/chat", protect, injectUserId, chatRouter);

// ── Agent routes ─────────────────────────────────────────────────────────────
globalThis.DOMMatrix = class DOMMatrix {};
const { default: agentRouter } = await import("../agent/routes/agent.route.js");
app.use("/api/agent", protect, injectUserId, agentRouter);

// /upload  →  formerly proxied by gateway; now mounted directly
app.use("/upload", protect, injectUserId, agentRouter);

// ── Billing routes ────────────────────────────────────────────────────────────
const { default: billingRouter } = await import("../billing/routes/billing.routes.js");
app.use("/api/billing", protect, injectUserId, billingRouter);

// ── Uploads static dir ───────────────────────────────────────────────────────
// Serve files uploaded by the agent service
const uploadsDir = path.resolve(__dirname, "../agent/uploads");
app.use("/uploads", express.static(uploadsDir));

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "cortex-ai" });
});

// ── Serve frontend in production ─────────────────────────────────────────────
if (isProduction) {
  const frontendDist = path.resolve(__dirname, "../../../frontend/dist");
  app.use(express.static(frontendDist));
  app.use((_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("[Server Error]", err?.message || err);
  const status = err.status || 500;
  return res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function startServer() {
  // Connect all DB instances
  await Promise.all([
    connectDB(),
    connectChatDB(),
    connectAgentDB(),
    connectBillingDB()
  ]);
  app.listen(port, () => {
    console.log(`Cortex AI server running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
