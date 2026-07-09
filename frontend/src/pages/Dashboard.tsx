import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  User,
  Settings,
  LogOut,
  MessageSquare,
  CreditCard,
  Shield,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { logout } from "../features/auth.api";
import { setUserData } from "../redux/user.slice";
import type { User as UserType } from "../types/auth";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state: { user: { userData: UserType | null } }) => state.user);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      /* proceed with local logout */
    }
    dispatch(setUserData(null));
    navigate("/auth", { replace: true });
  };

  if (!userData) return null;

  const initials = (userData.name || userData.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-dvh bg-[#0f0720] text-white">
      <header className="border-b border-purple-500/20 bg-[#1a1035]/60 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="AKX AI Logo" className="w-9 h-9 object-contain" />
            <div>
              <h1 className="font-semibold text-white">AKX AI Dashboard</h1>
              <p className="text-xs text-purple-400/70">Secure home</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-300 border border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50"
          >
            <LogOut size={16} />
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-1">
            <div className="bg-[#1a1035]/80 border border-purple-500/20 rounded-2xl p-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-2xl font-bold mb-4">
                {userData.avatar ? (
                  <img src={userData.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  initials
                )}
              </div>
              <h2 className="text-lg font-semibold">{userData.name || "User"}</h2>
              <p className="text-purple-400/70 text-sm mt-1">{userData.email || userData.phone}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                <Shield size={12} />
                JWT Authenticated
              </div>
            </div>

            <nav className="mt-4 bg-[#1a1035]/80 border border-purple-500/20 rounded-2xl overflow-hidden">
              {[
                { id: "profile" as const, icon: User, label: "Profile" },
                { id: "settings" as const, icon: Settings, label: "Settings" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all cursor-pointer border-none ${
                    activeTab === id
                      ? "bg-purple-500/20 text-purple-200"
                      : "bg-transparent text-purple-400/70 hover:bg-purple-500/10"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#1a1035]/80 border border-purple-500/20 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: User, label: "Full Name", value: userData.name || "—" },
                    { icon: Mail, label: "Email", value: userData.email || "—" },
                    { icon: Phone, label: "Phone", value: userData.phone || "—" },
                    { icon: CreditCard, label: "Plan", value: userData.plan || "free" },
                    { icon: CreditCard, label: "Credits", value: String(userData.credits ?? 0) },
                    {
                      icon: Calendar,
                      label: "Member Since",
                      value: userData.createdAt
                        ? new Date(userData.createdAt).toLocaleDateString()
                        : "—",
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/15"
                    >
                      <div className="flex items-center gap-2 text-purple-400/70 text-xs mb-1">
                        <Icon size={12} />
                        {label}
                      </div>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#1a1035]/80 border border-purple-500/20 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Settings</h3>
                <div className="space-y-3">
                  {[
                    { label: "Authentication", desc: "JWT token with 7-day expiry" },
                    { label: "Password Security", desc: "Bcrypt hashed with salt rounds" },
                    { label: "OTP Verification", desc: "Email & SMS with 5-minute expiry" },
                    { label: "Rate Limiting", desc: "Brute force protection enabled" },
                  ].map(({ label, desc }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between p-4 rounded-xl bg-purple-950/30 border border-purple-500/15"
                    >
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-purple-400/60 mt-0.5">{desc}</p>
                      </div>
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="bg-gradient-to-r from-purple-600/20 to-violet-600/20 border border-purple-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare size={18} />
                  Start Chatting
                </h3>
                <p className="text-sm text-purple-300/70 mt-1">
                  Open the AI chat workspace and begin your session.
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 transition-all no-underline shrink-0"
              >
                Open Chat
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
