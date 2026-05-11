export const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const LOWER = "abcdefghijklmnopqrstuvwxyz";
export const NUMS  = "0123456789";
export const SYMS  = "!@#$%^&*()-_=+[]{}|;:,.<>?";

export type PasswordOpts = {
    upper: boolean;
    lower: boolean;
    nums: boolean;
    syms: boolean;
};

export type PasswordStrength = {
  label: string;
  color: string;
  pct: number;
};




