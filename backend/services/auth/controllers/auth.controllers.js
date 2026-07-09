import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { createUserSession, sanitizeUser } from "../utils/session.js";
import {
  generateOtp,
  storeOtp,
  verifyOtp,
  isOtpVerified,
  clearOtpVerification,
  deliverOtp,
} from "../utils/otp.js";
import { decodeSocialToken } from "../utils/firebase.js";
import { parseIdentifier, findUserByIdentifier } from "../utils/identifier.js";
import { validatePassword } from "../utils/password.js";
import { clearAuthCookie } from "../utils/jwt.js";

function logApiError(label, error) {
  console.error(`[auth] ${label}:`, error?.message || error);
}

async function handleSocialAuth(decoded, res, extraDetails = {}) {
  const email = extraDetails.email?.toLowerCase() || decoded.email?.toLowerCase();
  if (!email) {
    return res.status(400).json({ success: false, message: "Account has no email address" });
  }

  const provider = decoded.firebase?.sign_in_provider || decoded.provider || "google.com";
  const name = extraDetails.fullName || decoded.name;
  const username = extraDetails.username;

  let user = await User.findOne({
    $or: [{ firebaseUid: decoded.uid }, { email }],
  });

  if (!user) {
    user = await User.create({
      firebaseUid: decoded.uid,
      email,
      name,
      username,
      avatar: decoded.picture,
      provider,
      passwordSet: false,
    });
  } else {
    if (!user.firebaseUid) {
      user.firebaseUid = decoded.uid;
      user.provider = provider;
      if (!user.avatar) user.avatar = decoded.picture;
      if (!user.name) user.name = name;
      if (username && !user.username) user.username = username;
      await user.save();
    }
  }

  await createUserSession(user, res);

  return res.json({
    success: true,
    user: sanitizeUser(user),
  });
}

