import { JSX } from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { PageTitle, Screen } from "@/components/Screen"
import { AddressLink } from "@/components/Links"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { contractLabels, hasRegistry } from "@/config/contracts/registry"

const GROUPS: { key: string; names: string[] }[] = [
  { key: "token", names: ["RegenerationCredit", "RegenerationCreditImpact"] },
  { key: "community", names: ["CommunityRules", "InvitationRules", "SupporterRules"] },
  { key: "inspection", names: ["InspectionRules", "RegenerationIndexRules"] },
  {
    key: "roles",
    names: [
      "RegeneratorRules",
      "RegeneratorPool",
      "InspectorRules",
      "InspectorPool",
      "ResearcherRules",
      "ResearcherPool",
      "DeveloperRules",
      "DeveloperPool",
      "ContributorRules",
      "ContributorPool",
      "ActivistRules",
      "ActivistPool",
    ],
  },
  { key: "validation", names: ["ValidationRules", "ValidationPool", "VoteRules"] },
]

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("protocol")
  return { title: t("title") }
}

export default async function Protocol(): Promise<JSX.Element> {
  if (!hasRegistry) notFound()
  const t = await getTranslations("protocol")
  const tc = await getTranslations("contracts")

  const grouped = new Set(GROUPS.flatMap((g) => g.names))
  const groups = [...GROUPS, { key: "other", names: contractLabels.filter((c) => !grouped.has(c.name)).map((c) => c.name) }].filter(
    (g) => g.names.some((n) => contractLabels.some((c) => c.name === n)),
  )

  return (
    <Screen>
      <PageTitle title={t("title")} />
      <p className="-mt-2 mb-6 max-w-3xl text-muted-foreground">{t("intro", { count: contractLabels.length })}</p>

      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <Card key={group.key}>
            <CardHeader title={t(`groups.${group.key}`)} />
            <CardBody>
              <ul className="flex flex-col divide-y">
                {group.names.map((name) => {
                  const contract = contractLabels.find((c) => c.name === name)
                  if (!contract) return null
                  return (
                    <li key={name} className="flex flex-col gap-1.5 py-3 lg:flex-row lg:items-start lg:gap-6">
                      <div className="lg:w-[30rem] lg:shrink-0">
                        <AddressLink address={contract.address} copy />
                      </div>
                      <p className="text-sm text-muted-foreground">{tc.has(`${name}.description`) ? tc(`${name}.description`) : ""}</p>
                    </li>
                  )
                })}
              </ul>
            </CardBody>
          </Card>
        ))}
      </div>
    </Screen>
  )
}
