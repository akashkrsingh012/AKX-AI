import { useRef } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
}

export default function OtpInput({ value, onChange, onComplete, disabled }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  const focusIndex = (index: number) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const arr = digits.map((d) => (d === " " ? "" : d));
    arr[index] = char;
    const next = arr.join("").trimEnd();
    onChange(next);

    if (char && index < 5) focusIndex(index + 1);
    if (char && index === 5 && next.length === 6) onComplete?.(next);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      focusIndex(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    onChange(pasted);
    if (pasted.length === 6) {
      onComplete?.(pasted);
      focusIndex(5);
    } else {
      focusIndex(pasted.length);
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit.trim()}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold rounded-xl bg-purple-950/50 border border-purple-500/30 text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50"
        />
      ))}
    </div>
  );
}
