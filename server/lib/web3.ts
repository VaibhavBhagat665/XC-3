import { createPublicClient, http, Address } from "viem";
import { Chain, sepolia, polygonAmoy } from "viem/chains";

export const CARBON_CREDIT_ABI = [
  {
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

function getChain(chainId: number): Chain | null {
  switch (chainId) {
    case 11155111:
      return sepolia;
    case 80002:
      return polygonAmoy;
    default:
      return null;
  }
}

function getRpcUrl(chainId: number): string | null {
  switch (chainId) {
    case 11155111:
      return process.env.SEPOLIA_RPC_URL || null;
    case 80002:
      return process.env.POLYGON_AMOY_RPC_URL || null;
    default:
      return null;
  }
}

export function getPublicClient(chainId: number) {
  const chain = getChain(chainId);
  if (!chain) return null;
  const rpc = getRpcUrl(chainId);
  if (!rpc) return null;
  return createPublicClient({ chain, transport: http(rpc) });
}

export async function readErc1155Balance(
  chainId: number,
  contract: Address,
  owner: Address,
  tokenId: bigint,
): Promise<bigint | null> {
  const client = getPublicClient(chainId);
  if (!client) return null;
  try {
    const result = await client.readContract({
      address: contract,
      abi: CARBON_CREDIT_ABI,
      functionName: "balanceOf",
      args: [owner, tokenId],
    });
    return BigInt(result as any);
  } catch (err) {
    console.warn("readErc1155Balance failed:", (err as Error).message);
    return null;
  }
}
