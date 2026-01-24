-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  full_name TEXT,
  trust_score INT DEFAULT 0,
  risk_category TEXT DEFAULT 'UNSCORED',
  data_uploaded BOOLEAN DEFAULT FALSE,
  upi_connected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user scores history
CREATE TABLE IF NOT EXISTS score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INT NOT NULL,
  utility_discipline DECIMAL(3,1),
  upi_stability DECIMAL(3,1),
  location_stability DECIMAL(3,1),
  social_trust DECIMAL(3,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create loan applications
CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  tenure INT NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  monthly_emi INT NOT NULL,
  total_interest INT NOT NULL,
  total_payment INT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create payment records
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT DEFAULT 'DUE',
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin',
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for score_history
CREATE POLICY "Users can view their own score history" ON score_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own score history" ON score_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for loan_applications
CREATE POLICY "Users can view their own loans" ON loan_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loans" ON loan_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans" ON loan_applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loan_applications
      WHERE loan_applications.id = payments.loan_id
      AND loan_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own payments" ON payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM loan_applications
      WHERE loan_applications.id = payments.loan_id
      AND loan_applications.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM loan_applications
      WHERE loan_applications.id = payments.loan_id
      AND loan_applications.user_id = auth.uid()
    )
  );

-- RLS Policies for admin_users
CREATE POLICY "Admins can view admin table" ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_score_history_user_id ON score_history(user_id, created_at DESC);
CREATE INDEX idx_loan_applications_user_id ON loan_applications(user_id, created_at DESC);
CREATE INDEX idx_payments_loan_id ON payments(loan_id, due_date);
CREATE INDEX idx_payments_status ON payments(status);
