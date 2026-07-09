import redis from "../../../shared/redis/redis.js";
import { parseIdentifier } from "./identifier.js";

export const OTP_TTL = 60 * 5;
const VERIFIED_TTL = 60 * 15;

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function otpKey(identifierKey) {
  return `otp:${identifierKey}`;
}

function verifiedKey(identifierKey) {
  return `otp-verified:${identifierKey}`;
}

export async function storeOtp(identifier, otp) {
  const parsed = parseIdentifier(identifier);
  if (!parsed.valid) throw new Error(parsed.message);
  await redis.set(otpKey(parsed.key), otp, "EX", OTP_TTL);
  return parsed;
}

export async function verifyOtp(identifier, otp) {
  const parsed = parseIdentifier(identifier);
  if (!parsed.valid) return false;

  const key = otpKey(parsed.key);
  const stored = await redis.get(key);
  if (!stored || stored !== String(otp)) {
    return false;
  }

  await redis.del(key);
  await redis.set(verifiedKey(parsed.key), "1", "EX", VERIFIED_TTL);
  return true;
}

export async function isOtpVerified(identifier) {
  const parsed = parseIdentifier(identifier);
  if (!parsed.valid) return false;
  const verified = await redis.get(verifiedKey(parsed.key));
  return Boolean(verified);
}

export async function clearOtpVerification(identifier) {
  const parsed = parseIdentifier(identifier);
  if (!parsed.valid) return;
  await redis.del(verifiedKey(parsed.key));
}

export async function sendOtpEmail(email, otp) {
  console.log(`[auth] Email OTP for ${email}: ${otp} (expires in 5 minutes)`);
}

export async function sendOtpSms(phone, otp) {
  console.log(`[auth] SMS OTP for ${phone}: ${otp} (expires in 5 minutes)`);
}

export async function deliverOtp(identifier, otp) {
  const parsed = parseIdentifier(identifier);
  if (!parsed.valid) throw new Error(parsed.message);

  if (parsed.type === "email") {
    await sendOtpEmail(parsed.value, otp);
  } else {
    await sendOtpSms(parsed.value, otp);
  }

  return parsed;
}

/** @deprecated use isOtpVerified */
export async function isEmailOtpVerified(email) {
  return isOtpVerified(email);
}

/** @deprecated use clearOtpVerification */
export async function clearEmailOtpVerification(email) {
  return clearOtpVerification(email);
}
