-- Machine Learning Training Tables
-- Add these tables to your existing Supabase database

-- Table: loan_outcomes
-- Stores historical loan outcomes for ML training
CREATE TABLE IF NOT EXISTS loan_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,
  trust_score INTEGER NOT NULL,
  component_scores JSONB NOT NULL,
  loan_amount DECIMAL(10, 2) NOT NULL,
  repaid BOOLEAN NOT NULL DEFAULT false,
  default_occurred BOOLEAN NOT NULL DEFAULT false,
  repayment_rate DECIMAL(5, 4),
  days_to_default INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: ml_model_stats
-- Stores ML model statistics and learned weights
CREATE TABLE IF NOT EXISTS ml_model_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weights JSONB NOT NULL,
  coefficients JSONB NOT NULL,
  training_samples INTEGER NOT NULL DEFAULT 0,
  model_version TEXT NOT NULL,
  learning_rate DECIMAL(5, 4) NOT NULL,
  accuracy DECIMAL(5, 4),
  precision_score DECIMAL(5, 4),
  recall_score DECIMAL(5, 4),
  f1_score DECIMAL(5, 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_loan_outcomes_user_id ON loan_outcomes(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_outcomes_created_at ON loan_outcomes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loan_outcomes_repaid ON loan_outcomes(repaid);
CREATE INDEX IF NOT EXISTS idx_ml_model_stats_created_at ON ml_model_stats(created_at DESC);

-- Enable Row Level Security
ALTER TABLE loan_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loan_outcomes
CREATE POLICY "Users can view their own loan outcomes"
  ON loan_outcomes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert loan outcomes"
  ON loan_outcomes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update loan outcomes"
  ON loan_outcomes FOR UPDATE
  USING (true);

-- RLS Policies for ml_model_stats (admin only)
CREATE POLICY "Anyone can view ML model stats"
  ON ml_model_stats FOR SELECT
  USING (true);

CREATE POLICY "System can insert ML model stats"
  ON ml_model_stats FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for loan_outcomes
CREATE TRIGGER update_loan_outcomes_updated_at
  BEFORE UPDATE ON loan_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE loan_outcomes IS 'Historical loan outcomes for ML model training';
COMMENT ON TABLE ml_model_stats IS 'ML model statistics and learned weights over time';
COMMENT ON COLUMN loan_outcomes.component_scores IS 'JSON object with utility, upi, location, social scores';
COMMENT ON COLUMN loan_outcomes.repayment_rate IS 'Percentage of loan repaid (0.0 to 1.0)';
COMMENT ON COLUMN ml_model_stats.weights IS 'Learned weights for each component';
COMMENT ON COLUMN ml_model_stats.coefficients IS 'Logistic regression coefficients';
