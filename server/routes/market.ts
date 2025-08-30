import { RequestHandler } from "express";
import {
  marketTransactionQueries,
  carbonCreditQueries,
  activityQueries,
} from "../lib/database";
import { localData } from "../lib/localData";

// Get all market listings
export const getMarketListings: RequestHandler = async (req, res) => {
  try {
    const { status, minPrice, maxPrice, limit = 20, offset = 0 } = req.query;

    console.log("[DEBUG] Getting market listings with filters:", {
      status,
      minPrice,
      maxPrice,
      limit,
      offset,
    });

    const options = {
      status: status as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      min_price: minPrice ? parseFloat(minPrice as string) : undefined,
      max_price: maxPrice ? parseFloat(maxPrice as string) : undefined,
    };

    let listings;
    try {
      // Try database first
      listings = await marketTransactionQueries.getListings(options);
      console.log("[DEBUG] Database listings fetched:", listings.length);
    } catch (dbError) {
      console.warn(
        "[DEBUG] Database failed, using local data:",
        dbError.message,
      );
      // Fallback to local data
      listings = localData.getMarketListings(options);
      console.log("[DEBUG] Local data listings fetched:", listings.length);
    }

    // Apply price filters if specified (for local data)
    let filteredListings = listings;
    if (minPrice) {
      filteredListings = filteredListings.filter(
        (l: any) =>
          (l.price_per_credit || l.price_per_token) >=
          parseFloat(minPrice as string),
      );
    }
    if (maxPrice) {
      filteredListings = filteredListings.filter(
        (l: any) =>
          (l.price_per_credit || l.price_per_token) <=
          parseFloat(maxPrice as string),
      );
    }

    console.log(
      "[DEBUG] Returning filtered listings:",
      filteredListings.length,
    );
    res.json({
      success: true,
      data: filteredListings,
      total: filteredListings.length,
    });
  } catch (error) {
    console.error("Error fetching market listings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch market listings",
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

// Create new market listing
export const createListing: RequestHandler = async (req, res) => {
  try {
    const {
      creditId,
      sellerAddress,
      amount,
      pricePerCredit,
      currency = "USDC",
      expiresAt,
    } = req.body;

    if (!creditId || !sellerAddress || !amount || !pricePerCredit) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Verify the credit exists
    const credit = await carbonCreditQueries.getById(creditId);
    if (!credit) {
      return res.status(404).json({
        success: false,
        error: "Carbon credit not found",
      });
    }

    const totalPrice = amount * pricePerCredit;

    const newListing = await marketTransactionQueries.create({
      credit_id: creditId,
      seller_address: sellerAddress.toLowerCase(),
      amount,
      price_per_credit: pricePerCredit,
      total_price: totalPrice,
      currency,
      status: "pending",
      expires_at: expiresAt || null,
    });

    // Log activity
    await activityQueries.log({
      user_address: sellerAddress.toLowerCase(),
      action_type: "listing_created",
      credit_id: creditId,
      details: {
        amount,
        price_per_credit: pricePerCredit,
        total_price: totalPrice,
        currency,
      },
    });

    res.status(201).json({
      success: true,
      data: newListing,
    });
  } catch (error) {
    console.error("Error creating listing:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create listing",
      message: error instanceof Error ? error.message : "Database error",
    });
  }
};

// Purchase credits from a listing
export const purchaseCredits: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { buyerAddress, amount, transactionHash } = req.body;
    const listingId = parseInt(id);

    if (!buyerAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Get the listing
    const listing = await marketTransactionQueries.getById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing not found",
      });
    }

    if (listing.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Listing is not available for purchase",
      });
    }

    if (amount > listing.amount) {
      return res.status(400).json({
        success: false,
        error: "Insufficient credits available",
      });
    }

    // Update the listing
    const updatedListing = await marketTransactionQueries.update(listingId, {
      buyer_address: buyerAddress.toLowerCase(),
      status: "completed",
      transaction_hash: transactionHash,
      completed_at: new Date(),
    });

    // Log activity
    await activityQueries.log({
      user_address: buyerAddress.toLowerCase(),
      action_type: "credits_purchased",
      credit_id: listing.credit_id,
      details: {
        listing_id: listingId,
        amount,
        price_per_credit: listing.price_per_credit,
        total_price: amount * listing.price_per_credit,
        seller_address: listing.seller_address,
        transaction_hash: transactionHash,
      },
    });

    res.json({
      success: true,
      data: updatedListing,
      message: "Credits purchased successfully",
    });
  } catch (error) {
    console.error("Error purchasing credits:", error);
    res.status(500).json({
      success: false,
      error: "Failed to purchase credits",
      message: error instanceof Error ? error.message : "Database error",
    });
  }
};

