export function hexToBigInt(value?: string | null): bigint {
  if (!value || value === "0x") return BigInt(0)
  return BigInt(value)
}

export function hexToNumber(value?: string | null): number {
  return Number(hexToBigInt(value))
}

export function numberToHex(value: number | bigint): string {
  return "0x" + value.toString(16)
}

/**
 * Formats an integer amount with `decimals` decimal places (e.g. wei → coin)
 * without going through floating point, so large balances keep every digit.
 */
export function formatUnitsLocale(
  value: bigint,
  decimals: number,
  locale: string,
  maxFractionDigits = 6,
): string {
  const negative = value < BigInt(0)
  const abs = negative ? -value : value
  const base = BigInt(10) ** BigInt(decimals)
  const integer = abs / base
  const fraction = (abs % base).toString().padStart(decimals, "0").slice(0, maxFractionDigits).replace(/0+$/, "")

  const integerText = new Intl.NumberFormat(locale).format(integer)
  const decimalSeparator = new Intl.NumberFormat(locale).formatToParts(1.1).find((p) => p.type === "decimal")?.value ?? "."

  let text = fraction ? `${integerText}${decimalSeparator}${fraction}` : integerText

  if (!fraction && integer === BigInt(0) && abs > BigInt(0)) {
    text = `<${new Intl.NumberFormat(locale, { maximumFractionDigits: maxFractionDigits }).format(10 ** -maxFractionDigits)}`
  }

  return negative ? `-${text}` : text
}

export function formatInteger(value: bigint | number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function shortenHash(value: string, start = 10, end = 8): string {
  if (value.length <= start + end + 1) return value
  return `${value.slice(0, start)}…${value.slice(-end)}`
}
