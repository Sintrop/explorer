import { getMinerShares } from "@/lib/server/history"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await getMinerShares()
    return Response.json(data, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } })
  } catch {
    return Response.json({ error: "rpc" }, { status: 502 })
  }
}
