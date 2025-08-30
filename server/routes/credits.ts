import { RequestHandler } from "express";
import { carbonCreditQueries, activityQueries } from "../lib/database";
import { localData } from "../lib/localData";

// Get user credit balances
export const getUserBalance: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Address is required",
      });
    }

    console.log("[DEBUG] Getting credit balance for:", address);

    // Use local data for user balances
    const balances = localData.getUserBalances(address);
    console.log("[DEBUG] Returning credit balances:", balances.length);

    res.json({
      success: true,
      data: balances,
    });
  } catch (error) {
    console.error("Error fetching user balance:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user balance",
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

// Transfer credits between addresses
export const transferCredits: RequestHandler = async (req, res) => {
  try {
    const { tokenId, fromAddress, toAddress, amount } = req.body;

    if (!tokenId || !fromAddress || !toAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: "tokenId, fromAddress, toAddress, and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    // TODO: Implement blockchain transfer functionality
    // This would require:
    // 1. Checking user's actual token balance on blockchain
    // 2. Executing smart contract transfer
    // 3. Recording transaction in database

    // For now, simulate the transfer
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Log transaction activity
    await activityQueries.log({
      user_address: fromAddress,
      action_type: "credits_transferred",
      details: {
        token_id: parseInt(tokenId),
        amount,
        to_address: toAddress,
        simulated: true,
      },
    });

    // Create mock transaction record for response
    const transaction = {
      id: Date.now(),
      type: "transfer",
      tokenId: parseInt(tokenId),
      fromAddress,
      toAddress,
      amount,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
      gasUsed: 21000 + Math.floor(Math.random() * 30000),
      timestamp: new Date().toISOString(),
      simulated: true,
    };

    res.json({
      success: true,
      data: {
        transaction,
        message: `Successfully transferred ${amount} credits to ${toAddress}`,
      },
    });
  } catch (error) {
    console.error("Error transferring credits:", error);
    res.status(500).json({
      success: false,
      error: "Failed to transfer credits",
      message: error instanceof Error ? error.message : "Database error",
    });
  }
};

// Retire (burn) credits
export const retireCredits: RequestHandler = async (req, res) => {
  try {
    const { tokenId, userAddress, amount, reason } = req.body;

    if (!tokenId || !userAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: "tokenId, userAddress, and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    // TODO: Implement blockchain retire functionality
    // This would require:
    // 1. Checking user's actual token balance on blockchain
    // 2. Executing smart contract burn/retire function
    // 3. Recording retirement in database

    // For now, simulate the retirement
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Log retirement activity
    await activityQueries.log({
      user_address: userAddress,
      action_type: "credits_retired",
      details: {
        token_id: parseInt(tokenId),
        amount,
        reason: reason || "Voluntary retirement",
        simulated: true,
      },
    });

    // Create retirement record
    const retirement = {
      id: Date.now(),
      type: "retire",
      tokenId: parseInt(tokenId),
      userAddress,
      amount,
      reason: reason || "Carbon offset",
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
      gasUsed: 35000 + Math.floor(Math.random() * 30000),
      retiredAt: new Date().toISOString(),
      simulated: true,
    };

    res.json({
      success: true,
      data: {
        retirement,
        message: `Successfully retired ${amount} credits for: ${reason || "Carbon offset"}`,
      },
    });
  } catch (error) {
    console.error("Error retiring credits:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retire credits",
      message: error instanceof Error ? error.message : "Database error",
    });
  }
};

// Get transaction history for a user
export const getUserTransactions: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Address is required",
      });
    }

    console.log("[DEBUG] Getting transactions for:", address);

    let transactions;
    try {
      // Try database first
      const activities = await activityQueries.getByUser(
        address,
        parseInt(limit as string),
        parseInt(offset as string),
      );

      // Filter for transaction-related activities
      transactions = activities.filter((activity) =>
        [
          "credits_transferred",
          "credits_retired",
          "credits_purchased",
          "credits_minted",
        ].includes(activity.action_type),
      );
      console.log(
        "[DEBUG] Database transactions fetched:",
        transactions.length,
      );
    } catch (dbError) {
      console.warn(
        "[DEBUG] Database failed, using local data for transactions:",
        dbError.message,
      );
      // Fallback to local data
      transactions = localData.getUserTransactions(
        address,
        parseInt(limit as string),
        parseInt(offset as string),
      );
    }

    console.log("[DEBUG] Returning transactions:", transactions.length);
    res.json({
      success: true,
      data: transactions,
      total: transactions.length,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user transactions",
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};
