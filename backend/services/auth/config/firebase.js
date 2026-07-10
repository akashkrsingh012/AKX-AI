import { initializeApp, cert } from "firebase-admin/app";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let appInstance = null;

try {
  let serviceAccount = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    const serviceAccountPath = path.resolve(__dirname, "../serviceAccount.json");
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    }
  }

  if (serviceAccount && serviceAccount.project_id) {
    appInstance = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    console.warn("⚠️ Firebase service account not configured. Firebase auth features will not work.");
  }
} catch (error) {
  console.error("⚠️ Failed to initialize Firebase:", error.message);
}

export const app = appInstance;