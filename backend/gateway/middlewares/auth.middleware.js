import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "cortex-ai-jwt-secret-change-in-production";

export const protect = async (req, res, next) => {
  try {
    const token =
      req.cookies?.auth_token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    const isLocalDevRequest =
      process.env.NODE_ENV !== "production" &&
      ["localhost", "127.0.0.1", "::1"].includes(req.hostname);

    if (!token && isLocalDevRequest) {
      req.user = {
        userId: "507f1f77bcf86cd799439011",
        email: "local@example.com",
        name: "Local Dev",
        avatar: null,
      };
      return next();
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
