import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Phone, Loader2 } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import {
  auth,
  googleProvider,
  facebookProvider,
  appleProvider,
} from "../../firebase";
import AuthLayout from "../../components/auth/AuthLayout";
import BackButton from "../../components/auth/BackButton";
import OtpInput from "../../components/auth/OtpInput";
import SocialButtons from "../../components/auth/SocialButtons";
import {
  sendOtp,
  verifyOtp,
  createAccount,
  registerDirect,
  loginWithPassword,
  forgotPassword,
  resetPassword,
  googleAuth,
  facebookAuth,
  appleAuth,
} from "../../features/auth.api";
import { parseIdentifier, validatePassword, getPasswordStrength } from "../../utils/validators";
import { setUserData } from "../../redux/user.slice";
import type { AuthStep, IdentifierType } from "../../types/auth";

const RESEND_SECONDS = 60;
const OTP_EXPIRY = 300;

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function AuthPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState<AuthStep>("welcome");
  const [identifier, setIdentifier] = useState("");
  const [identifierType, setIdentifierType] = useState<IdentifierType>("email");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(OTP_EXPIRY);
  const [loginEmail, setLoginEmail] = useState("");
  const [oauthProvider, setOauthProvider] = useState<"google" | "facebook" | "apple" | null>(null);
  const [oauthDetails, setOauthDetails] = useState({ fullName: "", username: "", email: "" });

  const strength = getPasswordStrength(password);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  useEffect(() => {
    if (otpExpiry <= 0 || step !== "verify-otp" && step !== "reset-password") return;
    const id = setInterval(() => setOtpExpiry((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [otpExpiry, step]);

  const startTimers = () => {
    setResendTimer(RESEND_SECONDS);
    setOtpExpiry(OTP_EXPIRY);
  };

  const handleError = (err: unknown, fallback = "Something went wrong") => {
    const e = err as { response?: { data?: { message?: string } }; message?: string };
    setError(e?.response?.data?.message || e?.message || fallback);
  };

  const finishAuth = (user: Parameters<typeof setUserData>[0]) => {
    dispatch(setUserData(user));
    navigate("/dashboard", { replace: true });
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const parsed = parseIdentifier(identifier);
    if (!parsed.valid) {
      setError(parsed.message);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await sendOtp(parsed.value);
      setIdentifier(data.identifier || parsed.value);
      setIdentifierType(data.identifierType || parsed.type);
      startTimers();
      setStep("verify-otp");
    } catch (err) {
      handleError(err, "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (code?: string) => {
    const otpCode = code || otp;
    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await verifyOtp(identifier, otpCode);
      if (step === "reset-password" || (step === "verify-otp" && data.hasPassword === false && !data.isNewUser)) {
        /* handled below */
      }

      if (step === "forgot-password" || (step === "verify-otp" && window.__forgotFlow)) {
        setStep("reset-password");
        return;
      }

      if (data.hasPassword) {
        setLoginEmail(identifier.includes("@") ? identifier : data.email || "");
        setStep("login");
      } else {
        setStep("create-account");
      }
    } catch (err) {
      handleError(err, "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Full name is required");
      return;
    }
    if (!identifier.trim() || !identifier.includes("@")) {
      setError("Valid email is required");
      return;
    }
    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await registerDirect(identifier.trim(), password, name.trim());
      if (data.user) finishAuth(data.user);
    } catch (err) {
      handleError(err, "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Full name is required");
      return;
    }
    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await createAccount(identifier, password, name.trim());
      if (data.user) finishAuth(data.user);
    } catch (err) {
      handleError(err, "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await loginWithPassword(loginEmail, password);
      if (data.user) finishAuth(data.user);
    } catch (err) {
      handleError(err, "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseIdentifier(identifier);
    if (!parsed.valid) {
      setError(parsed.message);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await forgotPassword(parsed.value);
      setIdentifier(data.identifier || parsed.value);
      setIdentifierType(data.identifierType || parsed.type);
      startTimers();
      setStep("verify-otp");
      (window as Window & { __forgotFlow?: boolean }).__forgotFlow = true;
    } catch (err) {
      handleError(err, "Failed to send reset OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await resetPassword(identifier, otp, password);
      (window as Window & { __forgotFlow?: boolean }).__forgotFlow = false;
      if (data.user) finishAuth(data.user);
    } catch (err) {
      handleError(err, "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError("");
    try {
      await sendOtp(identifier);
      startTimers();
    } catch (err) {
      handleError(err, "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = useCallback(
    async (provider: "google" | "facebook" | "apple") => {
      if (!oauthDetails.fullName.trim() || !oauthDetails.email.trim()) {
        setError("Full Name and Email are required");
        return;
      }
      setLoading(true);
      setError("");
      try {
        let token: string | undefined;
        const providers = {
          google: { auth: googleProvider, mock: "mock-google-token", fn: googleAuth },
          facebook: { auth: facebookProvider, mock: "mock-facebook-token", fn: facebookAuth },
          apple: { auth: appleProvider, mock: "mock-apple-token", fn: appleAuth },
        };
        const p = providers[provider];

        if (auth && p.auth) {
          try {
            const result = await signInWithPopup(auth, p.auth);
            token = await result.user.getIdToken();
          } catch (err) {
            console.warn(`[auth] ${provider} popup failed:`, (err as Error).message);
          }
        }
        if (!token) token = p.mock;

        const data = await p.fn(token, oauthDetails);
        setIdentifier(data.identifier || data.email || "");
        setIdentifierType((data.identifierType as IdentifierType) || "email");
        if (data.name) setName(data.name);

        if (data.user) {
          finishAuth(data.user);
        } else if (data.step === "verify-otp") {
          startTimers();
          setStep("verify-otp");
        } else if (data.step === "enter-password") {
          setLoginEmail(data.email || "");
          setStep("login");
        }
      } catch (err) {
        handleError(err, `${provider} sign-in failed`);
      } finally {
        setLoading(false);
      }
    },
    [oauthDetails, finishAuth]
  );

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const titles: Record<AuthStep, { title: string; subtitle: string }> = {
    welcome: { title: "Get Started", subtitle: "Sign in or create your account" },
    register: { title: "Create Account", subtitle: "Enter your details to get started" },
    login: { title: "Welcome Back", subtitle: "Sign in with your registered email" },
    "verify-otp": { title: "Verify OTP", subtitle: `Code sent to your ${identifierType}` },
    "create-account": { title: "Complete Profile", subtitle: "Set up your account details" },
    "forgot-password": { title: "Forgot Password", subtitle: "We'll send a reset code" },
    "reset-password": { title: "Reset Password", subtitle: "Create a new secure password" },
    "oauth-details": { title: "Enter your details", subtitle: "Enter your details to get started" },
  };

  const { title, subtitle } = titles[step];

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-purple-950/40 border border-purple-500/25 text-white text-sm placeholder:text-purple-400/50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all";
  const btnPrimary =
    "w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2";
  const btnSecondary =
    "w-full py-3 rounded-xl text-sm font-medium text-purple-200 border border-purple-500/30 hover:bg-purple-500/10 transition-all cursor-pointer disabled:opacity-50";

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      <motion.div
        key={step}
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25 }}
      >
        {step === "welcome" && (
          <div className="flex flex-col gap-5">
            <SocialButtons
              onGoogle={() => { setOauthProvider("google"); setStep("oauth-details"); }}
              onFacebook={() => { setOauthProvider("facebook"); setStep("oauth-details"); }}
              onApple={() => { setOauthProvider("apple"); setStep("oauth-details"); }}
              loading={loading}
            />

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-purple-500/20" />
              <span className="text-xs text-purple-400/60 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-purple-500/20" />
            </div>

            <button type="button" onClick={() => setStep("register")} className={btnPrimary}>
              Create New Account
            </button>
            <button type="button" onClick={() => setStep("login")} className={btnSecondary}>
              Sign In with Email
            </button>
          </div>
        )}

        {step === "register" && (
          <form onSubmit={handleRegisterDirect} className="flex flex-col gap-4">
            <BackButton onClick={() => { setStep("welcome"); setPassword(""); setConfirmPassword(""); setName(""); setIdentifier(""); setError(""); }} />
            <div>
              <label className="text-xs text-purple-300/80 font-medium mb-1.5 block">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                className={inputClass}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-purple-300/80 font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400/60">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setError(""); }}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-purple-300/80 font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars with upper, lower, number & symbol"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/60 hover:text-purple-300 bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 rounded-full bg-purple-900/50 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }}
                    />
                  </div>
                  <span className="text-[11px]" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-purple-300/80 font-medium mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/60 hover:text-purple-300 bg-transparent border-none cursor-pointer"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Creating…" : "Create Account"}
            </button>
          </form>
        )}

        {step === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <BackButton onClick={() => { setStep("welcome"); setPassword(""); setError(""); }} />
            <div>
              <label className="text-xs text-purple-300/80 font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="Enter registered email"
                value={loginEmail}
                onChange={(e) => { setLoginEmail(e.target.value); setError(""); }}
                className={inputClass}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-purple-300/80 font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/60 hover:text-purple-300 bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Signing in…" : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("forgot-password"); setError(""); }}
              className="text-xs text-purple-400 hover:text-purple-300 bg-transparent border-none cursor-pointer text-center"
            >
              Forgot Password?
            </button>
          </form>
        )}

        {(step === "verify-otp") && (
          <div className="flex flex-col gap-4">
            <BackButton
              onClick={() => {
                setStep((window as Window & { __forgotFlow?: boolean }).__forgotFlow ? "forgot-password" : "register");
                setOtp("");
                setError("");
              }}
            />
            <p className="text-sm text-purple-300/80 text-center">
              Sent to <span className="text-white font-medium">{identifier}</span>
            </p>
            <OtpInput
              value={otp}
              onChange={(v) => { setOtp(v); setError(""); }}
              onComplete={(code) => {
                if ((window as Window & { __forgotFlow?: boolean }).__forgotFlow) {
                  setOtp(code);
                  setStep("reset-password");
                } else {
                  handleVerifyOtp(code);
                }
              }}
              disabled={loading}
            />
            <p className="text-xs text-purple-400/60 text-center">
              OTP expires in {formatTime(otpExpiry)}
            </p>
            <button
              type="button"
              onClick={() => {
                if ((window as Window & { __forgotFlow?: boolean }).__forgotFlow) {
                  if (otp.length === 6) setStep("reset-password");
                  else setError("Please enter the 6-digit OTP");
                } else {
                  handleVerifyOtp();
                }
              }}
              disabled={loading || otp.length !== 6}
              className={btnPrimary}
            >
              {loading ? "Verifying…" : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || loading}
              className="text-xs text-purple-400 hover:text-purple-300 bg-transparent border-none cursor-pointer text-center disabled:opacity-50"
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>
        )}

        {step === "create-account" && (
          <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
            <BackButton onClick={() => { setStep("verify-otp"); setError(""); }} />
            <div>
              <label className="text-xs text-purple-300/80 font-medium mb-1.5 block">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                className={inputClass}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-purple-300/80 font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars with upper, lower, number & symbol"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/60 hover:text-purple-300 bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 rounded-full bg-purple-900/50 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }}
                    />
                  </div>
                  <span className="text-[11px]" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-purple-300/80 font-medium mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/60 hover:text-purple-300 bg-transparent border-none cursor-pointer"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? "Creating…" : "Create Account"}
            </button>
          </form>
        )}

        {step === "forgot-password" && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <BackButton onClick={() => { setStep("login"); setError(""); }} />
            <div>
              <label className="text-xs text-purple-300/80 font-medium mb-1.5 block">
                Registered Email or Phone
              </label>
              <input
                type="text"
                placeholder="Enter email or phone number"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(""); }}
                className={inputClass}
                autoFocus
              />
            </div>
            <button type="submit" disabled={loading || !identifier.trim()} className={btnPrimary}>
              {loading ? "Sending…" : "Send Reset OTP"}
            </button>
          </form>
        )}

        {step === "reset-password" && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <BackButton onClick={() => { setStep("verify-otp"); setError(""); }} />
            <div>
              <label className="text-xs text-purple-300/80 font-medium mb-1.5 block">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className={`${inputClass} pr-10`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/60 hover:text-purple-300 bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-purple-300/80 font-medium mb-1.5 block">Confirm Password</label>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                className={inputClass}
              />
            </div>
            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? "Resetting…" : "Reset Password & Sign In"}
            </button>
          </form>
        )}

        {step === "oauth-details" && (
          <form onSubmit={(e) => { e.preventDefault(); if (oauthProvider) handleSocialLogin(oauthProvider); }} className="flex flex-col gap-4">
            <BackButton onClick={() => { setStep("welcome"); setOauthProvider(null); setError(""); }} />
            <div>
              <label className="text-xs text-purple-300/80 font-medium mb-1.5 block">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={oauthDetails.fullName}
                onChange={(e) => { setOauthDetails({ ...oauthDetails, fullName: e.target.value }); setError(""); }}
                className={inputClass}
                autoFocus
                required
              />
            </div>
            <div>
              <label className="text-xs text-purple-300/80 font-medium mb-1.5 block">Username (optional)</label>
              <input
                type="text"
                placeholder="Choose a username"
                value={oauthDetails.username}
                onChange={(e) => { setOauthDetails({ ...oauthDetails, username: e.target.value }); setError(""); }}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-purple-300/80 font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={oauthDetails.email}
                onChange={(e) => { setOauthDetails({ ...oauthDetails, email: e.target.value }); setError(""); }}
                className={inputClass}
                required
              />
            </div>
            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Please wait…" : "Continue"}
            </button>
          </form>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400 text-center mt-4 bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </AuthLayout>
  );
}

declare global {
  interface Window {
    __forgotFlow?: boolean;
  }
}
