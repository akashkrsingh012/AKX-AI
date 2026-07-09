const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain an uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain a lowercase letter" };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: "Password must contain a number" };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: "Password must contain a special character" };
  }
  return { valid: true, message: "Password is valid" };
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", rules: [] };

  const rules = [
    { met: password.length >= 8, label: "8+ characters" },
    { met: /[A-Z]/.test(password), label: "Uppercase letter" },
    { met: /[a-z]/.test(password), label: "Lowercase letter" },
    { met: /\d/.test(password), label: "Number" },
    { met: /[^A-Za-z0-9]/.test(password), label: "Special character" },
  ];

  const score = rules.filter((r) => r.met).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
  return { score, label: labels[score] || "", rules, isValid: PASSWORD_REGEX.test(password) };
}
