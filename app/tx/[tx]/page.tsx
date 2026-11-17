import { JSX } from "react"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Screen } from "@/components/Screen"
import { TestnetTag } from "@/components/TestnetTag"
import { network } from "@/config/network"
import { shortenHash } from "@/lib/format"
import { TransactionDetails } from "./components/TransactionDetails"

type Params = { params: Promise<{ tx: string }> }

const isTxHash = (value: string) => /^0x[0-9a-f]{64}$/i.test(value)

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tx } = await params
  const t = await getTranslations("tx")
  return { title: t("metaTitle", { hash: shortenHash(tx) }) }
}

export default async function Tx({ params }: Params): Promise<JSX.Element> {
  const { tx } = await params
  if (!isTxHash(tx)) notFound()

  const t = await getTranslations("tx")

  return (
    <Screen>
      <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
      <p className="mt-2 font-mono text-sm break-all text-gray-600">{tx}</p>

      {network.isTestnet && <TestnetTag txWarning />}
      <TransactionDetails hash={tx.toLowerCase()} />
    </Screen>
  )
}
