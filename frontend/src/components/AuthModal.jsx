import { useCallback, useEffect, useRef, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import api from "../utils/axios";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "var(--error)" };
  if (score === 2) return { score: 2, label: "Fair", color: "var(--warning)" };
  if (score === 3) return { score: 3, label: "Good", color: "var(--accent-teal)" };
  return { score: 4, label: "Strong", color: "var(--success)" };
}

export default function AuthModal({ onSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [step, setStep] = useState("auth"); // "auth" or "success"
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const emailRef = useRef(null);

  const strength = getPasswordStrength(password);

  useEffect(() => {
    if (step === "auth") {
      setTimeout(() => emailRef.current?.focus(), 100);
    }
  }, [step, isLoginMode]);

  const handleApiError = (err, fallback = "Something went wrong") => {
    const msg = err?.response?.data?.message || err?.message || fallback;
    console.error("[auth]", msg, err?.response?.data || "");
    setError(msg);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      let token;
      if (auth && googleProvider) {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          token = await result.user.getIdToken();
        } catch (err) {
          console.warn("[auth] Firebase Google login failed:", err.message);
        }
      }
      if (!token) token = "mock-google-token";

      const { data } = await api.post("/api/auth/google-auth", { token });
      setPendingUser(data.user);
      setStep("success");
    } catch (err) {
      handleApiError(err, "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!isLoginMode && !name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!isLoginMode && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    try {
      if (isLoginMode) {
        const { data } = await api.post("/api/auth/login-password", { email, password });
        setPendingUser(data.user);
        setStep("success");
      } else {
        const { data } = await api.post("/api/auth/register", { email, password, name });
        setPendingUser(data.user);
        setStep("success");
      }
    } catch (err) {
      handleApiError(err, isLoginMode ? "Login failed" : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    if (pendingUser) onSuccess?.(pendingUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-[380px] bg-surface border border-[var(--border)] rounded-xl p-6 sm:p-7 flex flex-col gap-5">
        
        {step === "auth" && (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-semibold tracking-tight accent-gradient-text">
                {isLoginMode ? "Welcome Back" : "Create an Account"}
              </h2>
              <p className="text-[13px] text-muted">
                {isLoginMode ? "Sign in to continue to AKX AI." : "Sign up to get started with AKX AI."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-[11px] rounded-xl text-sm font-medium text-white accent-gradient hover:opacity-90 transition-all duration-150 cursor-pointer shadow-[0_4px_20px_rgba(99,91,255,0.25)] disabled:opacity-60"
            >
              <FaGoogle size={15} className="text-white shrink-0" />
              {loading ? "Please wait…" : "Continue with Google"}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs text-muted uppercase tracking-wide">OR</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
              {!isLoginMode && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted font-medium">Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-elevated border border-[var(--border)] text-sm text-app placeholder:text-muted outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted font-medium">Email</label>
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-elevated border border-[var(--border)] text-sm text-app placeholder:text-muted outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-elevated border border-[var(--border)] text-sm text-app placeholder:text-muted outline-none focus:border-[var(--accent)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-app cursor-pointer bg-transparent border-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {!isLoginMode && password && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 rounded-full bg-[var(--border)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${(strength.score / 4) * 100}%`, background: strength.color }}
                      />
                    </div>
                    <span className="text-[11px]" style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>

              {!isLoginMode && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted font-medium">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      placeholder="Re-enter password"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-elevated border border-[var(--border)] text-sm text-app placeholder:text-muted outline-none focus:border-[var(--accent)] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-app cursor-pointer bg-transparent border-none"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-[11px] rounded-xl text-sm font-medium text-white accent-gradient hover:opacity-90 transition-all cursor-pointer disabled:opacity-60 mt-2"
              >
                {loading ? "Please wait…" : (isLoginMode ? "Sign In" : "Create Account")}
              </button>
            </form>

            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="text-[13px] text-muted hover:text-app transition-colors cursor-pointer bg-transparent border-none"
              >
                {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-2">
            <CheckCircle2 size={48} className="text-[var(--success)]" />
            <div className="text-center flex flex-col gap-1">
              <h2 className="text-[17px] font-semibold text-app">Success!</h2>
              <p className="text-[13px] text-muted">You&apos;re all set. Start chatting with AKX AI.</p>
            </div>
            <button
              type="button"
              onClick={handleGoHome}
              className="w-full py-[11px] rounded-xl text-sm font-medium text-white accent-gradient hover:opacity-90 transition-all cursor-pointer"
            >
              Go to Home
            </button>
          </div>
        )}

        {error && (
          <p className="text-[13px] text-[var(--error)] text-center -mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
