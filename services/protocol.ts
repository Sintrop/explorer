import { Interface, Result, zeroPadValue } from "ethers"
import { getInterfaceByName } from "@/config/contracts/abis"
import { getContractByName, tokenContract, contractLabels } from "@/config/contracts/registry"
import { TRANSFER_TOPIC, TokenTransfer, decodeLog, DecodedLog } from "@/lib/decode"
import { ethCall, getLogs, LogEntry } from "./chain"

async function read(contractName: string, fn: string, args: unknown[] = []): Promise<Result> {
  const contract = getContractByName(contractName)
  const iface = getInterfaceByName(contractName)
  if (!contract || !iface) throw new Error(`unknown contract ${contractName}`)
  const data = iface.encodeFunctionData(fn, args)
  return iface.decodeFunctionResult(fn, await ethCall(contract.address, data))
}

export const USER_TYPES = ["undefined", "regenerator", "inspector", "researcher", "developer", "contributor", "activist", "supporter"] as const
export type UserType = (typeof USER_TYPES)[number]

const PROFILE_GETTERS: Partial<Record<UserType, [string, string]>> = {
  regenerator: ["RegeneratorRules", "getRegenerator"],
  inspector: ["InspectorRules", "getInspector"],
  researcher: ["ResearcherRules", "getResearcher"],
  developer: ["DeveloperRules", "getDeveloper"],
  contributor: ["ContributorRules", "getContributor"],
  activist: ["ActivistRules", "getActivist"],
  supporter: ["SupporterRules", "getSupporter"],
}

export interface UserProfile {
  type: UserType
  name?: string
}

export async function getUserProfile(address: string): Promise<UserProfile> {
  const [typeIndex] = await read("CommunityRules", "getUser", [address])
  const type = USER_TYPES[Number(typeIndex)] ?? "undefined"
  const getter = PROFILE_GETTERS[type]
  if (!getter) return { type }

  try {
    const [profile] = await read(getter[0], getter[1], [address])
    const name = typeof profile?.name === "string" ? profile.name : undefined
    return { type, name }
  } catch {
    return { type }
  }
}

export interface TokenBalance {
  balance: bigint
  certified: bigint
}

export async function getTokenBalance(address: string): Promise<TokenBalance> {
  const [[balance], [certified]] = await Promise.all([
    read("RegenerationCredit", "balanceOf", [address]),
    read("RegenerationCredit", "certificate", [address]),
  ])
  return { balance, certified }
}

export interface TokenStats {
  totalSupply: bigint
  totalLocked: bigint
  totalCertified: bigint
}

export async function getTokenStats(): Promise<TokenStats> {
  const [[totalSupply], [totalLocked], [totalCertified]] = await Promise.all([
    read("RegenerationCredit", "totalSupply"),
    read("RegenerationCredit", "totalLocked"),
    read("RegenerationCredit", "totalCertified"),
  ])
  return { totalSupply, totalLocked, totalCertified }
}

export interface TransferEntry extends TokenTransfer {
  blockNumber: number
  transactionHash: string
  logIndex: number
}

const transferIface = new Interface(["event Transfer(address indexed from, address indexed to, uint256 value)"])

function toTransfer(log: LogEntry): TransferEntry {
  const parsed = transferIface.parseLog({ topics: log.topics, data: log.data })!
  return {
    token: log.address,
    from: parsed.args.from,
    to: parsed.args.to,
    value: parsed.args.value,
    blockNumber: Number(BigInt(log.blockNumber)),
    transactionHash: log.transactionHash,
    logIndex: Number(BigInt(log.logIndex)),
  }
}

const newestFirst = (a: TransferEntry, b: TransferEntry) => b.blockNumber - a.blockNumber || b.logIndex - a.logIndex

/** Every RC transfer sent or received by an address, newest first. */
export async function getAddressTransfers(address: string): Promise<TransferEntry[]> {
  if (!tokenContract) return []
  const topic = zeroPadValue(address, 32).toLowerCase()
  const [sent, received] = await Promise.all([
    getLogs({ address: tokenContract.address, topics: [TRANSFER_TOPIC, topic] }),
    getLogs({ address: tokenContract.address, topics: [TRANSFER_TOPIC, null, topic] }),
  ])
  const seen = new Set<string>()
  return [...sent, ...received]
    .filter((log) => {
      const key = `${log.transactionHash}:${log.logIndex}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map(toTransfer)
    .sort(newestFirst)
}

/** Every RC transfer since genesis, newest first. */
export async function getAllTransfers(): Promise<TransferEntry[]> {
  if (!tokenContract) return []
  const logs = await getLogs({ address: tokenContract.address, topics: [TRANSFER_TOPIC] })
  return logs.map(toTransfer).sort(newestFirst)
}

/** Balances rebuilt from the full transfer history (mints come from and burns go to the zero address). */
export function holdersFromTransfers(transfers: TransferEntry[]): { address: string; balance: bigint }[] {
  const balances = new Map<string, bigint>()
  const ZERO = "0x0000000000000000000000000000000000000000"
  for (const t of transfers) {
    if (t.from !== ZERO) balances.set(t.from, (balances.get(t.from) ?? BigInt(0)) - t.value)
    if (t.to !== ZERO) balances.set(t.to, (balances.get(t.to) ?? BigInt(0)) + t.value)
  }
  return [...balances.entries()]
    .filter(([, balance]) => balance > BigInt(0))
    .map(([address, balance]) => ({ address, balance }))
    .sort((a, b) => (b.balance > a.balance ? 1 : b.balance < a.balance ? -1 : 0))
}

export interface ProtocolEvent extends DecodedLog {
  address: string
  blockNumber: number
  transactionHash: string
  logIndex: number
}

/** Decoded events emitted by the protocol contracts in the last `blocks` blocks, newest first. */
export async function getProtocolActivity(latest: number, blocks: number): Promise<ProtocolEvent[]> {
  if (contractLabels.length === 0) return []
  const logs = await getLogs({ address: contractLabels.map((c) => c.address), fromBlock: Math.max(0, latest - blocks) })
  return logs
    .map((log) => {
      const decoded = decodeLog(log)
      return {
        contract: decoded?.contract,
        name: decoded?.name ?? log.topics[0]?.slice(0, 10) ?? "?",
        args: decoded?.args ?? [],
        address: log.address,
        blockNumber: Number(BigInt(log.blockNumber)),
        transactionHash: log.transactionHash,
        logIndex: Number(BigInt(log.logIndex)),
      }
    })
    .sort((a, b) => b.blockNumber - a.blockNumber || b.logIndex - a.logIndex)
}
