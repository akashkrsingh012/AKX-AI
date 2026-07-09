import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";

const MOCK_USERS = {
  "google.com": {
    uid: "mock-google-uid",
    email: "mockuser@akx.ai",
    name: "Mock Google User",
    picture: "https://lh3.googleusercontent.com/a/default-user=s96-c",
    provider: "google.com",
  },
  "facebook.com": {
    uid: "mock-facebook-uid",
    email: "mockfb@akx.ai",
    name: "Mock Facebook User",
    picture: "https://lh3.googleusercontent.com/a/default-user=s96-c",
    provider: "facebook.com",
  },
  "apple.com": {
    uid: "mock-apple-uid",
    email: "mockapple@akx.ai",
    name: "Mock Apple User",
    picture: "https://lh3.googleusercontent.com/a/default-user=s96-c",
    provider: "apple.com",
  },
};

export async function decodeSocialToken(token, provider = "google.com") {
  const mockTokens = {
    "mock-google-token": "google.com",
    "mock-facebook-token": "facebook.com",
    "mock-apple-token": "apple.com",
  };

  if (mockTokens[token] || !app) {
    const mockProvider = mockTokens[token] || provider;
    const mock = MOCK_USERS[mockProvider] || MOCK_USERS["google.com"];
    return {
      uid: mock.uid,
      email: mock.email,
      name: mock.name,
      picture: mock.picture,
      provider: mockProvider,
      firebase: { sign_in_provider: mockProvider },
    };
  }

  const decoded = await getAuth(app).verifyIdToken(token);
  return {
    ...decoded,
    provider: decoded.firebase?.sign_in_provider || provider,
  };
}

/** @deprecated use decodeSocialToken */
export async function decodeGoogleToken(token) {
  return decodeSocialToken(token, "google.com");
}
