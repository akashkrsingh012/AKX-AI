import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthIllustration from "./AuthIllustration";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col lg:flex-row bg-[#0f0720]">
      <div className="hidden lg:block lg:w-1/2 xl:w-[55%] min-h-dvh">
        <AuthIllustration />
      </div>

      <div className="lg:hidden h-32 sm:h-40 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b2e] via-[#2d1b69] to-[#4c1d95]">
          <div className="absolute top-4 right-4 w-32 h-32 bg-purple-500 rounded-full blur-[60px] opacity-40" />
        </div>
        <div className="relative z-10 h-full flex items-center justify-center px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2.5 mb-2">
              <img src="/logo.png" alt="AKX AI Logo" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="text-xl font-bold text-white">
              Welcome to <span className="text-purple-300">AKX AI</span>
            </h1>
            <p className="text-purple-300/70 text-sm mt-1">Secure sign in</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#1a1035]/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_8px_60px_rgba(124,58,237,0.15)]">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{title}</h2>
              {subtitle && <p className="text-purple-300/70 text-sm">{subtitle}</p>}
            </div>

            <AnimatePresence mode="wait">{children}</AnimatePresence>
          </div>

          <p className="text-center text-purple-400/50 text-xs mt-6">
            Protected by JWT authentication &amp; rate limiting
          </p>
        </motion.div>
      </div>
    </div>
  );
}
