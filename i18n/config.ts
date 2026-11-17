export const locales = ["pt", "en"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "pt"
export const localeCookie = "NEXT_LOCALE"

export const timeZones: Record<Locale, string> = {
  pt: "America/Sao_Paulo",
  en: "UTC",
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value)
}
