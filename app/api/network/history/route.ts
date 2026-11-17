import { NextRequest } from "next/server"
import { getHistory, Range, RANGES } from "@/lib/server/history"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const param = request.nextUrl.searchParams.get("range") ?? "7d"
  const range = (param in RANGES ? param : "7d") as Range
  try {
    const points = await getHistory(range)
    return Response.json({ range, points }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } })
  } catch {
    return Response.json({ error: "rpc" }, { status: 502 })
  }
}
