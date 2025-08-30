import { Pool } from "pg";

// Database connection
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://localhost:5432/xc3",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export { pool };

// Database query helper
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Project queries
export const projectQueries = {
  create: async (projectData: {
    name: string;
    description: string;
    location: string;
    methodology: string;
    vintage_year: number;
    estimated_tco2e: number;
    owner_address: string;
    metadata_uri?: string;
  }) => {
    const result = await query(
      `INSERT INTO projects
       (name, description, location, methodology, vintage_year, estimated_tco2e, owner_address, metadata_uri)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        projectData.name,
        projectData.description,
        projectData.location,
        projectData.methodology,
        projectData.vintage_year,
        projectData.estimated_tco2e,
        projectData.owner_address,
        projectData.metadata_uri,
      ],
    );
    return result.rows[0];
  },

  getAll: async (filters?: {
    status?: string;
    owner?: string;
    limit?: number;
    offset?: number;
  }) => {
    let queryText = "SELECT * FROM projects WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      queryText += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }

    if (filters?.owner) {
      queryText += ` AND owner_address = $${paramIndex++}`;
      params.push(filters.owner);
    }

    queryText += " ORDER BY created_at DESC";

    if (filters?.limit) {
      queryText += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters?.offset) {
      queryText += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const result = await query(queryText, params);
    return result.rows;
  },

  getById: async (id: number) => {
    const result = await query("SELECT * FROM projects WHERE id = $1", [id]);
    return result.rows[0];
  },

  updateStatus: async (id: number, status: string) => {
    const result = await query(
      "UPDATE projects SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, id],
    );
    return result.rows[0];
  },

  updateBlockchainId: async (id: number, blockchainId: number) => {
    const result = await query(
      "UPDATE projects SET blockchain_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [blockchainId, id],
    );
    return result.rows[0];
  },
};

// Verification queries
export const verificationQueries = {
  create: async (verificationData: {
    project_id: number;
    score: number;
    model_used: string;
    explanation: string;
    artifacts_ipfs_hash?: string;
    verifier_signature?: string;
  }) => {
    const result = await query(
      `INSERT INTO verifications 
       (project_id, score, model_used, explanation, artifacts_ipfs_hash, verifier_signature)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        verificationData.project_id,
        verificationData.score,
        verificationData.model_used,
        verificationData.explanation,
        verificationData.artifacts_ipfs_hash,
        verificationData.verifier_signature,
      ],
    );
    return result.rows[0];
  },

  getByProjectId: async (projectId: number) => {
    const result = await query(
      "SELECT * FROM verifications WHERE project_id = $1 ORDER BY created_at DESC",
      [projectId],
    );
    return result.rows;
  },
};

