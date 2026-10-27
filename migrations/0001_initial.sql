-- For a NEW database. Existing README-era tables require a separate migration.
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT,
  google_sub TEXT UNIQUE,
  avatar TEXT NOT NULL DEFAULT 'U',
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),
  created_at TEXT NOT NULL,
  last_active_at TEXT NOT NULL
);
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE wallets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0 CHECK(abs(balance) <= 9000000000000),
  color TEXT NOT NULL DEFAULT 'indigo',
  icon TEXT NOT NULL DEFAULT 'wallet',
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX wallets_user ON wallets(user_id);
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id TEXT NOT NULL REFERENCES wallets(id),
  to_wallet_id TEXT REFERENCES wallets(id),
  type TEXT NOT NULL CHECK(type IN ('pemasukan','pengeluaran','transfer')),
  merchant TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK(amount > 0 AND amount <= 1000000000000),
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  receipt_key TEXT,
  items_json TEXT NOT NULL DEFAULT '[]',
  reminder INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  CHECK((type = 'transfer' AND to_wallet_id IS NOT NULL AND wallet_id <> to_wallet_id)
    OR (type <> 'transfer' AND to_wallet_id IS NULL))
);
CREATE INDEX transactions_user_date ON transactions(user_id, date);
CREATE INDEX transactions_wallet ON transactions(wallet_id);
CREATE INDEX transactions_target ON transactions(to_wallet_id);
-- Ownership and balances are enforced inside the SAME SQLite transaction.
CREATE TRIGGER transaction_owner BEFORE INSERT ON transactions BEGIN
  SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM wallets WHERE id=NEW.wallet_id AND user_id=NEW.user_id)
    THEN RAISE(ABORT,'wallet ownership') END;
  SELECT CASE WHEN NEW.type='transfer' AND NOT EXISTS(SELECT 1 FROM wallets WHERE id=NEW.to_wallet_id AND user_id=NEW.user_id)
    THEN RAISE(ABORT,'wallet ownership') END;
END;
CREATE TRIGGER transaction_insert AFTER INSERT ON transactions BEGIN
  UPDATE wallets SET balance=balance + CASE WHEN NEW.type='pemasukan' THEN NEW.amount ELSE -NEW.amount END WHERE id=NEW.wallet_id;
  UPDATE wallets SET balance=balance+NEW.amount WHERE id=NEW.to_wallet_id AND NEW.type='transfer';
END;
CREATE TRIGGER transaction_delete AFTER DELETE ON transactions BEGIN
  UPDATE wallets SET balance=balance - CASE WHEN OLD.type='pemasukan' THEN OLD.amount ELSE -OLD.amount END WHERE id=OLD.wallet_id;
  UPDATE wallets SET balance=balance-OLD.amount WHERE id=OLD.to_wallet_id AND OLD.type='transfer';
END;
CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  ai_provider TEXT NOT NULL DEFAULT 'auto' CHECK(ai_provider IN ('auto','gemini','chatgpt')),
  notifications INTEGER NOT NULL DEFAULT 1,
  dark_mode INTEGER NOT NULL DEFAULT 0,
  categories_json TEXT
);
CREATE TABLE app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE INDEX rate_limits_expiry ON rate_limits(expires_at);
