import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "local-data.json");

// Default data structure
const defaultData = {
  projects: [],
  marketListings: [
    {
      id: 1,
      project_id: 1,
      seller_address: "0x1234567890123456789012345678901234567890",
      token_amount: 5000,
      price_per_token: 25.5,
      currency: "USDC",
      total_value: 127500,
      status: "active",
      listed_at: "2024-02-15T10:30:00Z",
      expires_at: "2024-03-15T10:30:00Z",
      project_name: "Amazon Rainforest Conservation",
      project_location: "Acre, Brazil",
      vintage_year: 2024,
    },
    {
      id: 2,
      project_id: 2,
      seller_address: "0x2345678901234567890123456789012345678901",
      token_amount: 10000,
      price_per_token: 22.75,
      currency: "USDC",
      total_value: 227500,
      status: "active",
      listed_at: "2024-02-14T14:20:00Z",
      expires_at: "2024-03-14T14:20:00Z",
      project_name: "Solar Farm Initiative Kenya",
      project_location: "Turkana County, Kenya",
      vintage_year: 2024,
    },
  ],
  marketTransactions: [],
  lendingPositions: [
    {
      id: 1,
      borrower_address: "0x1234567890123456789012345678901234567890",
      collateral_token_ids: [1, 2, 3],
      collateral_amount: 10000,
      loan_amount: 180000,
      interest_rate: 8.5,
      loan_duration_days: 365,
      status: "active",
      created_at: "2024-01-15T10:30:00Z",
      due_date: "2025-01-15T10:30:00Z",
      repaid_amount: 45000,
      liquidation_threshold: 0.75,
      health_factor: 1.45,
      project_names: [
        "Amazon Rainforest Conservation",
        "Solar Farm Initiative Kenya",
      ],
    },
  ],
  creditBalances: [
    {
      userAddress: "0x1234567890123456789012345678901234567890",
      tokenId: 1,
      amount: 150,
      projectName: "Amazon Reforestation Initiative",
      vintage: 2023,
      methodology: "REDD+",
      chainId: 7001,
      chainName: "ZetaChain Testnet",
    },
    {
      userAddress: "0x1234567890123456789012345678901234567890",
      tokenId: 2,
      amount: 75,
      projectName: "Solar Farm Carbon Offset",
      vintage: 2023,
      methodology: "CDM",
      chainId: 11155111,
      chainName: "Sepolia",
    },
  ],
  creditTransactions: [],
  activityLog: [],
};

// Load data from file or create default
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, "utf8");
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.warn(
      "Could not load local data file, using defaults:",
      error.message,
    );
  }
  return { ...defaultData };
}

// Save data to file
function saveData(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Failed to save local data:", error.message);
    return false;
  }
}

// Create local data manager
export class LocalDataManager {
  private data: any;

  constructor() {
    this.data = loadData();
  }

  // Market listings
  getMarketListings(filters?: any) {
    let listings = [...this.data.marketListings];

    if (filters?.status) {
      listings = listings.filter((l) => l.status === filters.status);
    }
    if (filters?.project_id) {
      listings = listings.filter((l) => l.project_id === filters.project_id);
    }
    if (filters?.min_price) {
      listings = listings.filter((l) => l.price_per_token >= filters.min_price);
    }
    if (filters?.max_price) {
      listings = listings.filter((l) => l.price_per_token <= filters.max_price);
    }

    // Apply pagination
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    return listings.slice(offset, offset + limit);
  }

  addMarketListing(listing: any) {
    const newListing = {
      id: Math.max(0, ...this.data.marketListings.map((l: any) => l.id)) + 1,
      ...listing,
      listed_at: new Date().toISOString(),
    };
    this.data.marketListings.push(newListing);
    saveData(this.data);
    return newListing;
  }

  updateMarketListing(id: number, updates: any) {
    const index = this.data.marketListings.findIndex((l: any) => l.id === id);
    if (index !== -1) {
      this.data.marketListings[index] = {
        ...this.data.marketListings[index],
        ...updates,
      };
      saveData(this.data);
      return this.data.marketListings[index];
    }
    return null;
  }

