globalThis.DOMMatrix = class DOMMatrix {};
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
dotenv.config({ override: true });
const app = express();
app.use(express.json());
const port=process.env.PORT

const { default: router } = await import("./routes/agent.route.js");

app.get("/health", (_req, res) => {
  res.json({ service: "agent", status: "ok" });
});

app.use("/", router);

app.use((err, req, res, _next) => {
  console.error("[Agent Error]", err);
  console.error("[Agent Error Stack]", err?.stack || "No stack trace");

  const status = err.status || 500;
  const payload = err.data || {
    success: false,
    title: "Something went wrong",
    message: err.message || "Internal Server Error",
  };

  return res.status(status).json(payload);
});

app.listen(port, () => {
    connectDB()
  console.log(
    `agent service running on ${port}`
  );
});
