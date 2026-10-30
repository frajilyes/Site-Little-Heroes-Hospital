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
/** 00:00–23:59. The shape alone accepts "99:99", which a MySQL TIME column does not. */
export const HEURE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

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

/**
 * Ceiling for a field whose rule sets no `max`.
 *
 * Every value here is about to be measured by a regular expression and written to a
 * bounded column, and an unbounded field is where a caller gets to choose how much work
 * the server does for one request. Nothing in this app legitimately sends more.
 */
const MAX_DEFAUT = 20_000;

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
    const max = rule.max ?? MAX_DEFAUT;
    if (rule.min && value.length < rule.min) errors[key] = `${rule.label}: ${rule.min} characters minimum.`;
    // Length before pattern, always: the regexes below are linear on bounded input and
    // quadratic on the unbounded kind, so this ordering is what keeps them cheap.
    else if (value.length > max) errors[key] = `${rule.label}: ${max} characters maximum.`;
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

/**
 * Minimum length of a staff password, kept in step with `scripts/setup-db.mjs`: that
 * script and the registration form are the only two ways an account is ever created, and
 * they must not disagree on what they accept.
 */
export const MOT_DE_PASSE_MIN = 12;

/** Why the password is unacceptable, or null. */
export function motDePasseFaible(password: string): string | null {
  if (password.length < MOT_DE_PASSE_MIN) return `${MOT_DE_PASSE_MIN} characters minimum.`;
  // This one account opens every medical record: a placeholder is the likeliest way in.
  if (/^(?:admin|password|changeme|secret|test)/i.test(password)) return "Too predictable: choose another one.";
  return null;
}
