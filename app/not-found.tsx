import { JSX } from "react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Screen } from "@/components/Screen"

export default async function NotFound(): Promise<JSX.Element> {
  const t = await getTranslations("notFound")

  return (
    <Screen>
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-gray-600">{t("body")}</p>
      <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
        {t("back")}
      </Link>
    </Screen>
  )
}