// Document queries
export const documentQueries = {
  create: async (documentData: {
    project_id: number;
    file_name: string;
    file_type: string;
    ipfs_hash: string;
    file_size: number;
  }) => {
    const result = await query(
      `INSERT INTO project_documents 
       (project_id, file_name, file_type, ipfs_hash, file_size)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        documentData.project_id,
        documentData.file_name,
        documentData.file_type,
        documentData.ipfs_hash,
        documentData.file_size,
      ],
    );
    return result.rows[0];
  },

  getByProjectId: async (projectId: number) => {
    const result = await query(
      "SELECT * FROM project_documents WHERE project_id = $1 ORDER BY uploaded_at DESC",
      [projectId],
    );
    return result.rows;
  },
};

// Activity log queries
export const activityQueries = {
  log: async (activityData: {
    user_address?: string;
    action_type: string;
    project_id?: number;
    credit_id?: number;
    transaction_hash?: string;
    chain_id?: number;
    details?: any;
  }) => {
    const result = await query(
      `INSERT INTO activity_log 
       (user_address, action_type, project_id, credit_id, transaction_hash, chain_id, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        activityData.user_address,
        activityData.action_type,
        activityData.project_id,
        activityData.credit_id,
        activityData.transaction_hash,
        activityData.chain_id,
        activityData.details,
      ],
    );
    return result.rows[0];
  },

  getByUser: async (userAddress: string, limit = 50, offset = 0) => {
    const result = await query(
      `SELECT a.*, p.name as project_name, c.amount as credit_amount 
       FROM activity_log a
       LEFT JOIN projects p ON a.project_id = p.id
       LEFT JOIN carbon_credits c ON a.credit_id = c.id
       WHERE a.user_address = $1
       ORDER BY a.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userAddress, limit, offset],
    );
    return result.rows;
  },

  getRecent: async (limit = 100) => {
    const result = await query(
      `SELECT a.*, p.name as project_name, c.amount as credit_amount 
       FROM activity_log a
       LEFT JOIN projects p ON a.project_id = p.id
       LEFT JOIN carbon_credits c ON a.credit_id = c.id
       ORDER BY a.created_at DESC
       LIMIT $1`,
      [limit],
    );
    return result.rows;
  },
};

// Verification queue queries
export const queueQueries = {
  addToQueue: async (projectId: number, priority = 1) => {
    const result = await query(
      "INSERT INTO verification_queue (project_id, priority) VALUES ($1, $2) RETURNING *",
      [projectId, priority],
    );
    return result.rows[0];
  },

  getNext: async () => {
    const result = await query(
      `SELECT * FROM verification_queue 
       WHERE status = 'pending' 
       ORDER BY priority DESC, scheduled_at ASC 
       LIMIT 1`,
    );
    return result.rows[0];
  },

  updateStatus: async (id: number, status: string, errorMessage?: string) => {
    const result = await query(
      `UPDATE verification_queue 
       SET status = $1, error_message = $2, 
           started_at = CASE WHEN $1 = 'processing' THEN CURRENT_TIMESTAMP ELSE started_at END,
           completed_at = CASE WHEN $1 IN ('completed', 'failed') THEN CURRENT_TIMESTAMP ELSE completed_at END
       WHERE id = $3 RETURNING *`,
      [status, errorMessage, id],
    );
    return result.rows[0];
  },
};

// Market transaction queries
export const marketTransactionQueries = {
  getListings: async (options: {
    status?: string;
    limit: number;
    offset: number;
  }) => {
    const whereClause = options.status ? "WHERE status = $1" : "";
    const values = options.status
      ? [options.status, options.limit, options.offset]
      : [options.limit, options.offset];
    const paramOffset = options.status ? 2 : 0;

    const result = await query(
      `SELECT mt.*, cc.amount as credit_amount, p.name as project_name 
       FROM market_transactions mt
       JOIN carbon_credits cc ON mt.credit_id = cc.id
       JOIN projects p ON cc.project_id = p.id
       ${whereClause}
       ORDER BY mt.created_at DESC
       LIMIT $${paramOffset + 1} OFFSET $${paramOffset + 2}`,
      values,
    );
    return result.rows;
  },

  getById: async (id: number) => {
    const result = await query(
      "SELECT * FROM market_transactions WHERE id = $1",
      [id],
    );
    return result.rows[0];
  },

  create: async (data: any) => {
    const result = await query(
      `INSERT INTO market_transactions 
       (credit_id, seller_address, amount, price_per_credit, total_price, currency, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.credit_id,
        data.seller_address,
        data.amount,
        data.price_per_credit,
        data.total_price,
        data.currency,
        data.status,
      ],
    );
    return result.rows[0];
  },

  update: async (id: number, data: any) => {
    const fields = Object.keys(data)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");
    const values = [id, ...Object.values(data)];

    const result = await query(
      `UPDATE market_transactions SET ${fields} WHERE id = $1 RETURNING *`,
      values,
    );
    return result.rows[0];
  },

  getStats: async () => {
    const totalListings = await query(
      "SELECT COUNT(*) FROM market_transactions",
    );
    const activeListings = await query(
      "SELECT COUNT(*) FROM market_transactions WHERE status = $1",
      ["pending"],
    );
    const completedTransactions = await query(
      "SELECT * FROM market_transactions WHERE status = $1",
      ["completed"],
    );
    const topSellers = await query(`
      SELECT seller_address, COUNT(*) as sales_count, SUM(total_price) as total_volume
      FROM market_transactions WHERE status = 'completed'
      GROUP BY seller_address ORDER BY total_volume DESC LIMIT 10
    `);
    const recentTransactions = await query(`
      SELECT * FROM market_transactions 
      WHERE status = 'completed' 
      ORDER BY completed_at DESC LIMIT 20
    `);

    return {
      totalListings: parseInt(totalListings.rows[0].count),
      activeListings: parseInt(activeListings.rows[0].count),
      completedTransactions: completedTransactions.rows,
      topSellers: topSellers.rows,
      recentTransactions: recentTransactions.rows,
    };
  },

  getUserHistory: async (
    userAddress: string,
    options: { limit: number; offset: number },
  ) => {
    const result = await query(
      `SELECT mt.*, cc.amount as credit_amount, p.name as project_name
       FROM market_transactions mt
       JOIN carbon_credits cc ON mt.credit_id = cc.id
       JOIN projects p ON cc.project_id = p.id
       WHERE mt.seller_address = $1 OR mt.buyer_address = $1
       ORDER BY mt.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userAddress, options.limit, options.offset],
    );
    return result.rows;
  },
};

// Carbon credit queries
export const carbonCreditQueries = {
  getById: async (id: number) => {
    const result = await query("SELECT * FROM carbon_credits WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  },

  create: async (data: any) => {
    const result = await query(
      `INSERT INTO carbon_credits 
       (project_id, token_id, amount, chain_id, contract_address, transaction_hash, block_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.project_id,
        data.token_id,
        data.amount,
        data.chain_id,
        data.contract_address,
        data.transaction_hash,
        data.block_number,
      ],
    );
    return result.rows[0];
  },

  getByProject: async (projectId: number) => {
    const result = await query(
      "SELECT * FROM carbon_credits WHERE project_id = $1",
      [projectId],
    );
    return result.rows;
  },
};

