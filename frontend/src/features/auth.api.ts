import api from "../utils/axios";
import type { ApiResponse, User } from "../types/auth";

export async function sendOtp(identifier: string) {
  const { data } = await api.post<ApiResponse>("/api/auth/send-otp", { identifier });
  return data;
}

export async function verifyOtp(
  identifier: string,
  otp: string,
  purpose?: "register" | "social" | "reset"
) {
  const { data } = await api.post<ApiResponse>("/api/auth/verify-otp", {
    identifier,
    otp,
    purpose,
  });
  return data;
}

export async function createAccount(
  identifier: string,
  password: string,
  name: string
) {
  const { data } = await api.post<ApiResponse>("/api/auth/set-password", {
    identifier,
    password,
    name,
  });
  return data;
}

export async function registerDirect(
  email: string,
  password: string,
  name: string
) {
  const { data } = await api.post<ApiResponse>("/api/auth/register", {
    email,
    password,
    name,
  });
  return data;
}

export async function loginWithPassword(email: string, password: string) {
  const { data } = await api.post<ApiResponse>("/api/auth/login-password", {
    email,
    password,
  });
  return data;
}

export async function forgotPassword(identifier: string) {
  const { data } = await api.post<ApiResponse>("/api/auth/forgot-password", {
    identifier,
  });
  return data;
}

export async function resetPassword(
  identifier: string,
  otp: string,
  password: string
) {
  const { data } = await api.post<ApiResponse>("/api/auth/reset-password", {
    identifier,
    otp,
    password,
  });
  return data;
}

export async function googleAuth(token: string, extra?: { fullName: string; username?: string; email: string }) {
  const { data } = await api.post<ApiResponse>("/api/auth/google-auth", { token, ...extra });
  return data;
}

export async function facebookAuth(token: string, extra?: { fullName: string; username?: string; email: string }) {
  const { data } = await api.post<ApiResponse>("/api/auth/facebook-auth", { token, ...extra });
  return data;
}

export async function appleAuth(token: string, extra?: { fullName: string; username?: string; email: string }) {
  const { data } = await api.post<ApiResponse>("/api/auth/apple-auth", { token, ...extra });
  return data;
}

export async function logout() {
  const { data } = await api.get<ApiResponse>("/api/auth/logout");
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get<{ success: boolean; user: User }>("/api/me");
  return data;
}
