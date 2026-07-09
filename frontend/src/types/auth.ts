export type AuthStep =
  | "welcome"
  | "register"
  | "login"
  | "verify-otp"
  | "create-account"
  | "forgot-password"
  | "reset-password"
  | "oauth-details";

export type IdentifierType = "email" | "phone";

export interface User {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  provider?: string;
  passwordSet?: boolean;
  plan?: string;
  credits?: number;
  totalCredits?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  step: AuthStep;
  identifier: string;
  identifierType: IdentifierType;
  name: string;
  otp: string;
  password: string;
  confirmPassword: string;
  isNewUser: boolean;
  hasPassword: boolean;
  socialProvider?: "google" | "facebook" | "apple";
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  user?: User;
  step?: string;
  identifier?: string;
  identifierType?: IdentifierType;
  isNewUser?: boolean;
  hasPassword?: boolean;
  expiresIn?: number;
  email?: string;
  name?: string;
  avatar?: string;
  data?: T;
}
