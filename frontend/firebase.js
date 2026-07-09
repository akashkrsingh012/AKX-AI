// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

const isFirebaseConfigured =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "add your firebase api key" &&
  firebaseConfig.apiKey !== "dummy-api-key" &&
  firebaseConfig.apiKey.length > 10;

let auth = null;
let googleProvider = null;
let facebookProvider = null;
let appleProvider = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    facebookProvider = new FacebookAuthProvider();
    appleProvider = new OAuthProvider("apple.com");
  } catch (err) {
    console.warn("Firebase initialization failed:", (err as Error).message);
  }
} else {
  console.warn("Firebase not configured. Using mock authentication.");
}

export { auth, googleProvider, facebookProvider, appleProvider };
