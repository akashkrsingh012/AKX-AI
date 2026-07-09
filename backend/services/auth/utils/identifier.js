const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

export function normalizePhone(phone) {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (String(phone).startsWith("+")) return `+${digits}`;
  return `+${digits}`;
}

export function parseIdentifier(raw) {
  const value = String(raw || "").trim();
  if (!value) {
    return { valid: false, message: "Email or phone number is required" };
  }

  if (EMAIL_REGEX.test(value)) {
    return {
      valid: true,
      type: "email",
      value: value.toLowerCase(),
      key: value.toLowerCase(),
    };
  }

  const normalized = normalizePhone(value);
  if (PHONE_REGEX.test(normalized)) {
    return {
      valid: true,
      type: "phone",
      value: normalized,
      key: normalized,
    };
  }

  return { valid: false, message: "Enter a valid email or phone number" };
}

export async function findUserByIdentifier(User, identifier) {
  const parsed = parseIdentifier(identifier);
  if (!parsed.valid) return null;

  if (parsed.type === "email") {
    return User.findOne({ email: parsed.value });
  }
  return User.findOne({ phone: parsed.value });
}
