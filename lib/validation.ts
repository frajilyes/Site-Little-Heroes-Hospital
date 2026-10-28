// Simple, explicit FormData validation (no external dependency).
export type Rule = {
  label: string;
  required?: boolean;
  min?: number; // minimum length
  max?: number; // maximum length
  pattern?: RegExp;
  patternMsg?: string;
  int?: [number, number]; // bounded integer
  date?: boolean; // real calendar date, "YYYY-MM-DD"
};

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const TEL = /^[+0-9 ().-]{8,20}$/;
export const DATE = /^\d{4}-\d{2}-\d{2}$/;
export const HEURE = /^\d{2}:\d{2}$/;

/**
 * A real date, not just the right shape: DATE alone accepts "2026-13-45" and
 * "2025-02-30", which MySQL then stores as NULL without complaining.
 */
export function estDate(value: string): boolean {
  if (!DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function validate<K extends string>(formData: FormData, rules: Record<K, Rule>) {
  const data = {} as Record<K, string>;
  const errors: Record<string, string> = {};

  for (const key of Object.keys(rules) as K[]) {
    const rule = rules[key];
    const raw = formData.get(key);
    const value = typeof raw === "string" ? raw.trim() : "";
    data[key] = value;

    if (!value) {
      if (rule.required) errors[key] = `${rule.label} is required.`;
      continue;
    }
    if (rule.min && value.length < rule.min) errors[key] = `${rule.label}: ${rule.min} characters minimum.`;
    else if (rule.max && value.length > rule.max) errors[key] = `${rule.label}: ${rule.max} characters maximum.`;
    else if (rule.pattern && !rule.pattern.test(value)) errors[key] = rule.patternMsg ?? `${rule.label} is invalid.`;
    else if (rule.date && !estDate(value)) errors[key] = rule.patternMsg ?? `${rule.label} is invalid.`;
    else if (rule.int) {
      const n = Number(value);
      if (!Number.isInteger(n) || n < rule.int[0] || n > rule.int[1])
        errors[key] = `${rule.label} must be between ${rule.int[0]} and ${rule.int[1]}.`;
    }
  }
  return { data, errors, ok: Object.keys(errors).length === 0 };
}