export const sendOtp = async (req, res) => {
  try {
    const { identifier, email, phone } = req.body;
    const raw = identifier || email || phone;
    const parsed = parseIdentifier(raw);

    if (!parsed.valid) {
      return res.status(400).json({ success: false, message: parsed.message });
    }

    const otp = generateOtp();
    await storeOtp(parsed.key, otp);
    await deliverOtp(parsed.key, otp);

    return res.json({
      success: true,
      message: `OTP sent successfully via ${parsed.type === "email" ? "email" : "SMS"}`,
      identifier: parsed.value,
      identifierType: parsed.type,
      expiresIn: 300,
    });
  } catch (error) {
    logApiError("sendOtp", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtpCode = async (req, res) => {
  try {
    const { identifier, email, phone, otp, purpose } = req.body;
    const raw = identifier || email || phone;
    const parsed = parseIdentifier(raw);

    if (!parsed.valid) {
      return res.status(400).json({ success: false, message: parsed.message });
    }
    if (!otp || String(otp).length !== 6) {
      return res.status(400).json({ success: false, message: "OTP must be 6 digits" });
    }

    const valid = await verifyOtp(parsed.key, String(otp));
    if (!valid) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const user = await findUserByIdentifier(User, parsed.key);
    const hasPassword = Boolean(user?.passwordSet);

    if (purpose === "social" && user && hasPassword) {
      await clearOtpVerification(parsed.key);
      await createUserSession(user, res);
      return res.json({
        success: true,
        message: "Login successful",
        identifier: parsed.value,
        identifierType: parsed.type,
        isNewUser: false,
        hasPassword: true,
        step: "dashboard",
        user: sanitizeUser(user),
      });
    }

    return res.json({
      success: true,
      message: "OTP verified",
      identifier: parsed.value,
      identifierType: parsed.type,
      isNewUser: !user,
      hasPassword,
    });
  } catch (error) {
    logApiError("verifyOtpCode", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { token, fullName, username, email } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Google token is required" });
    }
    const decoded = await decodeSocialToken(token, "google.com");
    return handleSocialAuth(decoded, res, { fullName, username, email });
  } catch (error) {
    logApiError("googleAuth", error);
    return res.status(401).json({ success: false, message: error.message });
  }
};

export const facebookAuth = async (req, res) => {
  try {
    const { token, fullName, username, email } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Facebook token is required" });
    }
    const decoded = await decodeSocialToken(token, "facebook.com");
    return handleSocialAuth(decoded, res, { fullName, username, email });
  } catch (error) {
    logApiError("facebookAuth", error);
    return res.status(401).json({ success: false, message: error.message });
  }
};

export const appleAuth = async (req, res) => {
  try {
    const { token, fullName, username, email } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Apple token is required" });
    }
    const decoded = await decodeSocialToken(token, "apple.com");
    return handleSocialAuth(decoded, res, { fullName, username, email });
  } catch (error) {
    logApiError("appleAuth", error);
    return res.status(401).json({ success: false, message: error.message });
  }
};

export const setPassword = async (req, res) => {
  try {
    const { identifier, email, phone, password, name } = req.body;
    const raw = identifier || email || phone;
    const parsed = parseIdentifier(raw);

    if (!parsed.valid) {
      return res.status(400).json({ success: false, message: parsed.message });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ success: false, message: passwordCheck.message });
    }

    const verified = await isOtpVerified(parsed.key);
    if (!verified) {
      return res.status(400).json({ success: false, message: "Please verify OTP first" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    let user = await findUserByIdentifier(User, parsed.key);

    if (user) {
      if (user.passwordSet) {
        return res.status(400).json({
          success: false,
          message: "Account already has a password. Please login.",
        });
      }
      user.passwordHash = passwordHash;
      user.passwordSet = true;
      if (name && !user.name) user.name = name;
      await user.save();
    } else {
      const userData = {
        name: name || (parsed.type === "email" ? parsed.value.split("@")[0] : "User"),
        provider: parsed.type === "email" ? "email" : "phone",
        passwordHash,
        passwordSet: true,
      };
      if (parsed.type === "email") userData.email = parsed.value;
      else userData.phone = parsed.value;

      user = await User.create(userData);
    }

    await clearOtpVerification(parsed.key);
    await createUserSession(user, res);

    return res.json({
      success: true,
      message: "Account created successfully",
      user: sanitizeUser(user),
      token: true,
    });
  } catch (error) {
    logApiError("setPassword", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const registerDirect = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ success: false, message: passwordCheck.message });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email already exists. Please sign in." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: normalizedEmail,
      name: name.trim(),
      provider: "email",
      passwordHash,
      passwordSet: true,
    });

    await createUserSession(user, res);

    return res.json({
      success: true,
      message: "Account created successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    logApiError("registerDirect", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const loginPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const parsed = parseIdentifier(email);
    if (!parsed.valid || parsed.type !== "email") {
      return res.status(400).json({ success: false, message: "Valid email is required for login" });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const user = await User.findOne({ email: parsed.value });
    if (!user || !user.passwordSet || !user.passwordHash) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    await createUserSession(user, res);

    return res.json({
      success: true,
      message: "Login successful",
      user: sanitizeUser(user),
    });
  } catch (error) {
    logApiError("loginPassword", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { identifier, email, phone } = req.body;
    const raw = identifier || email || phone;
    const parsed = parseIdentifier(raw);

    if (!parsed.valid) {
      return res.status(400).json({ success: false, message: parsed.message });
    }

    const user = await findUserByIdentifier(User, parsed.key);
    if (!user || !user.passwordSet) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email or phone number",
      });
    }

    const otp = generateOtp();
    await storeOtp(parsed.key, otp);
    await deliverOtp(parsed.key, otp);

    return res.json({
      success: true,
      message: "OTP sent for password reset",
      identifier: parsed.value,
      identifierType: parsed.type,
      expiresIn: 300,
    });
  } catch (error) {
    logApiError("forgotPassword", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { identifier, email, phone, otp, password } = req.body;
    const raw = identifier || email || phone;
    const parsed = parseIdentifier(raw);

    if (!parsed.valid) {
      return res.status(400).json({ success: false, message: parsed.message });
    }
    if (!otp || String(otp).length !== 6) {
      return res.status(400).json({ success: false, message: "OTP must be 6 digits" });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ success: false, message: passwordCheck.message });
    }

    const valid = await verifyOtp(parsed.key, String(otp));
    if (!valid) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const user = await findUserByIdentifier(User, parsed.key);
    if (!user) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordSet = true;
    await user.save();
    await clearOtpVerification(parsed.key);
    await createUserSession(user, res);

    return res.json({
      success: true,
      message: "Password reset successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    logApiError("resetPassword", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.json({ success: true, user: req.user });
  } catch (error) {
    logApiError("getMe", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** @deprecated Use googleAuth + setPassword/loginPassword instead */
export const login = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = await decodeSocialToken(token, "google.com");

    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.picture,
        provider: decoded.firebase?.sign_in_provider,
        passwordSet: false,
      });
    }

    if (!user.passwordSet) {
      return res.status(403).json({
        success: false,
        message: "Please complete registration with OTP and password",
        step: "verify-otp",
        email: user.email,
      });
    }

    await createUserSession(user, res);

    return res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    logApiError("login", error);
    return res.status(401).json({ message: error.message });
  }
};

export const logout = async (_req, res) => {
  try {
    clearAuthCookie(res);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logApiError("logout", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { userId, plan, credits } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.plan = plan;
    user.credits += credits;
    user.totalCredits += credits;
    user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await user.save();

    return res.json({
      success: true,
    });
  } catch (error) {
    logApiError("updatePlan", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deductCredits = async (req, res) => {
  try {
    const { userId, agent } = req.body;
    const COST = {
      chat: 1,
      search: 5,
      coding: 10,
      pdf: 10,
      ppt: 10,
      image: 10,
    };

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const requiredCredits = COST[agent] || 1;

    if (user.credits < requiredCredits) {
      return res.status(400).json({
        success: false,
        title: "Insufficient Credits",
        message: "Not enough credits. Please upgrade your plan.",
      });
    }

    user.credits -= requiredCredits;
    await user.save();

    return res.json({
      success: true,
      credits: user.credits,
    });
  } catch (error) {
    logApiError("deductCredits", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
