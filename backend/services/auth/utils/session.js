import { signToken, setAuthCookie } from "./jwt.js";

export function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  return obj;
}

export async function createUserSession(user, res) {
  const token = signToken(user);
  setAuthCookie(res, token);
  return token;
}
