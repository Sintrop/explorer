import { Interface, ParamType, Result } from "ethers"
import { allErrorsInterface, getContractInterface } from "@/config/contracts/abis"

export type ArgValue = string | bigint | boolean | number | null | DecodedArg[] | ArgValue[]

export interface DecodedArg {
  name: string
  type: string
  value: ArgValue
}

export interface DecodedCall {
  contract?: string
  name: string
  signature: string
  args: DecodedArg[]
}

export interface DecodedLog {
  contract?: string
  name: string
  args: DecodedArg[]
}

export interface RawLog {
  address: string
  topics: string[]
  data: string
}

export interface TokenTransfer {
  token: string
  from: string
  to: string
  value: bigint
}

const generic = new Interface([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "function transfer(address to, uint256 amount)",
  "function approve(address spender, uint256 amount)",
  "function transferFrom(address from, address to, uint256 amount)",
])

export const TRANSFER_TOPIC = generic.getEvent("Transfer")!.topicHash

function normalize(param: ParamType, value: unknown): ArgValue {
  if (param.isTuple()) return toArgs(param.components, value as Result)
  if (param.isArray()) return (value as unknown[]).map((item) => normalize(param.arrayChildren, item))
  if (typeof value === "string" || typeof value === "bigint" || typeof value === "boolean" || typeof value === "number") {
    return value
  }
  return value == null ? null : String(value)
}

function toArgs(params: readonly ParamType[], result: Result): DecodedArg[] {
  return params.map((param, i) => ({
    name: param.name || `#${i}`,
    type: param.format("sighash"),
    value: normalize(param, result[i]),
  }))
}

/** Decodes calldata with the target contract ABI, falling back to common ERC-20 calls. */
export function decodeCall(to: string | null | undefined, input: string): DecodedCall | null {
  if (!input || input === "0x" || input.length < 10) return null

  const known = getContractInterface(to)
  const candidates: [Interface, string | undefined][] = known ? [[known.iface, known.name], [generic, undefined]] : [[generic, undefined]]

  for (const [iface, contract] of candidates) {
    try {
      const parsed = iface.parseTransaction({ data: input })
      if (parsed) {
        return { contract, name: parsed.name, signature: parsed.signature, args: toArgs(parsed.fragment.inputs, parsed.args) }
      }
    } catch {
      // try the next interface
    }
  }
  return null
}

export function decodeLog(log: RawLog): DecodedLog | null {
  const known = getContractInterface(log.address)
  const candidates: [Interface, string | undefined][] = known ? [[known.iface, known.name], [generic, undefined]] : [[generic, undefined]]

  for (const [iface, contract] of candidates) {
    try {
      const parsed = iface.parseLog({ topics: log.topics, data: log.data })
      if (parsed) return { contract, name: parsed.name, args: toArgs(parsed.fragment.inputs, parsed.args) }
    } catch {
      // try the next interface
    }
  }
  return null
}

/** ERC-20 transfers emitted in a list of logs (ERC-721 transfers have 4 topics and are skipped). */
export function extractTransfers(logs: RawLog[]): TokenTransfer[] {
  return logs
    .filter((log) => log.topics[0] === TRANSFER_TOPIC && log.topics.length === 3)
    .map((log) => {
      const parsed = generic.parseLog({ topics: log.topics, data: log.data })!
      return { token: log.address, from: parsed.args.from, to: parsed.args.to, value: parsed.args.value }
    })
}

export function decodeCustomError(data: string): DecodedCall | null {
  try {
    const parsed = allErrorsInterface.parseError(data)
    if (!parsed) return null
    return { name: parsed.name, signature: parsed.signature, args: toArgs(parsed.fragment.inputs, parsed.args) }
  } catch {
    return null
  }
}