  // Lending positions
  getLendingPositions(filters?: any) {
    let positions = [...this.data.lendingPositions];

    if (filters?.status) {
      positions = positions.filter((p) => p.status === filters.status);
    }
    if (filters?.userAddress) {
      positions = positions.filter(
        (p) =>
          p.borrower_address.toLowerCase() ===
          filters.userAddress.toLowerCase(),
      );
    }

    // Apply pagination
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    return positions.slice(offset, offset + limit);
  }

  addLendingPosition(position: any) {
    const newPosition = {
      id: Math.max(0, ...this.data.lendingPositions.map((p: any) => p.id)) + 1,
      ...position,
      created_at: new Date().toISOString(),
    };
    this.data.lendingPositions.push(newPosition);
    saveData(this.data);
    return newPosition;
  }

  updateLendingPosition(id: number, updates: any) {
    const index = this.data.lendingPositions.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      this.data.lendingPositions[index] = {
        ...this.data.lendingPositions[index],
        ...updates,
      };
      saveData(this.data);
      return this.data.lendingPositions[index];
    }
    return null;
  }

  // Credit balances
  getUserBalances(address: string) {
    return this.data.creditBalances.filter(
      (balance: any) =>
        balance.userAddress.toLowerCase() === address.toLowerCase(),
    );
  }

  updateUserBalance(address: string, tokenId: number, newAmount: number) {
    const index = this.data.creditBalances.findIndex(
      (balance: any) =>
        balance.userAddress.toLowerCase() === address.toLowerCase() &&
        balance.tokenId === tokenId,
    );

    if (index !== -1) {
      this.data.creditBalances[index].amount = newAmount;
    } else {
      // Create new balance entry
      this.data.creditBalances.push({
        userAddress: address,
        tokenId,
        amount: newAmount,
        projectName: "New Project",
        vintage: 2024,
        methodology: "CDM",
        chainId: 11155111,
        chainName: "Sepolia",
      });
    }
    saveData(this.data);
  }

  addCreditTransaction(transaction: any) {
    const newTransaction = {
      id: Date.now(),
      ...transaction,
      timestamp: new Date().toISOString(),
    };
    this.data.creditTransactions.push(newTransaction);
    saveData(this.data);
    return newTransaction;
  }

  getUserTransactions(address: string, limit = 50, offset = 0) {
    const userTransactions = this.data.creditTransactions.filter(
      (tx: any) =>
        tx.fromAddress?.toLowerCase() === address.toLowerCase() ||
        tx.toAddress?.toLowerCase() === address.toLowerCase() ||
        tx.userAddress?.toLowerCase() === address.toLowerCase(),
    );
    return userTransactions.slice(offset, offset + limit);
  }

  // Activity log
  addActivity(activity: any) {
    const newActivity = {
      id: Date.now(),
      ...activity,
      created_at: new Date().toISOString(),
    };
    this.data.activityLog.push(newActivity);
    saveData(this.data);
    return newActivity;
  }

  getUserActivity(address: string, limit = 50, offset = 0) {
    const userActivities = this.data.activityLog.filter(
      (activity: any) =>
        activity.user_address?.toLowerCase() === address.toLowerCase(),
    );
    return userActivities.slice(offset, offset + limit);
  }

  getRecentActivity(limit = 100) {
    return this.data.activityLog
      .sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, limit);
  }

  // Projects
  getProjects(filters?: any) {
    let projects = [...this.data.projects];

    if (filters?.status) {
      projects = projects.filter((p) => p.status === filters.status);
    }
    if (filters?.owner) {
      projects = projects.filter(
        (p) => p.owner_address.toLowerCase() === filters.owner.toLowerCase(),
      );
    }

    // Apply pagination
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    return projects.slice(offset, offset + limit);
  }

  addProject(project: any) {
    const newProject = {
      id: Math.max(0, ...this.data.projects.map((p: any) => p.id)) + 1,
      ...project,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.projects.push(newProject);
    saveData(this.data);
    return newProject;
  }

  updateProject(id: number, updates: any) {
    const index = this.data.projects.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      this.data.projects[index] = {
        ...this.data.projects[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      saveData(this.data);
      return this.data.projects[index];
    }
    return null;
  }

  getProjectById(id: number) {
    return this.data.projects.find((p: any) => p.id === id);
  }

  // Generic getter for raw data (for compatibility)
  getRawData() {
    return this.data;
  }
}

// Export singleton instance
export const localData = new LocalDataManager();
