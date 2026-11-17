import { AbiCoder } from "ethers"

const PANIC_CODES: Record<number, string> = {
  0x01: "assert(false)",
  0x11: "arithmetic overflow/underflow",
  0x12: "division by zero",
  0x21: "invalid enum value",
  0x22: "invalid storage byte array",
  0x31: "pop() on empty array",
  0x32: "array index out of bounds",
  0x41: "out of memory",
  0x51: "call to uninitialized function",
}

export type DecodedRevert =
  | { kind: "error"; message: string }
  | { kind: "panic"; code: number; message: string }
  | { kind: "custom"; selector: string; data: string }
  | { kind: "empty" }

/** Decodes revert data without throwing, for any error shape. */
export function decodeRevert(output?: string | null): DecodedRevert {
  if (!output || output === "0x") return { kind: "empty" }

  const selector = output.slice(0, 10).toLowerCase()
  const payload = "0x" + output.slice(10)

  try {
    if (selector === "0x08c379a0") {
      const [message] = AbiCoder.defaultAbiCoder().decode(["string"], payload)
      return { kind: "error", message: String(message) }
    }
    if (selector === "0x4e487b71") {
      const [code] = AbiCoder.defaultAbiCoder().decode(["uint256"], payload)
      const n = Number(code)
      return { kind: "panic", code: n, message: PANIC_CODES[n] ?? `0x${n.toString(16)}` }
    }
  } catch {
    // fall through to raw custom error
  }

  return { kind: "custom", selector, data: output }
}
