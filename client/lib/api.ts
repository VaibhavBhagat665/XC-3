// API client for XC3 backend

// Environment-based API base URL configuration
// Development: /api (integrated with Vite dev server)
// Production: can be provided via VITE_API_URL; fallback to external backend if /api isn't available (e.g., on Vercel static hosting)
const initialApiBase = import.meta.env.VITE_API_URL || "/api";
let RUNTIME_API_BASE = initialApiBase;

function computeFallbackApiBase(): string | null {
  // If an explicit API was provided, don't override
  if (initialApiBase && initialApiBase !== "/api") return null;

  // Allow specifying a fallback via env as well
  const envFallback = (import.meta.env as any).VITE_FALLBACK_API_URL as
    | string
    | undefined;
  if (envFallback) return envFallback;

  // When hosted on platforms without an integrated backend (e.g., vercel.app), use the external Render API
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("vercel.app") || host.includes("netlify.app")) {
      return "https://xc3-1.onrender.com/api";
    }
  }

  return null;
}

// Debug logging for API configuration
if (import.meta.env.DEV) {
  console.log("API Configuration:", {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    API_BASE: RUNTIME_API_BASE,
    NODE_ENV: import.meta.env.NODE_ENV,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  });
}

export interface Project {
  id: number;
  name: string;
  description: string;
  location: string;
  methodology: string;
  vintage_year: number;
  estimated_tco2e: number;
  owner_address: string;
  status: "draft" | "submitted" | "verified" | "rejected" | "minted";
  blockchain_id?: number;
  metadata_uri?: string;
  created_at: string;
  updated_at: string;
  verifications?: Verification[];
  documents?: Document[];
}

export interface Verification {
  id: number;
  project_id: number;
  score: number;
  model_used: string;
  explanation: string;
  artifacts_ipfs_hash?: string;
  verifier_signature?: string;
  verification_date: string;
  created_at: string;
}

export interface Document {
  id: number;
  project_id: number;
  file_name: string;
  file_type: string;
  ipfs_hash: string;
  file_size: number;
  uploaded_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const getApiUrl = (endpoint: string) => {
  const base = RUNTIME_API_BASE.endsWith("/")
    ? RUNTIME_API_BASE.slice(0, -1)
    : RUNTIME_API_BASE;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};

// Generic API call function with improved error handling
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  // Construct URL properly - ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const buildUrl = (base: string) =>
    base.endsWith("/")
      ? `${base.slice(0, -1)}${cleanEndpoint}`
      : `${base}${cleanEndpoint}`;

  let fullUrl = buildUrl(RUNTIME_API_BASE);

