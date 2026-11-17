import { getNodeStatuses } from "@/lib/server/nodes"

export const dynamic = "force-dynamic"

export async function GET() {
  const nodes = await getNodeStatuses()
  return Response.json(
    { nodes, checkedAt: Math.floor(Date.now() / 1000) },
    { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" } },
  )
}
