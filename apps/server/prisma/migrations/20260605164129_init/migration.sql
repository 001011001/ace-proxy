-- CreateTable
CREATE TABLE "ace_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "total_spend" DECIMAL NOT NULL DEFAULT 0,
    "credits" DECIMAL NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'EXPLORER',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ace_suppliers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "avg_lead_time_hrs" REAL,
    "defect_rate" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ace_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "partner_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total_amount" DECIMAL NOT NULL,
    "source_cost" DECIMAL,
    "shipping_fee" DECIMAL,
    "service_fee" DECIMAL,
    "commission_amount" DECIMAL NOT NULL DEFAULT 0,
    "risk_pool_amount" DECIMAL,
    "compliance_audit_log" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ace_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ace_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ace_orders_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "ace_partners" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ace_partners" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "invite_code" TEXT NOT NULL,
    "commission_rate" DECIMAL NOT NULL DEFAULT 0.05,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "pending_settlement" DECIMAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ace_partners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ace_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ace_vault_ledger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "entry_type" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ace_vault_ledger_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ace_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ace_order_chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content_original" TEXT NOT NULL,
    "content_translated" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ace_order_chat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ace_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ace_order_chat_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ace_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ace_hero_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "source_price_cny" DECIMAL,
    "local_price_idr" DECIMAL,
    "arbitrage_gap_pct" DECIMAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "patent_status" TEXT NOT NULL DEFAULT 'CLEAN',
    "last_audit_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ace_holiday_config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "station_id" TEXT NOT NULL,
    "festival_name" TEXT NOT NULL,
    "theme_id" TEXT NOT NULL,
    "reminder_days" INTEGER NOT NULL DEFAULT 30,
    "reminder_message" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ace_payment_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "region_code" TEXT NOT NULL,
    "provider_name" TEXT NOT NULL,
    "bank_name" TEXT,
    "account_number" TEXT,
    "beneficiary_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ace_users_email_key" ON "ace_users"("email");

-- CreateIndex
CREATE INDEX "ace_orders_user_id_idx" ON "ace_orders"("user_id");

-- CreateIndex
CREATE INDEX "ace_orders_status_idx" ON "ace_orders"("status");

-- CreateIndex
CREATE INDEX "ace_orders_partner_id_idx" ON "ace_orders"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_partners_invite_code_key" ON "ace_partners"("invite_code");

-- CreateIndex
CREATE INDEX "ace_vault_ledger_account_idx" ON "ace_vault_ledger"("account");

-- CreateIndex
CREATE INDEX "ace_hero_products_status_idx" ON "ace_hero_products"("status");

-- CreateIndex
CREATE INDEX "ace_hero_products_category_idx" ON "ace_hero_products"("category");

-- CreateIndex
CREATE INDEX "ace_holiday_config_station_id_idx" ON "ace_holiday_config"("station_id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_payment_configs_region_code_provider_name_key" ON "ace_payment_configs"("region_code", "provider_name");
