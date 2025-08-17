-- Investment Management App Database Schema
-- This script creates all necessary tables for the investment management application

-- Users table (handled by Supabase Auth, but we can extend with profile info)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investment types (stocks, gold, crypto, etc.)
CREATE TABLE IF NOT EXISTS investment_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL, -- 'commodity', 'stock', 'crypto', etc.
  unit_type VARCHAR(20) NOT NULL, -- 'shares', 'grams', 'ounces', 'coins'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User investments (initial and additional purchases)
CREATE TABLE IF NOT EXISTS investments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_type_id INTEGER REFERENCES investment_types(id),
  name VARCHAR(100) NOT NULL, -- 'Gold', 'Google Stock', 'Bitcoin', etc.
  symbol VARCHAR(10), -- 'GOOGL', 'BTC', etc.
  initial_amount DECIMAL(15,2) NOT NULL,
  initial_quantity DECIMAL(15,6) NOT NULL,
  initial_price_per_unit DECIMAL(15,6) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  purchase_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional purchases/sales (buy/sell transactions)
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  investment_id INTEGER REFERENCES investments(id) ON DELETE CASCADE,
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  quantity DECIMAL(15,6) NOT NULL,
  price_per_unit DECIMAL(15,6) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  transaction_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal entries for tracking current prices and conditions
CREATE TABLE IF NOT EXISTS journal_entries (
  id SERIAL PRIMARY KEY,
  investment_id INTEGER REFERENCES investments(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  current_price DECIMAL(15,6) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default investment types
INSERT INTO investment_types (name, category, unit_type) VALUES
('Gold', 'commodity', 'grams'),
('Silver', 'commodity', 'grams'),
('Stock', 'equity', 'shares'),
('Bitcoin', 'crypto', 'coins'),
('Ethereum', 'crypto', 'coins'),
('Real Estate', 'property', 'units')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for investments
CREATE POLICY "Users can view own investments" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments" ON investments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investments" ON investments
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM investments WHERE id = investment_id));

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM investments WHERE id = investment_id));

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM investments WHERE id = investment_id));

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM investments WHERE id = investment_id));

-- Create policies for journal_entries
CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM investments WHERE id = investment_id));

CREATE POLICY "Users can insert own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM investments WHERE id = investment_id));

CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM investments WHERE id = investment_id));

CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM investments WHERE id = investment_id));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_investment_id ON transactions(investment_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_investment_id ON journal_entries(investment_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
