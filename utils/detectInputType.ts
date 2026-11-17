export type SearchInputType = "address" | "hash" | "blockNumber" | "unknown"

export function detectInputType(value: string): SearchInputType {
  const trimmed = value.trim()

  if (/^0x[0-9a-f]{40}$/i.test(trimmed)) return "address"
  if (/^0x[0-9a-f]{64}$/i.test(trimmed)) return "hash"
  if (/^\d+$/.test(trimmed) && Number.isSafeInteger(Number(trimmed))) return "blockNumber"
  return "unknown"
}

export function isBlockHash(value: string): boolean {
  return /^0x[0-9a-f]{64}$/i.test(value)
}

export function isBlockNumber(value: string): boolean {
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value))
}
