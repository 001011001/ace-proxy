-- CreateTable
CREATE TABLE "ace_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "total_spend" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "credits" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'EXPLORER',
    "last_login_at" TIMESTAMP(3),
    "referred_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avg_lead_time_hrs" DOUBLE PRECISION,
    "defect_rate" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "partner_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "country" TEXT,
    "warehouse_id" TEXT,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "source_cost" DECIMAL(65,30),
    "shipping_fee" DECIMAL(65,30),
    "service_fee" DECIMAL(65,30),
    "commission_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "risk_pool_amount" DECIMAL(65,30),
    "loss_amount" DECIMAL(65,30),
    "compliance_audit_log" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_partners" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "invite_code" TEXT NOT NULL,
    "commission_rate" DECIMAL(65,30) NOT NULL DEFAULT 0.05,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "pending_settlement" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_vault_ledger" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "entry_type" TEXT NOT NULL,
    "loss_type" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_vault_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_order_chat" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content_original" TEXT NOT NULL,
    "content_translated" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_order_chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_hero_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "source_price_cny" DECIMAL(65,30),
    "local_price_idr" DECIMAL(65,30),
    "arbitrage_gap_pct" DECIMAL(65,30),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "patent_status" TEXT NOT NULL DEFAULT 'CLEAN',
    "last_audit_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_hero_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_holiday_config" (
    "id" SERIAL NOT NULL,
    "station_id" TEXT NOT NULL,
    "festival_name" TEXT NOT NULL,
    "theme_id" TEXT NOT NULL,
    "reminder_days" INTEGER NOT NULL DEFAULT 30,
    "reminder_message" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_holiday_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_payment_configs" (
    "id" TEXT NOT NULL,
    "region_code" TEXT NOT NULL,
    "provider_name" TEXT NOT NULL,
    "bank_name" TEXT,
    "account_number" TEXT,
    "beneficiary_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_payment_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_products" (
    "id" TEXT NOT NULL,
    "hero_product_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "source_url" TEXT,
    "supplier_id" TEXT,
    "price_idr" DECIMAL(65,30) NOT NULL,
    "cost_cny" DECIMAL(65,30),
    "image_urls" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "rating_avg" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ace_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_cart_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "selected" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_user_addresses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "label" TEXT,
    "recipient_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "province" TEXT,
    "city" TEXT,
    "district" TEXT,
    "postal_code" TEXT,
    "detail" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_user_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_product_reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT,
    "images" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "min_spend" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "max_discount" DECIMAL(65,30),
    "country" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "usage_limit" INTEGER NOT NULL DEFAULT 1,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "claimed_at" TIMESTAMP(3),
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_product_localizations" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_local" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "shipping_cost" DECIMAL(65,30) NOT NULL,
    "order_count" INTEGER NOT NULL DEFAULT 0,
    "rating_avg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ace_product_localizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_logistics_nodes" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "node" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT,
    "note" TEXT,

    CONSTRAINT "ace_logistics_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_parcels" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "order_item_id" TEXT,
    "weight" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_TRANSIT_TO_WAREHOUSE',
    "arrived_at" TIMESTAMP(3),
    "qc_status" TEXT,
    "qc_images" TEXT,
    "warehouse_entry_at" TIMESTAMP(3),
    "warehouse_exit_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_parcels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_qc_reports" (
    "id" TEXT NOT NULL,
    "parcel_id" TEXT NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'PENDING',
    "defects" TEXT,
    "images" TEXT,
    "operator_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_qc_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_refunds" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approver_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_consolidation_orders" (
    "id" TEXT NOT NULL,
    "parcel_ids" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "route_id" TEXT,
    "box_number" TEXT NOT NULL,
    "total_weight" DOUBLE PRECISION,
    "total_volume" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_consolidation_orders_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "ace_products_hero_product_id_key" ON "ace_products"("hero_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_products_source_url_key" ON "ace_products"("source_url");

-- CreateIndex
CREATE INDEX "ace_products_status_idx" ON "ace_products"("status");

-- CreateIndex
CREATE INDEX "ace_products_category_idx" ON "ace_products"("category");

-- CreateIndex
CREATE INDEX "ace_products_hero_product_id_idx" ON "ace_products"("hero_product_id");

-- CreateIndex
CREATE INDEX "ace_order_items_order_id_idx" ON "ace_order_items"("order_id");

-- CreateIndex
CREATE INDEX "ace_order_items_product_id_idx" ON "ace_order_items"("product_id");

-- CreateIndex
CREATE INDEX "ace_cart_items_user_id_idx" ON "ace_cart_items"("user_id");

-- CreateIndex
CREATE INDEX "ace_cart_items_product_id_idx" ON "ace_cart_items"("product_id");

-- CreateIndex
CREATE INDEX "ace_user_addresses_user_id_idx" ON "ace_user_addresses"("user_id");

-- CreateIndex
CREATE INDEX "ace_product_reviews_product_id_idx" ON "ace_product_reviews"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_coupons_code_key" ON "ace_coupons"("code");

-- CreateIndex
CREATE INDEX "ace_coupons_status_idx" ON "ace_coupons"("status");

-- CreateIndex
CREATE INDEX "ace_product_localizations_country_idx" ON "ace_product_localizations"("country");

-- CreateIndex
CREATE INDEX "ace_logistics_nodes_order_id_idx" ON "ace_logistics_nodes"("order_id");

-- CreateIndex
CREATE INDEX "ace_parcels_order_id_idx" ON "ace_parcels"("order_id");

-- CreateIndex
CREATE INDEX "ace_parcels_status_idx" ON "ace_parcels"("status");

-- CreateIndex
CREATE INDEX "ace_qc_reports_parcel_id_idx" ON "ace_qc_reports"("parcel_id");

-- CreateIndex
CREATE INDEX "ace_refunds_order_id_idx" ON "ace_refunds"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_consolidation_orders_box_number_key" ON "ace_consolidation_orders"("box_number");

-- CreateIndex
CREATE INDEX "ace_consolidation_orders_status_idx" ON "ace_consolidation_orders"("status");

-- AddForeignKey
ALTER TABLE "ace_orders" ADD CONSTRAINT "ace_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ace_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_orders" ADD CONSTRAINT "ace_orders_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "ace_partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_partners" ADD CONSTRAINT "ace_partners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ace_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_vault_ledger" ADD CONSTRAINT "ace_vault_ledger_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ace_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_order_chat" ADD CONSTRAINT "ace_order_chat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ace_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_order_chat" ADD CONSTRAINT "ace_order_chat_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ace_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_products" ADD CONSTRAINT "ace_products_hero_product_id_fkey" FOREIGN KEY ("hero_product_id") REFERENCES "ace_hero_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_order_items" ADD CONSTRAINT "ace_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ace_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_order_items" ADD CONSTRAINT "ace_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ace_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_cart_items" ADD CONSTRAINT "ace_cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ace_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_cart_items" ADD CONSTRAINT "ace_cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ace_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_user_addresses" ADD CONSTRAINT "ace_user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ace_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_product_reviews" ADD CONSTRAINT "ace_product_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ace_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_product_reviews" ADD CONSTRAINT "ace_product_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ace_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_product_localizations" ADD CONSTRAINT "ace_product_localizations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ace_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_logistics_nodes" ADD CONSTRAINT "ace_logistics_nodes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ace_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_parcels" ADD CONSTRAINT "ace_parcels_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ace_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_refunds" ADD CONSTRAINT "ace_refunds_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ace_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
