import { motion } from "framer-motion";

export default function AuthIllustration() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#1a0b2e] via-[#2d1b69] to-[#4c1d95] flex items-center justify-center p-8 lg:p-12">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-400 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-fuchsia-500 rounded-full blur-[80px]" />
      </div>

      {/* Top-left logo */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2.5">
        <img src="/logo.png" alt="AKX AI Logo" className="w-10 h-10 object-contain" />
        <span className="text-white font-bold text-lg tracking-tight">AKX AI</span>
      </div>

      <div className="relative z-10 max-w-lg text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-purple-200 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Secure AI Platform
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-purple-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
              AKX AI
            </span>
          </h1>
          <p className="text-purple-200/60 text-sm font-medium mb-4">
            Made by Akash Singh Rajput
          </p>
          <p className="text-purple-200/80 text-base sm:text-lg leading-relaxed">
            Your intelligent assistant for coding, research, and creative work.
            Sign in to unlock the full experience.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto lg:mx-0 w-full max-w-sm"
        >
          <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                A
              </div>
              <div>
                <p className="text-white font-semibold text-sm">AKX Assistant</p>
                <p className="text-purple-300 text-xs">Online • Ready to help</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-white/10 rounded-lg px-3 py-2 text-purple-100 text-xs">
                How can I help you build today?
              </div>
              <div className="bg-purple-500/30 rounded-lg px-3 py-2 text-white text-xs ml-4">
                Write code, analyze docs, or brainstorm ideas ✨
              </div>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-fuchsia-400 to-purple-600 rounded-2xl opacity-80 blur-sm"
          />
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-3 -left-3 w-12 h-12 bg-gradient-to-br from-violet-400 to-indigo-600 rounded-xl opacity-60 blur-sm"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start"
        >
          {["256-bit Encryption", "Secure Login", "JWT Secured"].map((badge) => (
            <span
              key={badge}
              className="text-xs text-purple-300/70 bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
            >
              {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
