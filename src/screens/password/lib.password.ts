import { UPPER, LOWER, NUMS, SYMS, PasswordOpts, PasswordStrength } from "./types.password";

const CHARSETS = {
  upper: UPPER,
  lower: LOWER,
  nums: NUMS,
  syms: SYMS,
} satisfies Record<keyof PasswordOpts, string>;

export function generate(len: number, opts: PasswordOpts): string {
  const pool =
    Object.entries(CHARSETS)
      .filter(([key]) => opts[key as keyof PasswordOpts])
      .map(([, chars]) => chars)
      .join("") || LOWER;

  const random = new Uint32Array(len);

  crypto.getRandomValues(random);

  return Array.from(random, n => pool[n % pool.length]).join("");
}

const RULES = [
  (pw: string) => pw.length >= 8,
  (pw: string) => pw.length >= 12,
  (pw: string) => pw.length >= 20,
  (pw: string) => /[A-Z]/.test(pw),
  (pw: string) => /[a-z]/.test(pw),
  (pw: string) => /[0-9]/.test(pw),
  (pw: string) => /[^A-Za-z0-9]/.test(pw),
];

export function getStrength(pw: string): PasswordStrength {
  if (!pw) {
    return {
      label: "",
      color: "",
      pct: 0,
    };
  }

  const score = RULES.reduce(
    (total, rule) => total + Number(rule(pw)),
    0
  );

  if (score <= 2) {
    return {
      label: "Muito fraca",
      color: "#ef4444",
      pct: 10,
    };
  }

  if (score <= 3) {
    return {
      label: "Fraca",
      color: "#ef4444",
      pct: 25,
    };
  }

  if (score <= 5) {
    return {
      label: "Média",
      color: "#f59e0b",
      pct: 60,
    };
  }

  if (score <= 6) {
    return {
      label: "Forte",
      color: "#22c55e",
      pct: 85,
    };
  }

  return {
    label: "Muito forte",
    color: "#00e676",
    pct: 100,
  };
}
