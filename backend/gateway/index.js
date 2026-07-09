import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { proxyWithUser } from "./utils/proxyWithHeaders.js";
import { protect } from "./middlewares/auth.middleware.js";
import { getCurrentUser } from "./controllers/user.controller.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const frontendDist = path.resolve(__dirname, "../../frontend/dist");
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const port = Number(process.env.PORT) || (isProduction ? 3000 : 8000);

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

app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "uploads"))
);

const authService = process.env.AUTH_SERVICE || "http://localhost:8001";
const chatService = process.env.CHAT_SERVICE || "http://localhost:8002";
const agentService = process.env.AGENT_SERVICE || "http://localhost:8003";
const billingService = process.env.BILLING_SERVICE || "http://localhost:8004";

if (!authService.startsWith("http")) {
  throw new Error("AUTH_SERVICE must include protocol, e.g. http://localhost:8001");
}

app.use("/api/auth", proxy(authService));
app.use("/api/me", protect, getCurrentUser);
app.use("/api/chat", protect, proxyWithUser(chatService));
app.use("/api/agent", protect, proxyWithUser(agentService));
app.use("/api/upload", protect, proxyWithUser(agentService, { proxyReqPathResolver: () => '/upload' }));
app.use("/api/billing", protect, proxyWithUser(billingService));

app.get("/health", (_req, res) => {
  res.status(200).json({ service: "gateway", status: "ok" });
});

if (isProduction) {
  app.use(express.static(frontendDist));
  app.use((_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res.status(200).json({
      service: "gateway",
      status: "ok",
      message: "Development mode — open the frontend at http://localhost:3000",
    });
  });
}

app.listen(port, () => {
  console.log(
    `Gateway running on port ${port}${isProduction ? " (production)" : " (internal — proxied via Vite on :3000)"}`
  );
});
