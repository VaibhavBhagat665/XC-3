import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
  useBalance,
} from "wagmi";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  zetaChainTestnet,
  CONTRACTS,
  CARBON_CREDIT_ABI,
  REGISTRY_ABI,
} from "../lib/web3";
import { parseEther, formatEther } from "viem";

export function useWeb3() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isZetaChain = chainId === zetaChainTestnet.id;

  const switchToZeta = () => {
    try {
      if (!isZetaChain) {
        switchChain({ chainId: zetaChainTestnet.id });
      }
    } catch (error) {
      console.warn("Failed to switch to ZetaChain:", error);
    }
  };

  const connectWallet = async (connector: any) => {
    try {
      await connect({ connector });
    } catch (error: any) {
      // Only log meaningful errors, suppress network/fetch errors
      if (
        !error?.message?.includes("Failed to fetch") &&
        !error?.message?.includes("User rejected") &&
        !error?.message?.includes("User denied")
      ) {
        console.warn("Wallet connection error:", error?.message || error);
      }
      // Silently handle connection errors to prevent app crashes
    }
  };

  return {
    address,
    isConnected,
    connect: connectWallet,
    disconnect,
    connectors,
    chainId,
    isZetaChain,
    switchToZeta,
    switchChain,
    connectError,
  };
}

export function useCarbonCredits(tokenId?: number) {
  const { address, chainId } = useAccount();
  const { writeContract } = useWriteContract();

  const contracts = CONTRACTS[chainId as keyof typeof CONTRACTS];
  const currentTokenId = tokenId || 1; // Default to token ID 1

  // Read carbon credit balance for specific token
  // @ts-ignore - Wagmi type complexity
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: contracts?.universalCarbonCredit as `0x${string}`,
    abi: CARBON_CREDIT_ABI,
    functionName: "balanceOf",
    args: address ? [address, BigInt(currentTokenId)] : undefined,
    query: {
      enabled: !!address && !!contracts?.universalCarbonCredit,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Register project
  const registerProject = async (metaUri: string) => {
    if (!contracts) throw new Error("Contracts not available on this chain");
    if (!address) throw new Error("Wallet not connected");

    try {
      // @ts-ignore - Wagmi type complexity
      const hash = await writeContract({
        address: contracts.carbonRegistry as `0x${string}`,
        abi: REGISTRY_ABI,
        functionName: "registerProject",
        args: [metaUri],
      });
      return hash;
    } catch (error) {
      console.error("Failed to register project:", error);
      throw error;
    }
  };

  // Submit proof
  const submitProof = async (projectId: number, proofCid: string) => {
    if (!contracts) throw new Error("Contracts not available on this chain");
    if (!address) throw new Error("Wallet not connected");

    try {
      // @ts-ignore - Wagmi type complexity
      const hash = await writeContract({
        address: contracts.carbonRegistry as `0x${string}`,
        abi: REGISTRY_ABI,
        functionName: "submitProof",
        args: [BigInt(projectId), proofCid],
      });
      return hash;
    } catch (error) {
      console.error("Failed to submit proof:", error);
      throw error;
    }
  };

  // Mint credits (after verification)
  const mintCredits = async (to: string, tokenId: number, amount: number) => {
    if (!contracts) throw new Error("Contracts not available on this chain");
    if (!address) throw new Error("Wallet not connected");

    try {
      // @ts-ignore - Wagmi type complexity
      const hash = await writeContract({
        address: contracts.universalCarbonCredit as `0x${string}`,
        abi: CARBON_CREDIT_ABI,
        functionName: "mint",
        args: [to as `0x${string}`, BigInt(tokenId), BigInt(amount), "0x"],
      });

      // Refetch balance after minting
      setTimeout(() => refetchBalance(), 2000);
      return hash;
    } catch (error) {
      console.error("Failed to mint credits:", error);
      throw error;
    }
  };

  // Retire credits (burn)
  const retireCredits = async (tokenId: number, amount: number) => {
    if (!address || !contracts)
      throw new Error("Wallet not connected or contracts not available");

    try {
      // @ts-ignore - Wagmi type complexity
      const hash = await writeContract({
        address: contracts.universalCarbonCredit as `0x${string}`,
        abi: CARBON_CREDIT_ABI,
        functionName: "burn",
        args: [address, BigInt(tokenId), BigInt(amount)],
      });

      // Refetch balance after burning
      setTimeout(() => refetchBalance(), 2000);
      return hash;
    } catch (error) {
      console.error("Failed to retire credits:", error);
      throw error;
    }
  };

  // Get balance for multiple token IDs
  const getBalances = async (tokenIds: number[]) => {
    if (!address || !contracts) return [];

    const accounts = tokenIds.map(() => address);
    const ids = tokenIds.map((id) => BigInt(id));

    try {
      // This would need balanceOfBatch implementation
      return [];
    } catch (error) {
      console.error("Failed to get balances:", error);
      return [];
    }
  };

  return {
    balance: balance ? Number(balance) : 0,
    registerProject,
    submitProof,
    mintCredits,
    retireCredits,
    getBalances,
    refetchBalance,
    contracts,
    isContractsAvailable: !!contracts,
  };
}

export function useChainInfo() {
  const chainId = useChainId();

  const getChainName = (id: number) => {
    switch (id) {
      case 7001:
        return "ZetaChain Testnet";
      case 7000:
        return "ZetaChain Mainnet";
      case 11155111:
        return "Sepolia";
      case 80002:
        return "Polygon Amoy";
      case 137:
        return "Polygon";
      case 1:
        return "Ethereum";
      default:
        return "Unknown";
    }
  };

  const getChainColor = (id: number) => {
    switch (id) {
      case 7001:
      case 7000:
        return "text-neon-green";
      case 11155111:
      case 1:
        return "text-neon-cyan";
      case 80002:
      case 137:
        return "text-neon-purple";
      default:
        return "text-white";
    }
  };

  return {
    chainId,
    chainName: getChainName(chainId),
    chainColor: getChainColor(chainId),
  };
}