// Lending position queries
export const lendingPositionQueries = {
  getAll: async (options: {
    userAddress?: string;
    status?: string;
    limit: number;
    offset: number;
  }) => {
    let whereClause = "";
    let values = [];
    let paramCount = 0;

    if (options.userAddress) {
      whereClause += ` WHERE user_address = $${++paramCount}`;
      values.push(options.userAddress);
    }

    if (options.status) {
      whereClause += whereClause
        ? ` AND status = $${++paramCount}`
        : ` WHERE status = $${++paramCount}`;
      values.push(options.status);
    }

    values.push(options.limit, options.offset);

    const result = await query(
      `SELECT lp.*, cc.amount as credit_amount, p.name as project_name
       FROM lending_positions lp
       JOIN carbon_credits cc ON lp.credit_id = cc.id
       JOIN projects p ON cc.project_id = p.id
       ${whereClause}
       ORDER BY lp.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      values,
    );
    return result.rows;
  },

  getById: async (id: number) => {
    const result = await query(
      "SELECT * FROM lending_positions WHERE id = $1",
      [id],
    );
    return result.rows[0];
  },

  create: async (data: any) => {
    const result = await query(
      `INSERT INTO lending_positions 
       (user_address, credit_id, collateral_amount, borrowed_amount, interest_rate, health_factor, liquidation_threshold, position_hash, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.user_address,
        data.credit_id,
        data.collateral_amount,
        data.borrowed_amount,
        data.interest_rate,
        data.health_factor,
        data.liquidation_threshold,
        data.position_hash,
        data.status,
      ],
    );
    return result.rows[0];
  },

  update: async (id: number, data: any) => {
    const fields = Object.keys(data)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");
    const values = [id, ...Object.values(data)];

    const result = await query(
      `UPDATE lending_positions SET ${fields} WHERE id = $1 RETURNING *`,
      values,
    );
    return result.rows[0];
  },

  getStats: async () => {
    const totalPositions = await query(
      "SELECT COUNT(*) FROM lending_positions",
    );
    const activePositions = await query(
      "SELECT * FROM lending_positions WHERE status = $1",
      ["active"],
    );
    const liquidatedCount = await query(
      "SELECT COUNT(*) FROM lending_positions WHERE status = $1",
      ["liquidated"],
    );
    const recentPositions = await query(`
      SELECT lp.*, cc.amount as credit_amount, p.name as project_name
      FROM lending_positions lp
      JOIN carbon_credits cc ON lp.credit_id = cc.id
      JOIN projects p ON cc.project_id = p.id
      ORDER BY lp.created_at DESC LIMIT 20
    `);

    return {
      totalPositions: parseInt(totalPositions.rows[0].count),
      activePositions: activePositions.rows,
      liquidatedPositions: parseInt(liquidatedCount.rows[0].count),
      recentPositions: recentPositions.rows,
    };
  },

  getUserPositions: async (
    userAddress: string,
    options: { status?: string; limit: number; offset: number },
  ) => {
    const whereClause = options.status ? "AND status = $2" : "";
    const values = options.status
      ? [userAddress, options.status, options.limit, options.offset]
      : [userAddress, options.limit, options.offset];
    const paramOffset = options.status ? 1 : 0;

    const result = await query(
      `SELECT lp.*, cc.amount as credit_amount, p.name as project_name
       FROM lending_positions lp
       JOIN carbon_credits cc ON lp.credit_id = cc.id
       JOIN projects p ON cc.project_id = p.id
       WHERE lp.user_address = $1 ${whereClause}
       ORDER BY lp.created_at DESC
       LIMIT $${paramOffset + 2} OFFSET $${paramOffset + 3}`,
      values,
    );
    return result.rows;
  },
};

// All query objects are already exported individually above
