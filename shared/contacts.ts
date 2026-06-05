// Single source of truth for support contacts shown to users.
// Override in production via env-vars (server reads process.env at startup,
// client gets values inlined by Vite at build time).

export const SUPPORT_CONTACTS = {
  telegram:
    (typeof process !== "undefined" && process.env?.SUPPORT_TELEGRAM) ||
    (typeof import.meta !== "undefined" &&
      (import.meta as any).env?.VITE_SUPPORT_TELEGRAM) ||
    "https://t.me/anastasiia_kuzakova",
  email:
    (typeof process !== "undefined" && process.env?.SUPPORT_EMAIL) ||
    (typeof import.meta !== "undefined" &&
      (import.meta as any).env?.VITE_SUPPORT_EMAIL) ||
    "support@example.com",
  phone:
    (typeof process !== "undefined" && process.env?.SUPPORT_PHONE) ||
    (typeof import.meta !== "undefined" &&
      (import.meta as any).env?.VITE_SUPPORT_PHONE) ||
    "",
} as const;
