import express from "express";

import {
  appleAuth,
  deductCredits,
  facebookAuth,
  getMe,
  googleAuth,
  login,
  loginPassword,
  logout,
  registerDirect,
  updatePlan,
} from "../controllers/auth.controllers.js";
import { protect } from "../middleware/auth.middleware.js";
import { authRateLimiter, loginRateLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.use(authRateLimiter);

router.post("/google-auth", googleAuth);
router.post("/facebook-auth", facebookAuth);
router.post("/apple-auth", appleAuth);
router.post("/register", registerDirect);
router.post("/login-password", loginRateLimiter, loginPassword);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.patch("/internal/update-plan", updatePlan);
router.patch("/internal/deduct-credits", deductCredits);

export default router;
