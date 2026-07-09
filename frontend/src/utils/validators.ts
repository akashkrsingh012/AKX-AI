const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+?[1-9]\d{7,14}|\d{10})$/;

export function parseIdentifier(raw: string) {
  const value = raw.trim();
  if (!value) return { valid: false as const, message: "Email or phone is required" };

  if (EMAIL_REGEX.test(value)) {
    return { valid: true as const, type: "email" as const, value: value.toLowerCase() };
  }

  const digits = value.replace(/\D/g, "");
  const normalized =
    digits.length === 10 ? `+91${digits}` : value.startsWith("+") ? `+${digits}` : `+${digits}`;

  if (PHONE_REGEX.test(value) || /^\+?[1-9]\d{7,14}$/.test(normalized)) {
    return { valid: true as const, type: "phone" as const, value: normalized };
  }

  return { valid: false as const, message: "Enter a valid email or phone number" };
}

export function validatePassword(password: string) {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Include an uppercase letter";
  if (!/[a-z]/.test(password)) return "Include a lowercase letter";
  if (!/\d/.test(password)) return "Include a number";
  if (!/[^A-Za-z0-9]/.test(password)) return "Include a special character";
  return null;
}

export function getPasswordStrength(password: string) {
  if (!password) return { score: 0, label: "", color: "var(--border)" };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const map: Record<number, { label: string; color: string }> = {
    1: { label: "Weak", color: "#f87171" },
    2: { label: "Fair", color: "#fbbf24" },
    3: { label: "Good", color: "#a78bfa" },
    4: { label: "Strong", color: "#34d399" },
    5: { label: "Excellent", color: "#34d399" },
  };

  return { score, ...(map[score] || map[1]) };
}
