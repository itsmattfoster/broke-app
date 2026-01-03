-- Migration script to populate Supabase with mock data
-- Replace 'YOUR_EMAIL@example.com' with the actual user email
-- Run this in the Supabase SQL Editor

-- Set the user email variable (replace this)
DO $$
DECLARE
  user_email text := 'YOUR_EMAIL@example.com';
BEGIN
  -- Clear existing data for this user (optional - comment out if you want to keep existing data)
  -- DELETE FROM transactions WHERE user_email = user_email;
  -- DELETE FROM category_budgets WHERE user_email = user_email;
  -- DELETE FROM income_sources WHERE user_email = user_email;
  -- DELETE FROM school_plans WHERE user_email = user_email;
  -- DELETE FROM settings WHERE user_email = user_email;
  -- DELETE FROM coaching_messages WHERE user_email = user_email;

  -- Insert Transactions (sample of key transactions - adjust dates as needed)
  INSERT INTO transactions (id, user_email, date, merchant, category, amount, type, needs_review, icon, payment_method)
  VALUES
    -- Recent transactions
    ('t1', user_email, NOW() - INTERVAL '0 days', 'Petco', 'Other', 10.00, 'spend', true, '📦', 'cash'),
    ('t2', user_email, NOW() - INTERVAL '0 days', 'Amc Theatres', 'Entertainment', 27.99, 'spend', true, '🎬', 'cash'),
    ('t3', user_email, NOW() - INTERVAL '0 days', 'Starbucks', 'Food', 20.00, 'spend', true, '🥑', 'cash'),
    ('t4', user_email, NOW() - INTERVAL '1 days', 'Chipotle', 'Food', 15.50, 'spend', false, '🥑', 'cash'),
    ('t5', user_email, NOW() - INTERVAL '2 days', 'Shell Gas', 'Transportation', 45.00, 'spend', false, '🚗', 'cash'),
    ('t6', user_email, NOW() - INTERVAL '3 days', 'Target', 'Shopping', 78.42, 'spend', false, '🛍️', 'cash'),
    ('t7', user_email, NOW() - INTERVAL '4 days', 'Paycheck', 'Income', 1200.00, 'earn', false, '💰', 'cash'),
    ('t8', user_email, NOW() - INTERVAL '5 days', 'Uber Eats', 'Food', 32.15, 'spend', false, '🥑', 'cash'),
    ('t9', user_email, NOW() - INTERVAL '10 days', 'Whole Foods', 'Food', 125.67, 'spend', false, '🥑', 'cash'),
    ('t10', user_email, NOW() - INTERVAL '12 days', 'Spotify', 'Entertainment', 10.99, 'spend', false, '🎬', 'cash'),
    ('t11', user_email, NOW() - INTERVAL '14 days', 'LA Fitness', 'Self Care', 49.99, 'spend', false, '💪', 'cash'),
    ('t12', user_email, NOW() - INTERVAL '15 days', 'Barnes & Noble', 'Shopping', 42.00, 'spend', false, '🛍️', 'cash'),
    ('t13', user_email, NOW() - INTERVAL '18 days', 'Paycheck', 'Income', 1200.00, 'earn', false, '💰', 'cash'),
    ('t14', user_email, NOW() - INTERVAL '8 days', 'Netflix', 'Subscriptions', 15.99, 'spend', false, '📺', 'cash'),
    ('t15', user_email, NOW() - INTERVAL '12 days', 'Spotify Premium', 'Subscriptions', 10.99, 'spend', false, '📺', 'cash'),
    ('t16', user_email, NOW() - INTERVAL '15 days', 'Adobe Creative Cloud', 'Subscriptions', 52.99, 'spend', false, '📺', 'cash'),
    ('t17', user_email, NOW() - INTERVAL '20 days', 'Amazon Prime', 'Subscriptions', 14.99, 'spend', false, '📺', 'cash'),
    ('t18', user_email, NOW() - INTERVAL '7 days', 'Post Office', 'Other', 12.50, 'spend', false, '📦', 'cash'),
    -- Flex dollar transactions (relative to term start)
    ('flex1', user_email, '2025-01-20'::date, 'Campus Store', 'Shopping', 12.50, 'spend', false, '🛍️', 'flex'),
    ('flex2', user_email, '2025-01-27'::date, 'Dining Hall', 'Food', 8.75, 'spend', false, '🥑', 'flex'),
    ('flex3', user_email, '2025-02-02'::date, 'Coffee Shop', 'Food', 5.25, 'spend', false, '🥑', 'flex'),
    ('flex4', user_email, '2025-02-09'::date, 'Bookstore', 'Shopping', 45.00, 'spend', false, '🛍️', 'flex'),
    ('swipe1', user_email, '2025-01-23'::date, 'Dining Hall', 'Food', 0, 'spend', false, '🥑', 'swipe'),
    ('swipe2', user_email, '2025-01-30'::date, 'Cafeteria', 'Food', 0, 'spend', false, '🥑', 'swipe')
  ON CONFLICT (id) DO NOTHING;

  -- Insert Category Budgets
  INSERT INTO category_budgets (user_email, category, monthly_budget, spent_to_date, icon, color)
  VALUES
    (user_email, 'Food', 200, 186.37, '🥑', '#F38181'),
    (user_email, 'Shopping', 300, 343.39, '🛍️', '#95E1D3'),
    (user_email, 'Transportation', 250, 63.50, '🚗', '#FCBAD3'),
    (user_email, 'Self Care', 100, 49.99, '💪', '#FFD93D'),
    (user_email, 'Entertainment', 150, 127.83, '🎬', '#AA96DA'),
    (user_email, 'Subscriptions', 150, 102.94, '📺', '#4ECDC4'),
    (user_email, 'Other', 200, 85.00, '📦', '#6BCF7F')
  ON CONFLICT (user_email, category) DO UPDATE SET
    monthly_budget = EXCLUDED.monthly_budget,
    spent_to_date = EXCLUDED.spent_to_date,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color;

  -- Insert Income Sources
  INSERT INTO income_sources (id, user_email, name, amount, frequency, last_received, icon)
  VALUES
    ('i1', user_email, 'Part-time Job', 1200.00, 'biweekly', NOW() - INTERVAL '4 days', '💼'),
    ('i2', user_email, 'Freelance Work', 450.00, 'monthly', NOW() - INTERVAL '15 days', '💻'),
    ('i3', user_email, 'Birthday Money', 100.00, 'once', NOW() - INTERVAL '60 days', '🎉')
  ON CONFLICT (id) DO NOTHING;

  -- Insert School Plan
  INSERT INTO school_plans (user_email, flex_dollars_balance, meal_swipes_remaining, term_start, term_end, avg_daily_burn, projected_run_out_date)
  VALUES
    (user_email, 487.50, 42, '2025-01-15'::date, '2025-05-20'::date, 18.75, '2025-02-15'::date)
  ON CONFLICT (user_email) DO UPDATE SET
    flex_dollars_balance = EXCLUDED.flex_dollars_balance,
    meal_swipes_remaining = EXCLUDED.meal_swipes_remaining,
    term_start = EXCLUDED.term_start,
    term_end = EXCLUDED.term_end,
    avg_daily_burn = EXCLUDED.avg_daily_burn,
    projected_run_out_date = EXCLUDED.projected_run_out_date;

  -- Insert Settings
  INSERT INTO settings (user_email, currency, notifications_enabled, demo_mode)
  VALUES
    (user_email, 'USD', true, false)
  ON CONFLICT (user_email) DO UPDATE SET
    currency = EXCLUDED.currency,
    notifications_enabled = EXCLUDED.notifications_enabled,
    demo_mode = EXCLUDED.demo_mode;

  RAISE NOTICE 'Migration completed for user: %', user_email;
END $$;

