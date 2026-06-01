-- Order Chat Table for AI Steward Bridge
CREATE TABLE IF NOT EXISTS order_chat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL, -- USER, SUPPLIER, STEWARD
    content_original TEXT NOT NULL,
    content_translated TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_chat_order_id ON order_chat(order_id);
