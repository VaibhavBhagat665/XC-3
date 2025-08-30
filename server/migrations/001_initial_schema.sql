-- XC3 Carbon Credit Platform Database Schema
-- Complete initialization script with sample data

-- Enable UUID extension for better ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table - Core carbon credit projects
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    methodology VARCHAR(100) NOT NULL,
    vintage_year INTEGER NOT NULL,
    estimated_tco2e DECIMAL(15, 2) NOT NULL,
    owner_address VARCHAR(42) NOT NULL,
    metadata_uri TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    blockchain_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project documents storage
CREATE TABLE IF NOT EXISTS project_documents (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    ipfs_hash VARCHAR(255) NOT NULL UNIQUE,
    file_size BIGINT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification records
CREATE TABLE IF NOT EXISTS verifications (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    score DECIMAL(5, 4) NOT NULL CHECK (score >= 0 AND score <= 1),
    model_used VARCHAR(100) NOT NULL,
    explanation TEXT,
    artifacts_ipfs_hash VARCHAR(255),
    verifier_signature VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carbon credits minted from projects
CREATE TABLE IF NOT EXISTS carbon_credits (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    token_id BIGINT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    chain_id INTEGER NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    block_number BIGINT,
    minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market transactions for trading
CREATE TABLE IF NOT EXISTS market_transactions (
    id SERIAL PRIMARY KEY,
    credit_id INTEGER REFERENCES carbon_credits(id),
    seller_address VARCHAR(42) NOT NULL,
    buyer_address VARCHAR(42),
    amount DECIMAL(15, 2) NOT NULL,
    price_per_credit DECIMAL(15, 2) NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    status VARCHAR(50) DEFAULT 'pending',
    transaction_hash VARCHAR(66),
    listed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- Lending positions for DeFi functionality
CREATE TABLE IF NOT EXISTS lending_positions (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    credit_id INTEGER REFERENCES carbon_credits(id),
    collateral_amount DECIMAL(15, 2) NOT NULL,
    borrowed_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 4) NOT NULL,
    health_factor DECIMAL(5, 4) NOT NULL,
    liquidation_threshold DECIMAL(5, 4) NOT NULL,
    position_hash VARCHAR(66),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity log for all platform actions
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

-- Verification queue for AI processing
CREATE TABLE IF NOT EXISTS verification_queue (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending',
    scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_address);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_vintage ON projects(vintage_year);
CREATE INDEX IF NOT EXISTS idx_documents_project ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_ipfs ON project_documents(ipfs_hash);
CREATE INDEX IF NOT EXISTS idx_verifications_project ON verifications(project_id);
CREATE INDEX IF NOT EXISTS idx_credits_project ON carbon_credits(project_id);
CREATE INDEX IF NOT EXISTS idx_credits_chain ON carbon_credits(chain_id);
CREATE INDEX IF NOT EXISTS idx_market_seller ON market_transactions(seller_address);
CREATE INDEX IF NOT EXISTS idx_market_buyer ON market_transactions(buyer_address);
CREATE INDEX IF NOT EXISTS idx_market_status ON market_transactions(status);
CREATE INDEX IF NOT EXISTS idx_lending_user ON lending_positions(user_address);
CREATE INDEX IF NOT EXISTS idx_lending_status ON lending_positions(status);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_address);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at);

-- Update triggers
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

-- Sample data insertion
INSERT INTO projects (name, description, location, methodology, vintage_year, estimated_tco2e, owner_address, status) VALUES
('Amazon Rainforest Conservation', 'Large-scale rainforest preservation project preventing deforestation and protecting biodiversity in the Amazon Basin. This project covers 50,000 hectares of primary rainforest.', 'Acre, Brazil', 'REDD+', 2024, 500000.00, '0x1234567890123456789012345678901234567890', 'verified'),
('Solar Farm Initiative Kenya', 'Utility-scale solar photovoltaic installation replacing grid electricity from fossil fuel sources in Kenya. 100MW capacity with 25-year operational period.', 'Turkana County, Kenya', 'CDM', 2024, 250000.00, '0x2345678901234567890123456789012345678901', 'verified'),
('Mangrove Restoration Project', 'Coastal mangrove ecosystem restoration and protection project supporting biodiversity and coastal protection while sequestering carbon.', 'Sundarbans, Bangladesh', 'VCS', 2023, 180000.00, '0x3456789012345678901234567890123456789012', 'verified'),
('Wind Energy Development', 'Onshore wind farm development project providing clean energy to the national grid and displacing thermal power generation.', 'Tamil Nadu, India', 'Gold Standard', 2024, 320000.00, '0x4567890123456789012345678901234567890123', 'submitted'),
('Biogas from Agricultural Waste', 'Methane capture and utilization project converting agricultural waste into clean energy while reducing methane emissions.', 'Punjab, India', 'CAR', 2023, 95000.00, '0x5678901234567890123456789012345678901234', 'draft'),
('Reforestation Program Colombia', 'Native tree species reforestation program on degraded agricultural land, supporting local communities and biodiversity.', 'Cauca, Colombia', 'REDD+', 2024, 420000.00, '0x6789012345678901234567890123456789012345', 'submitted');

-- Sample verifications
INSERT INTO verifications (project_id, score, model_used, explanation, artifacts_ipfs_hash, verifier_signature) VALUES
(1, 0.92, 'Gemini 1.5 Pro + XC3 Local AI', 'Comprehensive documentation provided. Strong evidence of additionality and permanence. Methodology correctly applied with robust monitoring protocols.', 'analysis_gemini_1234567890', 'gemini_verified_1234567890'),
(2, 0.89, 'Gemini 1.5 Pro + XC3 Local AI', 'Excellent technical documentation and environmental impact assessment. Clear baseline methodology and monitoring plan established.', 'analysis_gemini_2345678901', 'gemini_verified_2345678901'),
(3, 0.87, 'Gemini 1.5 Pro + XC3 Local AI', 'Well-documented ecosystem restoration project with clear additionality case. Strong community engagement and monitoring framework.', 'analysis_gemini_3456789012', 'gemini_verified_3456789012');

-- Sample documents
INSERT INTO project_documents (project_id, file_name, file_type, ipfs_hash, file_size) VALUES
(1, 'amazon_project_design_document.pdf', 'application/pdf', 'QmYjtigKw2VCqgLiGfvZKm3GtLxJ8zOhKjE4W9PLH6MzJQ', 2450000),
(1, 'baseline_study_amazon.pdf', 'application/pdf', 'QmPZ6gw8CCzfLBRaSkNK9W2CvXQmkYqLHEQyT2uPsGfJK4', 1870000),
(2, 'solar_kenya_technical_specs.pdf', 'application/pdf', 'QmNR5SqHwVQxGSvKoLKGkT4WjLqEfYmXyUzPqGkNwHhY2M', 3200000),
(2, 'environmental_impact_assessment.pdf', 'application/pdf', 'QmKJ8Hp3mRwVfQkLsWe6YtNg7XxRyHf9PLKmNQwT6uZfR3', 1560000),
(3, 'mangrove_monitoring_plan.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'QmVwT6eGhLNx2mPqKvLsHf4RyQqZkJp8NgHtTyUwKmR3Lw', 980000);

-- Sample carbon credits
INSERT INTO carbon_credits (project_id, token_id, amount, chain_id, contract_address, transaction_hash, block_number) VALUES
(1, 1001, 100000.00, 7001, '0xA1B2C3D4E5F6789012345678901234567890ABCD', '0x1a2b3c4d5e6f789012345678901234567890abcdef123456789012345678901234', 1234567),
(2, 1002, 75000.00, 11155111, '0xB2C3D4E5F6789012345678901234567890ABCDEF', '0x2b3c4d5e6f789012345678901234567890abcdef123456789012345678901234a', 2345678),
(3, 1003, 60000.00, 80002, '0xC3D4E5F6789012345678901234567890ABCDEF12', '0x3c4d5e6f789012345678901234567890abcdef123456789012345678901234ab', 3456789);

-- Sample market transactions
INSERT INTO market_transactions (credit_id, seller_address, buyer_address, amount, price_per_credit, total_price, currency, status, transaction_hash, completed_at) VALUES
(1, '0x1234567890123456789012345678901234567890', '0x9876543210987654321098765432109876543210', 5000.00, 25.50, 127500.00, 'USDC', 'completed', '0x4d5e6f789012345678901234567890abcdef123456789012345678901234abc', '2024-02-10 14:30:00'),
(2, '0x2345678901234567890123456789012345678901', NULL, 10000.00, 22.75, 227500.00, 'USDC', 'pending', NULL, NULL),
(3, '0x3456789012345678901234567890123456789012', '0x8765432109876543210987654321098765432109', 3000.00, 28.00, 84000.00, 'USDC', 'completed', '0x5e6f789012345678901234567890abcdef123456789012345678901234abcd', '2024-02-12 16:45:00');

-- Sample lending positions
INSERT INTO lending_positions (user_address, credit_id, collateral_amount, borrowed_amount, interest_rate, health_factor, liquidation_threshold, position_hash, status) VALUES
('0x1234567890123456789012345678901234567890', 1, 10000.00, 180000.00, 0.085, 1.45, 0.75, '0x6f789012345678901234567890abcdef123456789012345678901234abcde', 'active'),
('0x2345678901234567890123456789012345678901', 2, 7500.00, 135000.00, 0.092, 1.62, 0.75, '0x789012345678901234567890abcdef123456789012345678901234abcdef', 'active'),
('0x3456789012345678901234567890123456789012', 3, 5000.00, 85000.00, 0.078, 1.88, 0.75, '0x89012345678901234567890abcdef123456789012345678901234abcdef1', 'active');

-- Sample activity log
INSERT INTO activity_log (user_address, action_type, project_id, credit_id, details) VALUES
('0x1234567890123456789012345678901234567890', 'project_created', 1, NULL, '{"name": "Amazon Rainforest Conservation", "estimated_tco2e": 500000}'),
('0x2345678901234567890123456789012345678901', 'project_created', 2, NULL, '{"name": "Solar Farm Initiative Kenya", "estimated_tco2e": 250000}'),
('0x1234567890123456789012345678901234567890', 'project_verified', 1, NULL, '{"score": 0.92, "model_used": "Gemini 1.5 Pro + XC3 Local AI", "processing_time": 3500}'),
('0x2345678901234567890123456789012345678901', 'project_verified', 2, NULL, '{"score": 0.89, "model_used": "Gemini 1.5 Pro + XC3 Local AI", "processing_time": 4200}'),
('0x1234567890123456789012345678901234567890', 'credits_minted', 1, 1, '{"amount": 100000, "chain_id": 7001, "contract_address": "0xA1B2C3D4E5F6789012345678901234567890ABCD"}'),
('0x9876543210987654321098765432109876543210', 'credits_purchased', NULL, 1, '{"amount": 5000, "price_per_credit": 25.50, "total_price": 127500}'),
('0x1234567890123456789012345678901234567890', 'lending_position_created', 1, 1, '{"collateral_amount": 10000, "borrowed_amount": 180000, "health_factor": 1.45}');

-- Success message
SELECT 'XC3 Database initialized successfully! 🎉' as status,
       (SELECT COUNT(*) FROM projects) as projects_loaded,
       (SELECT COUNT(*) FROM carbon_credits) as credits_minted,
       (SELECT COUNT(*) FROM market_transactions) as market_transactions,
       (SELECT COUNT(*) FROM lending_positions) as lending_positions,
       (SELECT COUNT(*) FROM activity_log) as activity_entries;
