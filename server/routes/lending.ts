import { RequestHandler } from "express";
import {
  lendingPositionQueries,
  carbonCreditQueries,
  activityQueries,
} from "../lib/database";

// Server-Sent Events: stream lending positions (poll DB every 5s)
export const streamLendingPositions: RequestHandler = async (req, res) => {
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    (res as any).flushHeaders?.();

    const { userAddress, status, limit = 50, offset = 0 } = req.query;

    const send = async () => {
      try {
        const options = {
          userAddress: (userAddress as string) || undefined,
          status: (status as string) || undefined,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        };
        const positions = await lendingPositionQueries.getAll(options);
        res.write(`data: ${JSON.stringify(positions)}\n\n`);
      } catch (e) {
        console.warn("[SSE] lending stream error:", e instanceof Error ? e.message : e);
      }
    };

    await send();
    const interval = setInterval(send, 5000);

    req.on("close", () => {
      clearInterval(interval);
    });
  } catch (error) {
    console.error("Error setting up lending SSE:", error);
    res.status(500).end();
  }
};

// Get all lending positions
export const getLendingPositions: RequestHandler = async (req, res) => {
  try {
    const { userAddress, status, limit = 20, offset = 0 } = req.query;

    const options = {
      userAddress: userAddress as string,
      status: status as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    };

    const positions = await lendingPositionQueries.getAll(options);

    res.json({
      success: true,
      data: positions,
      total: positions.length,
    });
  } catch (error) {
    console.error("Error fetching lending positions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch lending positions",
      message: error instanceof Error ? error.message : "Database error",
    });
  }
};

