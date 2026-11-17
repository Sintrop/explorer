"use client"

import { JSX, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { getAddressTransfers, getTokenBalance, getUserProfile } from "@/services/protocol"
import { TOKEN_DECIMALS, TOKEN_SYMBOL, getContractLabel } from "@/config/contracts/registry"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { DataItem, DataList } from "@/components/DataItem"
import { Amount } from "@/components/Amount"
import { TransferTable } from "@/components/TransferTable"
import { EmptyState, Loading, RpcErrorMessage } from "@/components/QueryState"
import { Skeleton } from "@/components/ui/Skeleton"

const PAGE = 25

export function ProtocolSection({ address }: { address: string }): JSX.Element {
  const t = useTranslations("address")
  const tr = useTranslations("roles")
  const isContract = !!getContractLabel(address)
  const [visible, setVisible] = useState(PAGE)

  const profile = useQuery({ queryKey: ["profile", address], queryFn: () => getUserProfile(address), enabled: !isContract })
  const token = useQuery({ queryKey: ["rcBalance", address], queryFn: () => getTokenBalance(address) })
  const transfers = useQuery({ queryKey: ["rcTransfers", address], queryFn: () => getAddressTransfers(address) })

  return (
    <>
      <Card>
        <CardHeader title={t("protocol")} />
        <CardBody>
          <DataList>
            {!isContract && (
              <DataItem label={t("userType")}>
                {profile.isLoading ? (
                  <Skeleton className="h-5 w-32" />
                ) : profile.isError ? (
                  "—"
                ) : profile.data?.type === "undefined" ? (
                  <span className="text-muted-foreground">{t("notRegistered")}</span>
                ) : (
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-sm font-medium text-accent-foreground">{tr(profile.data!.type)}</span>
                )}
              </DataItem>
            )}
            {!isContract && profile.data?.name && <DataItem label={t("registeredName")}>{profile.data.name}</DataItem>}
            <DataItem label={t("rcBalance")}>
              {token.isLoading ? (
                <Skeleton className="h-5 w-40" />
              ) : token.isError ? (
                "—"
              ) : (
                <Amount value={token.data!.balance} decimals={TOKEN_DECIMALS} symbol={TOKEN_SYMBOL} maxFractionDigits={6} />
              )}
            </DataItem>
            {token.data && token.data.certified > BigInt(0) && (
              <DataItem label={t("rcCertified")}>
                <Amount value={token.data.certified} decimals={TOKEN_DECIMALS} symbol={TOKEN_SYMBOL} maxFractionDigits={6} />
              </DataItem>
            )}
          </DataList>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("rcTransfers")} action={transfers.data ? transfers.data.length : undefined} />
        {transfers.isLoading ? (
          <Loading rows={5} />
        ) : transfers.isError ? (
          <RpcErrorMessage onRetry={() => transfers.refetch()} />
        ) : transfers.data!.length === 0 ? (
          <CardBody>
            <EmptyState>{t("noTransfers")}</EmptyState>
          </CardBody>
        ) : (
          <CardBody>
            <TransferTable transfers={transfers.data!.slice(0, visible)} perspective={address} />
            {transfers.data!.length > visible && (
              <div className="flex justify-center py-4">
                <button
                  onClick={() => setVisible((v) => v + PAGE)}
                  className="rounded-full border px-4 py-1.5 text-sm hover:cursor-pointer hover:bg-muted"
                >
                  {t("showMore")}
                </button>
              </div>
            )}
          </CardBody>
        )}
      </Card>
    </>
  )
}