  try {
    // Validate API configuration
    if (!RUNTIME_API_BASE || RUNTIME_API_BASE === "/api") {
      if (import.meta.env.PROD) {
        console.warn(
          "Production deployment detected but VITE_API_URL not configured. API calls may fail.",
        );
      }
    }

    // Log API calls for debugging (both dev and prod for now to debug deployment issues)
    if (
      import.meta.env.DEV ||
      window.location.hostname.includes("vercel.app")
    ) {
      console.log(`[DEBUG] API Call: ${options.method || "GET"} ${fullUrl}`, {
        body: options.body instanceof FormData ? "[FormData]" : options.body,
        headers: options.headers,
        API_BASE: RUNTIME_API_BASE,
        endpoint: cleanEndpoint,
      });
    }

    // Build headers conditionally - don't set Content-Type for FormData
    const headers: Record<string, string> = {
      ...options.headers,
    };

    // Only set Content-Type to application/json if body is not FormData
    if (options.body && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    let response = await fetch(fullUrl, {
      headers,
      mode: "cors",
      credentials: "same-origin",
      ...options,
    });

    // If /api is not available (e.g., static hosting) and we get 404, try a fallback API once
    if (response.status === 404 && RUNTIME_API_BASE === "/api") {
      const fallback = computeFallbackApiBase();
      if (fallback && fallback !== RUNTIME_API_BASE) {
        console.warn("[DEBUG] Retrying API request with fallback base", {
          from: RUNTIME_API_BASE,
          to: fallback,
        });
        RUNTIME_API_BASE = fallback;
        fullUrl = buildUrl(RUNTIME_API_BASE);
        response = await fetch(fullUrl, {
          headers,
          mode: "cors",
          credentials: "same-origin",
          ...options,
        });
      }
    }

    // Log response details for debugging
    if (
      import.meta.env.DEV ||
      window.location.hostname.includes("vercel.app")
    ) {
      console.log(
        `[DEBUG] API Response: ${response.status} ${response.statusText}`,
        {
          url: fullUrl,
          headers: Object.fromEntries(response.headers.entries()),
        },
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        // If response is not JSON, use the text or default message
        errorMessage = errorText || errorMessage;
      }

      console.error("[DEBUG] API Error", response.status, errorText);
      throw new Error(errorMessage);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return { success: true, data: null as T };
    }

    // Check if response has content before parsing JSON
    const contentLength = response.headers.get("content-length");
    if (contentLength === "0") {
      return { success: true, data: null as T };
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      throw new Error("Invalid JSON response from server");
    }

    // Validate response shape
    if (typeof data !== "object" || data === null) {
      console.warn("API response is not an object:", data);
      return {
        success: false,
        error: "Invalid response format from server",
      };
    }

    // Log successful responses for debugging
    if (
      import.meta.env.DEV ||
      window.location.hostname.includes("vercel.app")
    ) {
      console.log(`[DEBUG] API result:`, data);
    }

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Enhanced error logging for debugging
    if (
      import.meta.env.DEV ||
      window.location.hostname.includes("vercel.app")
    ) {
      console.error(`[DEBUG] API Error: ${fullUrl}`, {
        error: errorMessage,
        endpoint: cleanEndpoint,
        options,
        apiBase: RUNTIME_API_BASE,
      });
    }

    // Check for common error types
    if (
      errorMessage.includes("NetworkError") ||
      errorMessage.includes("Failed to fetch")
    ) {
      console.warn(
        "Network error detected - check if server is running on the configured API base URL",
      );
    }

    if (errorMessage.includes("CORS")) {
      console.warn("CORS error detected - API configuration issue");
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Project API functions
export const projectApi = {
  // Get all projects
  getAll: async (filters?: {
    status?: string;
    owner?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Project[]>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.owner) params.append("owner", filters.owner);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const query = params.toString();
    return apiCall<Project[]>(`/projects${query ? `?${query}` : ""}`);
  },

  // Get project by ID
  getById: async (id: number): Promise<ApiResponse<Project>> => {
    return apiCall<Project>(`/projects/${id}`);
  },

  // Create new project
  create: async (projectData: {
    name: string;
    description: string;
    location: string;
    methodology: string;
    vintageYear: number;
    estimatedTCO2e: number;
    ownerAddress: string;
  }): Promise<ApiResponse<Project>> => {
    return apiCall<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    });
  },

  // Submit project for verification
  submit: async (
    id: number,
    documents?: {
      fileName: string;
      fileType: string;
      ipfsHash: string;
      fileSize: number;
    }[],
  ): Promise<ApiResponse<Project>> => {
    return apiCall<Project>(`/projects/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ documents }),
    });
  },

  // Start verification
  verify: async (id: number): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/projects/${id}/verify`, {
      method: "POST",
    });
  },

  // Get metrics
  getMetrics: async (): Promise<ApiResponse<any>> => {
    return apiCall<any>("/projects/metrics");
  },
};

// Upload API functions
export const uploadApi = {
  // Upload single file
  uploadFile: async (
    file: File,
    projectId?: number,
  ): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append("file", file);
    if (projectId) formData.append("projectId", projectId.toString());

    return apiCall<any>("/upload/file", {
      method: "POST",
      body: formData,
    });
  },

  // Upload multiple files
  uploadFiles: async (
    files: File[],
    projectId?: number,
  ): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (projectId) formData.append("projectId", projectId.toString());

    return apiCall<any>("/upload/files", {
      method: "POST",
      body: formData,
    });
  },

  // Create project metadata
  createMetadata: async (metadata: {
    name: string;
    description: string;
    location: string;
    methodology: string;
    vintageYear: number;
    estimatedTCO2e: number;
    documents?: string[];
  }): Promise<ApiResponse<any>> => {
    return apiCall<any>("/upload/metadata", {
      method: "POST",
      body: JSON.stringify(metadata),
    });
  },
};