// Cancel a listing
export const cancelListing: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { sellerAddress } = req.body;
    const listingId = parseInt(id);

    if (!sellerAddress) {
      return res.status(400).json({
        success: false,
        error: "Seller address required",
      });
    }

    // Get the listing
    const listing = await marketTransactionQueries.getById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing not found",
      });
    }

    if (listing.seller_address.toLowerCase() !== sellerAddress.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: "Only the seller can cancel this listing",
      });
    }

    if (listing.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Only pending listings can be cancelled",
      });
    }

    // Update the listing to cancelled
    const updatedListing = await marketTransactionQueries.update(listingId, {
      status: "cancelled",
    });

    // Log activity
    await activityQueries.log({
      user_address: sellerAddress.toLowerCase(),
      action_type: "listing_cancelled",
      credit_id: listing.credit_id,
      details: {
        listing_id: listingId,
        amount: listing.amount,
        price_per_credit: listing.price_per_credit,
      },
    });

    res.json({
      success: true,
      data: updatedListing,
      message: "Listing cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling listing:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel listing",
      message: error instanceof Error ? error.message : "Database error",
    });
  }
};

// Get market statistics
export const getMarketStats: RequestHandler = async (req, res) => {
  try {
    console.log("[DEBUG] Getting market stats");

    let stats;
    try {
      // Try database first
      stats = await marketTransactionQueries.getStats();
      console.log("[DEBUG] Database stats fetched");
    } catch (dbError) {
      console.warn(
        "[DEBUG] Database failed, using local data for stats:",
        dbError.message,
      );
      // Fallback to mock stats from local data
      const listings = localData.getMarketListings({});
      const completedTransactions = listings.filter(
        (l: any) => l.status === "completed",
      );
      stats = {
        totalListings: listings.length,
        activeListings: listings.filter((l: any) => l.status === "active")
          .length,
        completedTransactions,
        topSellers: [],
        recentTransactions: completedTransactions.slice(-10),
      };
    }

    const totalVolume = stats.completedTransactions.reduce(
      (sum: number, tx: any) =>
        sum + parseFloat((tx.total_price || tx.total_value || 0).toString()),
      0,
    );
    const averagePrice =
      stats.completedTransactions.length > 0
        ? stats.completedTransactions.reduce(
            (sum: number, tx: any) =>
              sum +
              parseFloat(
                (tx.price_per_credit || tx.price_per_token || 0).toString(),
              ),
            0,
          ) / stats.completedTransactions.length
        : 0;

    const responseStats = {
      totalListings: stats.totalListings,
      activeListings: stats.activeListings,
      completedTransactions: stats.completedTransactions.length,
      totalVolume,
      averagePrice: parseFloat(averagePrice.toFixed(2)),
      topSellers: stats.topSellers || [],
      recentActivity: stats.recentTransactions || [],
    };

    console.log("[DEBUG] Returning stats:", responseStats);
    res.json({
      success: true,
      data: responseStats,
    });
  } catch (error) {
    console.error("Error fetching market stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch market stats",
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

// Get user trading history
export const getUserTradingHistory: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Address parameter required",
      });
    }

    console.log("[DEBUG] Getting trading history for:", address);

    const options = {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    };

    let history;
    try {
      // Try database first
      history = await marketTransactionQueries.getUserHistory(
        address.toLowerCase(),
        options,
      );
      console.log("[DEBUG] Database trading history fetched:", history.length);
    } catch (dbError) {
      console.warn(
        "[DEBUG] Database failed, using empty trading history:",
        dbError.message,
      );
      // Fallback to empty history or mock data
      history = [];
    }

    // Transform data for consistent response format
    const transformedHistory = history.map((tx: any) => ({
      id: tx.id,
      type:
        tx.seller_address.toLowerCase() === address.toLowerCase()
          ? "sale"
          : "purchase",
      project_name: tx.project_name,
      amount: parseFloat((tx.amount || tx.token_amount || 0).toString()),
      price_per_credit: parseFloat(
        (tx.price_per_credit || tx.price_per_token || 0).toString(),
      ),
      total_price: parseFloat(
        (tx.total_price || tx.total_value || 0).toString(),
      ),
      currency: tx.currency,
      transaction_hash: tx.transaction_hash,
      timestamp: tx.created_at || tx.listed_at,
      status: tx.status,
      completed_at: tx.completed_at,
    }));

    console.log(
      "[DEBUG] Returning trading history:",
      transformedHistory.length,
    );
    res.json({
      success: true,
      data: transformedHistory,
      total: transformedHistory.length,
    });
  } catch (error) {
    console.error("Error fetching trading history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch trading history",
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};
