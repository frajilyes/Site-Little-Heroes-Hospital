// Validation simple et explicite des FormData (pas de dépendance externe).
export type Rule = {
  label: string;
  required?: boolean;
  min?: number; // longueur minimale
  max?: number; // longueur maximale
  pattern?: RegExp;
  patternMsg?: string;
  int?: [number, number]; // entier borné
};

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const TEL = /^[+0-9 ().-]{8,20}$/;
export const DATE = /^\d{4}-\d{2}-\d{2}$/;
export const HEURE = /^\d{2}:\d{2}$/;

export function validate<K extends string>(formData: FormData, rules: Record<K, Rule>) {
  const data = {} as Record<K, string>;
  const errors: Record<string, string> = {};

  for (const key of Object.keys(rules) as K[]) {
    const rule = rules[key];
    const raw = formData.get(key);
    const value = typeof raw === "string" ? raw.trim() : "";
    data[key] = value;

    if (!value) {
      if (rule.required) errors[key] = `${rule.label} est obligatoire.`;
      continue;
    }
    if (rule.min && value.length < rule.min) errors[key] = `${rule.label} : ${rule.min} caractères minimum.`;
    else if (rule.max && value.length > rule.max) errors[key] = `${rule.label} : ${rule.max} caractères maximum.`;
    else if (rule.pattern && !rule.pattern.test(value)) errors[key] = rule.patternMsg ?? `${rule.label} est invalide.`;
    else if (rule.int) {
      const n = Number(value);
      if (!Number.isInteger(n) || n < rule.int[0] || n > rule.int[1])
        errors[key] = `${rule.label} doit être entre ${rule.int[0]} et ${rule.int[1]}.`;
    }
  }
  return { data, errors, ok: Object.keys(errors).length === 0 };
}
