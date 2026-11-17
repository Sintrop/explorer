import { JSX } from "react"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Screen } from "@/components/Screen"
import { isBlockHash, isBlockNumber } from "@/utils/detectInputType"
import { shortenHash } from "@/lib/format"
import { BlockData } from "./components/BlockData"

type Params = { params: Promise<{ block: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { block } = await params
  const t = await getTranslations("block")
  return { title: t("metaTitle", { block: isBlockHash(block) ? shortenHash(block) : block }) }
}

export default async function Block({ params }: Params): Promise<JSX.Element> {
  const { block } = await params

  if (!isBlockNumber(block) && !isBlockHash(block)) notFound()

  return (
    <Screen>
      <BlockData block={block} />
    </Screen>
  )
}