// Create new lending position
export const createPosition: RequestHandler = async (req, res) => {
  try {
    const {
      userAddress,
      creditId,
      collateralAmount,
      borrowedAmount,
      interestRate = 0.08,
      liquidationThreshold = 0.75,
      positionHash,
    } = req.body;

    if (!userAddress || !creditId || !collateralAmount || !borrowedAmount) {
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

    // Ensure user owns enough on-chain balance for collateral
    try {
      const { readErc1155Balance } = await import("../lib/web3");
      const bal = await readErc1155Balance(
        Number(credit.chain_id),
        credit.contract_address as any,
        (userAddress as string) as any,
        BigInt(credit.token_id),
      );
      if (!bal || Number(bal) < Number(collateralAmount)) {
        return res.status(400).json({
          success: false,
          error: "Insufficient on-chain balance for collateral",
        });
      }
    } catch (e) {
      console.warn("On-chain balance check failed:", (e as Error).message);
    }

    // Calculate health factor
    const healthFactor =
      (collateralAmount * liquidationThreshold) / borrowedAmount;

    if (healthFactor < 1.0) {
      return res.status(400).json({
        success: false,
        error: "Insufficient collateral for requested loan amount",
      });
    }

    const newPosition = await lendingPositionQueries.create({
      user_address: userAddress.toLowerCase(),
      credit_id: creditId,
      collateral_amount: collateralAmount,
      borrowed_amount: borrowedAmount,
      interest_rate: interestRate,
      health_factor: healthFactor,
      liquidation_threshold: liquidationThreshold,
      position_hash:
        positionHash ||
        `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "active",
    });

    // Log activity
    await activityQueries.log({
      user_address: userAddress.toLowerCase(),
      action_type: "lending_position_created",
      credit_id: creditId,
      details: {
        collateral_amount: collateralAmount,
        borrowed_amount: borrowedAmount,
        interest_rate: interestRate,
        health_factor: healthFactor,
        position_hash: newPosition.position_hash,
      },
    });

    res.status(201).json({
      success: true,
      data: newPosition,
      message: "Lending position created successfully",
    });
  } catch (error) {
    console.error("Error creating lending position:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create lending position",
      message: error instanceof Error ? error.message : "Database error",
    });
  }
};

// Add collateral to existing position
export const addCollateral: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { additionalCollateral, amount, transactionHash } = req.body;
    const positionId = parseInt(id);
    const addAmount = typeof additionalCollateral === "number" ? additionalCollateral : amount;

    if (!addAmount || addAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Additional collateral amount must be positive",
      });
    }

    // Get the position
    const position = await lendingPositionQueries.getById(positionId);
    if (!position) {
      return res.status(404).json({
        success: false,
        error: "Lending position not found",
      });
    }

    if (position.status !== "active") {
      return res.status(400).json({
        success: false,
        error: "Can only add collateral to active positions",
      });
    }

    // Calculate new values
    const newCollateralAmount =
      parseFloat(position.collateral_amount.toString()) + addAmount;
    const newHealthFactor =
      (newCollateralAmount * position.liquidation_threshold) /
      parseFloat(position.borrowed_amount.toString());

    // Update the position
    const updatedPosition = await lendingPositionQueries.update(positionId, {
      collateral_amount: newCollateralAmount,
      health_factor: newHealthFactor,
    });

    // Log activity
    await activityQueries.log({
      user_address: position.user_address,
      action_type: "collateral_added",
      credit_id: position.credit_id,
      details: {
        position_id: positionId,
        additional_collateral: addAmount,
        new_collateral_amount: newCollateralAmount,
        new_health_factor: newHealthFactor,
        transaction_hash: transactionHash,
      },
    });

    res.json({
      success: true,
      data: updatedPosition,
      message: "Collateral added successfully",
    });
  } catch (error) {
    console.error("Error adding collateral:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add collateral",
      message: error instanceof Error ? error.message : "Database error",
    });
  }
};

// Repay loan
export const repayLoan: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { repaymentAmount, amount, transactionHash } = req.body;
    const positionId = parseInt(id);
    const repay = typeof repaymentAmount === "number" ? repaymentAmount : amount;

    if (!repay || repay <= 0) {
      return res.status(400).json({
        success: false,
        error: "Repayment amount must be positive",
      });
    }

    // Get the position
    const position = await lendingPositionQueries.getById(positionId);
    if (!position) {
      return res.status(404).json({
        success: false,
        error: "Lending position not found",
      });
    }

    if (position.status !== "active") {
      return res.status(400).json({
        success: false,
        error: "Can only repay active positions",
      });
    }

    const currentBorrowedAmount = parseFloat(
      position.borrowed_amount.toString(),
    );

    if (repay > currentBorrowedAmount) {
      return res.status(400).json({
        success: false,
        error: "Repayment amount exceeds borrowed amount",
      });
    }

    const newBorrowedAmount = currentBorrowedAmount - repay;
    const isFullRepayment = newBorrowedAmount <= 0.01; // Consider full repayment if very small amount remains

    // Calculate new health factor
    const newHealthFactor =
      newBorrowedAmount > 0
        ? (parseFloat(position.collateral_amount.toString()) *
            position.liquidation_threshold) /
          newBorrowedAmount
        : Infinity;

    // Update the position
    const updateData: any = {
      borrowed_amount: Math.max(0, newBorrowedAmount),
      health_factor: isFullRepayment ? Infinity : newHealthFactor,
    };

    if (isFullRepayment) {
      updateData.status = "closed";
    }

    const updatedPosition = await lendingPositionQueries.update(
      positionId,
      updateData,
    );

    // Log activity
    await activityQueries.log({
      user_address: position.user_address,
      action_type: isFullRepayment
        ? "loan_fully_repaid"
        : "loan_partially_repaid",
      credit_id: position.credit_id,
      details: {
        position_id: positionId,
        repayment_amount: repay,
        remaining_borrowed: newBorrowedAmount,
        new_health_factor: newHealthFactor,
        transaction_hash: transactionHash,
        fully_repaid: isFullRepayment,
      },
    });

    res.json({
      success: true,
      data: updatedPosition,
      message: isFullRepayment ? "Loan fully repaid" : "Loan partially repaid",
    });
  } catch (error) {
    console.error("Error repaying loan:", error);
    res.status(500).json({
      success: false,
      error: "Failed to repay loan",
      message: error instanceof Error ? error.message : "Database error",
    });
  }
};

// Liquidate position
export const liquidatePosition: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { liquidatorAddress, transactionHash } = req.body;
    const positionId = parseInt(id);

    if (!liquidatorAddress) {
      return res.status(400).json({
        success: false,
        error: "Liquidator address required",
      });
    }

    // Get the position
    const position = await lendingPositionQueries.getById(positionId);
    if (!position) {
      return res.status(404).json({
        success: false,
        error: "Lending position not found",
      });
    }

    if (position.status !== "active") {
      return res.status(400).json({
        success: false,
        error: "Can only liquidate active positions",
      });
    }

    // Check if position is eligible for liquidation
    if (position.health_factor >= 1.0) {
      return res.status(400).json({
        success: false,
        error:
          "Position is not eligible for liquidation (health factor >= 1.0)",
      });
    }

    // Update the position to liquidated
    const updatedPosition = await lendingPositionQueries.update(positionId, {
      status: "liquidated",
      health_factor: 0,
    });

    // Log activity
    await activityQueries.log({
      user_address: position.user_address,
      action_type: "position_liquidated",
      credit_id: position.credit_id,
      details: {
        position_id: positionId,
        liquidator_address: liquidatorAddress.toLowerCase(),
        collateral_amount: position.collateral_amount,
        borrowed_amount: position.borrowed_amount,
        health_factor_at_liquidation: position.health_factor,
        transaction_hash: transactionHash,
      },
    });

    res.json({
      success: true,
      data: updatedPosition,
      message: "Position liquidated successfully",
    });
  } catch (error) {
    console.error("Error liquidating position:", error);
    res.status(500).json({
      success: false,
      error: "Failed to liquidate position",
      message: error instanceof Error ? error.message : "Database error",
    });
  }
};

// Get lending statistics
export const getLendingStats: RequestHandler = async (req, res) => {
  try {
    const stats = await lendingPositionQueries.getStats();

    const totalValueLocked = stats.activePositions.reduce(
      (sum: number, pos: any) =>
        sum + parseFloat(pos.collateral_amount.toString()),
      0,
    );
    const totalBorrowed = stats.activePositions.reduce(
      (sum: number, pos: any) =>
        sum + parseFloat(pos.borrowed_amount.toString()),
      0,
    );
    const averageHealthFactor =
      stats.activePositions.length > 0
        ? stats.activePositions.reduce(
            (sum: number, pos: any) =>
              sum + parseFloat(pos.health_factor.toString()),
            0,
          ) / stats.activePositions.length
        : 0;

    const responseStats = {
      totalPositions: stats.totalPositions,
      activePositions: stats.activePositions.length,
      liquidatedPositions: stats.liquidatedPositions,
      totalValueLocked,
      totalBorrowed,
      averageHealthFactor: parseFloat(averageHealthFactor.toFixed(3)),
      recentPositions: stats.recentPositions,
    };

    res.json({
      success: true,
      data: responseStats,
    });
  } catch (error) {
    console.error("Error fetching lending stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch lending stats",
      message: error instanceof Error ? error.message : "Database error",
    });
  }
};

// Get user lending positions
export const getUserPositions: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Address parameter required",
      });
    }

    const options = {
      status: status as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    };

    const positions = await lendingPositionQueries.getUserPositions(
      address.toLowerCase(),
      options,
    );

    // Transform data for consistent response format
    const transformedPositions = positions.map((pos: any) => ({
      id: pos.id,
      project_name: pos.project_name,
      collateral_amount: parseFloat(pos.collateral_amount.toString()),
      borrowed_amount: parseFloat(pos.borrowed_amount.toString()),
      interest_rate: parseFloat(pos.interest_rate.toString()),
      health_factor: parseFloat(pos.health_factor.toString()),
      liquidation_threshold: parseFloat(pos.liquidation_threshold.toString()),
      status: pos.status,
      position_hash: pos.position_hash,
      created_at: pos.created_at,
      updated_at: pos.updated_at,
    }));

    res.json({
      success: true,
      data: transformedPositions,
      total: transformedPositions.length,
    });
  } catch (error) {
    console.error("Error fetching user positions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user positions",
      message: error instanceof Error ? error.message : "Database error",
    });
  }
};
