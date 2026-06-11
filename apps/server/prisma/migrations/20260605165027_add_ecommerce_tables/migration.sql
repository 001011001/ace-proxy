-- CreateTable
CREATE TABLE "ace_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hero_product_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "price_idr" DECIMAL NOT NULL,
    "cost_cny" DECIMAL,
    "image_urls" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "rating_avg" DECIMAL NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ace_products_hero_product_id_fkey" FOREIGN KEY ("hero_product_id") REFERENCES "ace_hero_products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ace_order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL NOT NULL,
    CONSTRAINT "ace_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ace_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ace_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ace_products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ace_cart_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "selected" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ace_cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ace_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ace_cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ace_products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ace_user_addresses" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ace_user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ace_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ace_product_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT,
    "images" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ace_product_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ace_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ace_product_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ace_products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ace_coupons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DECIMAL NOT NULL,
    "min_spend" DECIMAL NOT NULL DEFAULT 0,
    "max_discount" DECIMAL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "usage_limit" INTEGER NOT NULL DEFAULT 1,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ace_products_hero_product_id_key" ON "ace_products"("hero_product_id");

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
