import { uploadToS3 } from "./uploadToS3.js";
import { getDownloadUrl } from "./getDownloadUrl.js";
import { uploadLocal } from "./uploadLocal.js";

const PLACEHOLDER_PATTERNS = [
  /^your[-_]/i,
  /^add your /i,
  /^placeholder/i,
  /^xxx$/i,
];

function isConfigured(value) {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length < 3) return false;
  return !PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function isS3Configured() {
  return (
    isConfigured(process.env.AWS_ACCESS_KEY_ID) &&
    isConfigured(process.env.AWS_SECRET_ACCESS_KEY) &&
    isConfigured(process.env.AWS_BUCKET_NAME)
  );
}

export async function uploadFile(buffer, fileName, contentType) {
  if (isS3Configured()) {
    await uploadToS3(buffer, fileName, contentType);
    return getDownloadUrl(fileName, 24 * 60 * 60);
  }

  return uploadLocal(buffer, fileName);
}
