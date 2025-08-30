import { http, createConfig } from "wagmi";
import { mainnet, sepolia, polygon, polygonAmoy } from "wagmi/chains";
import {
  injected,
  metaMask,
  coinbaseWallet,
  walletConnect,
} from "wagmi/connectors";

// ZetaChain configuration
export const zetaChainTestnet = {
  id: 7001,
  name: "ZetaChain Testnet",
  network: "zetachain-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Zeta",
    symbol: "ZETA",
  },
  rpcUrls: {
    public: { http: ["https://zetachain-evm.blockpi.network/v1/rpc/public"] },
    default: { http: ["https://zetachain-evm.blockpi.network/v1/rpc/public"] },
  },
  blockExplorers: {
    default: { name: "ZetaScan", url: "https://zetachain.blockscout.com" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1565020,
    },
  },
} as const;

export const zetaChainMainnet = {
  id: 7000,
  name: "ZetaChain Mainnet",
  network: "zetachain-mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Zeta",
    symbol: "ZETA",
  },
  rpcUrls: {
    public: { http: ["https://zetachain-evm.blockpi.network/v1/rpc/public"] },
    default: { http: ["https://zetachain-evm.blockpi.network/v1/rpc/public"] },
  },
  blockExplorers: {
    default: { name: "ZetaScan", url: "https://zetachain.blockscout.com" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1565020,
    },
  },
} as const;

// Project ID for WalletConnect - only use if valid
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

// Create connectors array conditionally
const getConnectors = () => {
  const baseConnectors = [
    injected(),
    metaMask(),
    coinbaseWallet({
      appName: "XC3 - Cross-Chain Carbon Credits",
      appLogoUrl: "/favicon.svg",
      headlessMode: false,
    }),
  ];

  // Only add WalletConnect if we have a valid project ID
  if (projectId && projectId !== "xc3-demo" && projectId.length > 10) {
    try {
      baseConnectors.push(
        walletConnect({
          projectId,
          metadata: {
            name: "XC3",
            description: "Cross-Chain Carbon Credits",
            url:
              typeof window !== "undefined"
                ? window.location.origin
                : "https://xc3.app",
            icons: ["/favicon.svg"],
          },
        }),
      );
    } catch (error) {
      console.warn("WalletConnect initialization failed:", error);
    }
  }

  return baseConnectors;
};

export const config = createConfig({
  chains: [zetaChainTestnet, zetaChainMainnet, sepolia, polygonAmoy],
  connectors: getConnectors(),
  transports: {
    [zetaChainTestnet.id]: http(),
    [zetaChainMainnet.id]: http(),
    [sepolia.id]: http(),
    [polygonAmoy.id]: http(),
  },
});

// Contract addresses from environment variables
export const CONTRACTS = {
  [zetaChainTestnet.id]: {
    carbonRegistry:
      import.meta.env.VITE_ZETA_TESTNET_REGISTRY ||
      "0x742d35Cc6639C0532fEa41A5CBE3A39aBd6E0555",
    universalCarbonCredit:
      import.meta.env.VITE_ZETA_TESTNET_CREDITS ||
      "0x123d35Cc6639C0532fEa41A5CBE3A39aBd6E0888",
    creditVault:
      import.meta.env.VITE_ZETA_TESTNET_VAULT ||
      "0x456d35Cc6639C0532fEa41A5CBE3A39aBd6E0999",
  },
  [sepolia.id]: {
    carbonRegistry:
      import.meta.env.VITE_SEPOLIA_REGISTRY ||
      "0x789d35Cc6639C0532fEa41A5CBE3A39aBd6E0aaa",
    universalCarbonCredit:
      import.meta.env.VITE_SEPOLIA_CREDITS ||
      "0xabcd35Cc6639C0532fEa41A5CBE3A39aBd6E0bbb",
    creditVault:
      import.meta.env.VITE_SEPOLIA_VAULT ||
      "0xdefd35Cc6639C0532fEa41A5CBE3A39aBd6E0ccc",
  },
  [polygonAmoy.id]: {
    carbonRegistry:
      import.meta.env.VITE_POLYGON_AMOY_REGISTRY ||
      "0x111d35Cc6639C0532fEa41A5CBE3A39aBd6E0ddd",
    universalCarbonCredit:
      import.meta.env.VITE_POLYGON_AMOY_CREDITS ||
      "0x222d35Cc6639C0532fEa41A5CBE3A39aBd6E0eee",
    creditVault:
      import.meta.env.VITE_POLYGON_AMOY_VAULT ||
      "0x333d35Cc6639C0532fEa41A5CBE3A39aBd6E0fff",
  },
} as const;

// ERC-1155 ABI for carbon credits
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
  {
    inputs: [
      { name: "accounts", type: "address[]" },
      { name: "ids", type: "uint256[]" },
    ],
    name: "balanceOfBatch",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "from", type: "address" },
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Registry ABI
export const REGISTRY_ABI = [
  {
    inputs: [{ name: "metaUri", type: "string" }],
    name: "registerProject",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "projectId", type: "uint256" },
      { name: "proofCid", type: "string" },
    ],
    name: "submitProof",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "projectId", type: "uint256" },
      { name: "score", type: "uint256" },
      { name: "uri", type: "string" },
    ],
    name: "postAttestation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
