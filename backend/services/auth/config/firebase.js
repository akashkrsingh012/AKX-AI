import { initializeApp, cert } from "firebase-admin/app";

import serviceAccount from "../serviceAccount.json" with { type: "json" };

let appInstance = null;

if (serviceAccount && serviceAccount.project_id) {
  appInstance = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  console.warn("⚠️ Firebase service account not configured. Firebase auth features will not work.");
  appInstance = null;
}

export const app = appInstance;