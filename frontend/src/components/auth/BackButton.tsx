import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export default function BackButton({ onClick, label = "Back" }: BackButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors cursor-pointer bg-transparent border-none p-0 mb-2"
    >
      <ArrowLeft size={16} />
      {label}
    </motion.button>
  );
}