// Market-related interfaces
export interface MarketListing {
  id: number;
  project_id: number;
  seller_address: string;
  token_amount: number;
  price_per_token: number;
  currency: string;
  total_value: number;
  status: "active" | "sold" | "cancelled";
  listed_at: string;
  expires_at?: string;
  sold_at?: string;
  buyer_address?: string;
  project_name: string;
  project_location: string;
  vintage_year: number;
}

export interface MarketTransaction {
  id: number;
  listing_id: number;
  buyer_address: string;
  seller_address: string;
  token_amount: number;
  price_per_token: number;
  total_value: number;
  currency: string;
  transaction_hash: string;
  block_number: number;
  gas_used: number;
  created_at: string;
  project_name: string;
}

export interface LendingPosition {
  id: number;
  user_address: string;
  credit_id: number;
  collateral_amount: number;
  borrowed_amount: number;
  interest_rate: number;
  health_factor: number;
  liquidation_threshold: number;
  position_hash: string;
  status: "active" | "repaid" | "liquidated";
  created_at: string;
  updated_at: string;
  credit_amount?: number;
  project_name?: string;
}

// Market API functions
export const marketApi = {
  // Get market listings
  getListings: async (filters?: {
    status?: string;
    project_id?: number;
    min_price?: number;
    max_price?: number;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<MarketListing[]>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.project_id)
      params.append("project_id", filters.project_id.toString());
    if (filters?.min_price)
      params.append("min_price", filters.min_price.toString());
    if (filters?.max_price)
      params.append("max_price", filters.max_price.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const query = params.toString();
    return apiCall<MarketListing[]>(
      `/market/listings${query ? `?${query}` : ""}`,
    );
  },

  // Create market listing
  createListing: async (data: {
    creditId: number;
    sellerAddress: string;
    amount: number;
    pricePerCredit: number;
    currency?: string;
    expiresAt?: string;
  }): Promise<ApiResponse<MarketListing>> => {
    return apiCall<MarketListing>("/market/listings", {
      method: "POST",
      body: JSON.stringify({
        creditId: data.creditId,
        sellerAddress: data.sellerAddress,
        amount: data.amount,
        pricePerCredit: data.pricePerCredit,
        currency: data.currency,
        expiresAt: data.expiresAt,
      }),
    });
  },

  // Purchase credits
  purchaseCredits: async (
    listingId: number,
    data: {
      buyerAddress: string;
      tokenAmount: number;
    },
  ): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/market/listings/${listingId}/purchase`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Cancel listing
  cancelListing: async (
    listingId: number,
    sellerAddress: string,
  ): Promise<ApiResponse<MarketListing>> => {
    return apiCall<MarketListing>(`/market/listings/${listingId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ sellerAddress }),
    });
  },

  // Get market stats
  getStats: async (): Promise<ApiResponse<any>> => {
    return apiCall<any>("/market/stats");
  },

  // Get user trading history
  getUserHistory: async (address: string): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/market/history/${address}`);
  },
};

// Lending API functions
export const lendingApi = {
  // Get lending positions
  getPositions: async (filters?: {
    userAddress?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<LendingPosition[]>> => {
    const params = new URLSearchParams();
    if (filters?.userAddress) params.append("userAddress", filters.userAddress);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const query = params.toString();
    return apiCall<LendingPosition[]>(
      `/lending/positions${query ? `?${query}` : ""}`,
    );
  },

  // Create lending position
  createPosition: async (data: {
    userAddress: string;
    creditId: number;
    collateralAmount: number;
    borrowedAmount: number;
    interestRate: number;
  }): Promise<ApiResponse<LendingPosition>> => {
    return apiCall<LendingPosition>("/lending/positions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Add collateral to position
  addCollateral: async (
    positionId: number,
    data: {
      userAddress: string;
      amount: number;
    },
  ): Promise<ApiResponse<LendingPosition>> => {
    return apiCall<LendingPosition>(
      `/lending/positions/${positionId}/collateral`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  // Repay loan
  repayLoan: async (
    positionId: number,
    data: {
      userAddress: string;
      amount: number;
    },
  ): Promise<ApiResponse<LendingPosition>> => {
    return apiCall<LendingPosition>(`/lending/positions/${positionId}/repay`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Liquidate position
  liquidatePosition: async (
    positionId: number,
    data: {
      liquidatorAddress: string;
    },
  ): Promise<ApiResponse<LendingPosition>> => {
    return apiCall<LendingPosition>(
      `/lending/positions/${positionId}/liquidate`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  // Get lending stats
  getStats: async (): Promise<ApiResponse<any>> => {
    return apiCall<any>("/lending/stats");
  },

  // Get user positions
  getUserPositions: async (
    address: string,
  ): Promise<ApiResponse<LendingPosition[]>> => {
    return apiCall<LendingPosition[]>(`/lending/positions/${address}`);
  },
};

// AI Verification API
export const verificationApi = {
  // Run AI verification
  verify: async (data: any): Promise<ApiResponse<any>> => {
    return apiCall<any>("/verify", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// Blockchain API functions
export const blockchainApi = {
  // Mint credits
  mint: async (data: {
    projectId: number;
    amount: number;
    recipient: string;
  }): Promise<ApiResponse<any>> => {
    return apiCall<any>("/blockchain/mint", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// Protocol metrics
export const metricsApi = {
  // Get protocol metrics
  get: async (): Promise<ApiResponse<any>> => {
    return apiCall<any>("/metrics");
  },
};

// Activity API functions
export const activityApi = {
  // Get user activity
  getUserActivity: async (
    address: string,
    limit = 50,
    offset = 0,
  ): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return apiCall<any[]>(`/activity/${address}?${params}`);
  },

  // Get recent activity
  getRecentActivity: async (limit = 100): Promise<ApiResponse<any[]>> => {
    return apiCall<any[]>(`/activity/recent?limit=${limit}`);
  },

  // Get activity stats
  getActivityStats: async (): Promise<ApiResponse<any>> => {
    return apiCall<any>("/activity/stats");
  },
};

// Credit wallet API functions
export const creditsApi = {
  // Get user credit balances
  getUserBalance: async (address: string): Promise<ApiResponse<any[]>> => {
    return apiCall<any[]>(`/credits/balance/${address}`);
  },

  // Transfer credits to another address
  transferCredits: async (data: {
    tokenId: number;
    fromAddress: string;
    toAddress: string;
    amount: number;
  }): Promise<ApiResponse<any>> => {
    return apiCall<any>("/credits/transfer", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Retire (burn) credits
  retireCredits: async (data: {
    tokenId: number;
    userAddress: string;
    amount: number;
    reason?: string;
  }): Promise<ApiResponse<any>> => {
    return apiCall<any>("/credits/retire", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get user transaction history
  getUserTransactions: async (
    address: string,
    limit = 50,
    offset = 0,
  ): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return apiCall<any[]>(`/credits/transactions/${address}?${params}`);
  },
};

// Error handling utilities
export const errorHandler = {
  // Handle API errors with user-friendly messages
  handleError: (error: any): string => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return "An unexpected error occurred. Please try again.";
  },

  // Check if error is network related
  isNetworkError: (error: any): boolean => {
    return error?.code === "NETWORK_ERROR" || error?.message?.includes("fetch");
  },

  // Check if error is authentication related
  isAuthError: (error: any): boolean => {
    return error?.status === 401 || error?.status === 403;
  },
};

// Loading state management
export const loadingStates = {
  // Create loading state manager
  createManager: () => {
    const states = new Map<string, boolean>();

    return {
      setLoading: (key: string, loading: boolean) => {
        states.set(key, loading);
      },
      isLoading: (key: string): boolean => {
        return states.get(key) || false;
      },
      getAll: (): Record<string, boolean> => {
        return Object.fromEntries(states);
      },
    };
  },
};

// Utility functions
export const utils = {
  // Format IPFS URL
  formatIpfsUrl: (hash: string): string => {
    return `https://ipfs.io/ipfs/${hash}`;
  },

  // Format address
  formatAddress: (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  // Format date
  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  },

  // Format number
  formatNumber: (num: number): string => {
    return new Intl.NumberFormat().format(num);
  },
};
