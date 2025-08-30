import { Request, Response } from "express";
import { localData } from "../lib/localData";

export interface ActivityItem {
  id: number;
  action_type: string;
  user_address?: string;
  project_name?: string;
  project_id?: number;
  credit_amount?: number;
  transaction_hash?: string;
  created_at: string;
  details?: any;
}

// Get user-specific activity
export const getUserActivity = async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "User address is required",
      });
    }

    const activities: ActivityItem[] = [];

    // Get user's credit transactions
    const creditTransactions = localData.getUserTransactions(address);
    creditTransactions.forEach((tx) => {
      activities.push({
        id: tx.id,
        action_type: tx.type === "transfer" ? "credits_transferred" :
                     tx.type === "mint" ? "credits_minted" :
                     tx.type === "burn" ? "credits_retired" : "credits_transaction",
        user_address: address,
        project_name: tx.projectName || "Carbon Credit Project",
        credit_amount: tx.amount,
        transaction_hash: tx.transactionHash || "0x" + Math.random().toString(16).substring(2),
        created_at: tx.timestamp || new Date().toISOString(),
        details: {
          from_address: tx.fromAddress,
          to_address: tx.toAddress,
          token_id: tx.tokenId,
        },
      });
    });

    // Get user's market transactions from existing market data
    const allMarketListings = localData.getMarketListings();
    const userMarketActivity = allMarketListings.filter((listing) =>
      listing.seller_address.toLowerCase() === address.toLowerCase()
    );

    userMarketActivity.forEach((listing) => {
      activities.push({
        id: listing.id + 10000, // Offset to avoid ID conflicts
        action_type: "market_listing_created",
        user_address: address,
        project_name: listing.project_name,
        credit_amount: listing.token_amount,
        created_at: listing.listed_at,
        details: {
          price_per_token: listing.price_per_token,
          total_value: listing.total_value,
          currency: listing.currency,
          status: listing.status,
        },
      });
    });

    // Get user's lending positions
    const lendingPositions = localData.getLendingPositions({ userAddress: address });
    lendingPositions.forEach((position) => {
      activities.push({
        id: position.id + 20000, // Offset to avoid ID conflicts
        action_type: "lending_position_created",
        user_address: address,
        project_name: position.project_names?.[0] || "Carbon Credit Project",
        credit_amount: position.collateral_amount,
        created_at: position.created_at,
        details: {
          borrowed_amount: position.loan_amount,
          interest_rate: position.interest_rate,
          health_factor: position.health_factor,
          status: position.status,
        },
      });
    });

    // Get user's projects
    const userProjects = localData.getProjects({ owner: address });
    userProjects.forEach((project) => {
      activities.push({
        id: project.id + 30000, // Offset to avoid ID conflicts
        action_type: project.status === "submitted" ? "project_submitted" :
                     project.status === "verified" ? "verification_completed" :
                     project.status === "minted" ? "credits_minted" : "project_registered",
        user_address: address,
        project_name: project.name,
        project_id: project.id,
        credit_amount: project.estimated_tco2e,
        created_at: project.verifications?.[0]?.verification_date || project.created_at,
        details: {
          location: project.location,
          methodology: project.methodology,
          vintage_year: project.vintage_year,
          status: project.status,
          verification_score: project.verifications?.[0]?.score,
        },
      });
    });

    // Sort by created_at descending
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Apply pagination
    const paginatedActivities = activities.slice(offset, offset + limit);

    res.json({
      success: true,
      data: paginatedActivities,
      meta: {
        total: activities.length,
        limit,
        offset,
        hasMore: offset + limit < activities.length,
      },
    });
  } catch (error) {
    console.error("Error getting user activity:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user activity",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get recent protocol activity across all users
export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;

    const activities: ActivityItem[] = [];

    // Get recent market listings as activity
    const recentMarket = localData.getMarketListings().slice(0, 30);
    recentMarket.forEach((listing) => {
      activities.push({
        id: listing.id + 10000,
        action_type: "market_listing_created",
        user_address: listing.seller_address,
        project_name: listing.project_name,
        credit_amount: listing.token_amount,
        created_at: listing.listed_at,
        details: {
          price_per_token: listing.price_per_token,
          total_value: listing.total_value,
          currency: listing.currency,
          status: listing.status,
        },
      });
    });

    // Get recent project submissions/verifications
    const recentProjects = localData.getProjects().slice(0, 20);
    recentProjects.forEach((project) => {
      if (project.status !== "draft") {
        activities.push({
          id: project.id + 30000,
          action_type: project.status === "submitted" ? "project_submitted" :
                       project.status === "verified" ? "verification_completed" :
                       project.status === "minted" ? "credits_minted" : "project_registered",
          user_address: project.owner_address,
          project_name: project.name,
          project_id: project.id,
          credit_amount: project.estimated_tco2e,
          created_at: project.status === "verified" && project.verifications?.[0] 
            ? project.verifications[0].verification_date 
            : project.created_at,
          details: {
            location: project.location,
            methodology: project.methodology,
            vintage_year: project.vintage_year,
            status: project.status,
            verification_score: project.verifications?.[0]?.score,
          },
        });
      }
    });

    // Get recent lending activity
    const recentLending = localData.getLendingPositions().slice(0, 15);
    recentLending.forEach((position) => {
      activities.push({
        id: position.id + 20000,
        action_type: "lending_position_created",
        user_address: position.user_address,
        project_name: position.project_name,
        credit_amount: position.collateral_amount,
        created_at: position.created_at,
        details: {
          borrowed_amount: position.borrowed_amount,
          interest_rate: position.interest_rate,
          health_factor: position.health_factor,
          status: position.status,
        },
      });
    });

    // Sort by created_at descending and take the most recent
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const recentActivities = activities.slice(0, limit);

    res.json({
      success: true,
      data: recentActivities,
      meta: {
        total: recentActivities.length,
        limit,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting recent activity:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get recent activity",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get activity stats
export const getActivityStats = async (req: Request, res: Response) => {
  try {
    const rawData = localData.getRawData();
    const stats = {
      total_transactions: rawData.creditTransactions?.length || 0,
      total_market_transactions: rawData.marketListings?.length || 0,
      total_lending_positions: rawData.lendingPositions?.length || 0,
      total_projects: rawData.projects?.length || 0,
      active_users: new Set([
        ...(rawData.creditTransactions || []).map((tx: any) => tx.fromAddress).filter(Boolean),
        ...(rawData.creditTransactions || []).map((tx: any) => tx.toAddress).filter(Boolean),
        ...(rawData.projects || []).map((p: any) => p.owner_address).filter(Boolean),
      ]).size,
      last_24h_transactions: (rawData.creditTransactions || []).filter((tx: any) => {
        const txDate = new Date(tx.timestamp || tx.created_at);
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return txDate > yesterday;
      }).length,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting activity stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get activity stats",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
