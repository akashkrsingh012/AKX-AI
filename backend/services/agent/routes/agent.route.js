import express from "express";
import { chat } from "../controllers/agent.controller.js";
import { processUpload } from "../controllers/upload.controller.js";
import multer from "../config/multer.js";
import { getAIMode, getConfiguredProviders, getActiveModelName } from "../utils/model.js";

const router = express.Router();

router.get("/health/ai", (_req, res) => {
  const providers = getConfiguredProviders();
  res.json({
    configured: providers.any,
    mode: getAIMode(),
    model: getActiveModelName(),
    providers,
  });
});

router.post("/chat", multer.single("file"), chat);
router.post("/upload", multer.single("file"), processUpload);

export default router;