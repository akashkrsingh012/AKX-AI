import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";

interface SocialButtonsProps {
  onGoogle: () => void;
  onFacebook: () => void;
  onApple: () => void;
  loading?: boolean;
}

export default function SocialButtons({
  onGoogle,
  onFacebook,
  onApple,
  loading,
}: SocialButtonsProps) {
  const buttons = [
    { icon: FaGoogle, label: "Google", onClick: onGoogle, color: "hover:bg-red-500/10 hover:border-red-400/40" },
    { icon: FaFacebook, label: "Facebook", onClick: onFacebook, color: "hover:bg-blue-500/10 hover:border-blue-400/40" },
    { icon: FaApple, label: "Apple", onClick: onApple, color: "hover:bg-gray-500/10 hover:border-gray-400/40" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {buttons.map(({ icon: Icon, label, onClick, color }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          disabled={loading}
          title={`Continue with ${label}`}
          className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-purple-500/20 bg-purple-950/30 text-purple-200 transition-all cursor-pointer disabled:opacity-50 ${color}`}
        >
          <Icon size={20} />
          <span className="text-[10px] sm:text-xs font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
