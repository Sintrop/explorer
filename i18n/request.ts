import { cookies } from "next/headers"
import { getRequestConfig } from "next-intl/server"
import { defaultLocale, isLocale, localeCookie, timeZones } from "./config"

export default getRequestConfig(async () => {
  const store = await cookies()
  const cookieLocale = store.get(localeCookie)?.value
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale

  return {
    locale,
    timeZone: timeZones[locale],
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
