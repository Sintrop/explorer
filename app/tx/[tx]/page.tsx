import { JSX } from "react"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { PageTitle, Screen } from "@/components/Screen"
import { TestnetTag } from "@/components/TestnetTag"
import { HashValue } from "@/components/HashValue"
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
  const hash = tx.toLowerCase()

  return (
    <Screen>
      <PageTitle title={t("title")} subtitle={<HashValue value={hash} />} />
      {network.isTestnet && <TestnetTag txWarning />}
      <TransactionDetails hash={hash} />
    </Screen>
  )
}
