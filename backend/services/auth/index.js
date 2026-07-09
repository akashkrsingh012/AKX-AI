import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import router from "./routes/auth.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

const port = process.env.PORT || 8001;

if (!process.env.MONGODB_URL) {
  console.error("Missing environment variable: MONGODB_URL");
  process.exit(1);
}

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "auth",
    status: "ok",
  });
});

app.use("/", router);

async function startServer() {
  await connectDB();
  app.listen(port, () => {
    console.log(`auth service running on ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start auth service:", error);
  process.exit(1);
});
