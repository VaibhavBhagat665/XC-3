-- XC3 Database Schema for Carbon Credits Platform

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    methodology VARCHAR(100) NOT NULL,
    vintage_year INTEGER NOT NULL,
    estimated_tco2e NUMERIC(15, 2) NOT NULL,
    owner_address VARCHAR(42) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'verified', 'rejected', 'minted')),
    blockchain_id INTEGER,
    metadata_uri TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verifications table
CREATE TABLE IF NOT EXISTS verifications (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    score NUMERIC(3, 2) CHECK (score >= 0 AND score <= 1),
    model_used VARCHAR(100),
    explanation TEXT,
    artifacts_ipfs_hash TEXT,
    verifier_signature TEXT,
    verification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project documents table
CREATE TABLE IF NOT EXISTS project_documents (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    ipfs_hash TEXT NOT NULL,
    file_size BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carbon credits table (tracks minted credits)
CREATE TABLE IF NOT EXISTS carbon_credits (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    token_id INTEGER NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    chain_id INTEGER NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    owner_address VARCHAR(42) NOT NULL,
    minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    retired_amount NUMERIC(15, 2) DEFAULT 0,
    UNIQUE(token_id, chain_id, contract_address)
);

-- Marketplace listings table
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id SERIAL PRIMARY KEY,
    credit_id INTEGER REFERENCES carbon_credits(id) ON DELETE CASCADE,
    seller_address VARCHAR(42) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    price_per_credit NUMERIC(15, 6) NOT NULL,
    currency VARCHAR(20) DEFAULT 'ETH',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Lending positions table
CREATE TABLE IF NOT EXISTS lending_positions (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    collateral_credit_id INTEGER REFERENCES carbon_credits(id),
    collateral_amount NUMERIC(15, 2) NOT NULL,
    borrowed_amount NUMERIC(15, 6) NOT NULL,
    borrowed_currency VARCHAR(20) DEFAULT 'xc3USD',
    interest_rate NUMERIC(5, 4) NOT NULL,
    health_factor NUMERIC(5, 4),
    liquidation_threshold NUMERIC(5, 4) DEFAULT 0.8,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'repaid', 'liquidated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(42),
    action_type VARCHAR(100) NOT NULL,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    credit_id INTEGER REFERENCES carbon_credits(id) ON DELETE SET NULL,
    transaction_hash VARCHAR(66),
    chain_id INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI verification queue table
CREATE TABLE IF NOT EXISTS verification_queue (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    priority INTEGER DEFAULT 1,
    scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_address);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_credits_owner ON carbon_credits(owner_address);
CREATE INDEX IF NOT EXISTS idx_credits_chain ON carbon_credits(chain_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_address);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_verification_queue_status ON verification_queue(status);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lending_positions_updated_at BEFORE UPDATE ON lending_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
