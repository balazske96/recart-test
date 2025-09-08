-- Table: shops
CREATE TABLE shops
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    domain     VARCHAR(255) NOT NULL UNIQUE,
    currency   VARCHAR(10)  NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;

-- Table: sessions
CREATE TABLE sessions
(
    id              INT AUTO_INCREMENT PRIMARY KEY,
    shop_id         INT          NOT NULL,
    shopify_cart_id VARCHAR(255) NOT NULL UNIQUE,
    cart_data       JSON         NOT NULL,
    value           DECIMAL(12, 2), -- value in shop currency
    value_usd       DECIMAL(12, 2), -- converted USD value
    item_count      INT,
    cart_updated_at DATETIME,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sessions_shop FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- Helpful indexes
CREATE INDEX idx_sessions_shop_id ON sessions (shop_id);
CREATE INDEX idx_sessions_cart_updated_at ON sessions (cart_updated_at);

-- Mock data: shops
INSERT INTO shops (domain, currency) VALUES
('store-usa.myshopify.com', 'USD'),
('store-canada.myshopify.com', 'CAD'),
('store-uk.myshopify.com', 'GBP'),
('store-europe.myshopify.com', 'EUR'),
('store-japan.myshopify.com', 'JPY');

-- Mock data: sessions
INSERT INTO sessions (shop_id, shopify_cart_id, cart_data, value, value_usd, item_count, cart_updated_at) VALUES
(1, 'cart_01234567890', JSON_OBJECT(
    'id', 'cart_01234567890',
    'token', 'token12345',
    'line_items', JSON_ARRAY(
        JSON_OBJECT(
            'id', 101,
            'properties', JSON_OBJECT(),
            'quantity', 2,
            'variant_id', 1001,
            'key', 'key1001',
            'discounted_price', '29.99',
            'discounts', JSON_ARRAY(),
            'gift_card', false,
            'grams', 500,
            'line_price', '59.98'
        ),
        JSON_OBJECT(
            'id', 102,
            'properties', JSON_OBJECT(),
            'quantity', 1,
            'variant_id', 1002,
            'key', 'key1002',
            'discounted_price', '49.95',
            'discounts', JSON_ARRAY(),
            'gift_card', false,
            'grams', 300,
            'line_price', '49.95'
        )
    ),
    'note', null,
    'updated_at', '2025-09-07T10:00:00Z',
    'created_at', '2025-09-07T09:30:00Z'
), 109.93, 109.93, 3, '2025-09-07 10:00:00'),

(2, 'cart_abcdefghijk', JSON_OBJECT(
    'id', 'cart_abcdefghijk',
    'token', 'tokenabcde',
    'line_items', JSON_ARRAY(
        JSON_OBJECT(
            'id', 201,
            'properties', JSON_OBJECT('color', 'blue'),
            'quantity', 1,
            'variant_id', 2001,
            'key', 'key2001',
            'discounted_price', '75.00',
            'discounts', JSON_ARRAY(),
            'gift_card', false,
            'grams', 750,
            'line_price', '75.00'
        ),
        JSON_OBJECT(
            'id', 202,
            'properties', JSON_OBJECT(),
            'quantity', 3,
            'variant_id', 2002,
            'key', 'key2002',
            'discounted_price', '15.50',
            'discounts', JSON_ARRAY(),
            'gift_card', false,
            'grams', 100,
            'line_price', '46.50'
        )
    ),
    'note', 'Please gift wrap',
    'updated_at', '2025-09-07T11:30:00Z',
    'created_at', '2025-09-07T11:00:00Z'
), 121.50, 97.20, 4, '2025-09-07 11:30:00'),

(3, 'cart_lmnopqrstuv', JSON_OBJECT(
    'id', 'cart_lmnopqrstuv',
    'token', 'tokenlmnop',
    'line_items', JSON_ARRAY(
        JSON_OBJECT(
            'id', 301,
            'properties', JSON_OBJECT('size', 'XL'),
            'quantity', 1,
            'variant_id', 3001,
            'key', 'key3001',
            'discounted_price', '89.99',
            'discounts', JSON_ARRAY(),
            'gift_card', false,
            'grams', 400,
            'line_price', '89.99'
        )
    ),
    'note', null,
    'updated_at', '2025-09-07T12:15:00Z',
    'created_at', '2025-09-07T12:00:00Z'
), 89.99, 124.19, 1, '2025-09-07 12:15:00'),

(4, 'cart_wxyz123456', JSON_OBJECT(
    'id', 'cart_wxyz123456',
    'token', 'tokenwxyz',
    'line_items', JSON_ARRAY(
        JSON_OBJECT(
            'id', 401,
            'properties', JSON_OBJECT(),
            'quantity', 2,
            'variant_id', 4001,
            'key', 'key4001',
            'discounted_price', '35.00',
            'discounts', JSON_ARRAY(),
            'gift_card', false,
            'grams', 600,
            'line_price', '70.00'
        ),
        JSON_OBJECT(
            'id', 402,
            'properties', JSON_OBJECT('color', 'black', 'material', 'leather'),
            'quantity', 1,
            'variant_id', 4002,
            'key', 'key4002',
            'discounted_price', '120.00',
            'discounts', JSON_ARRAY(),
            'gift_card', false,
            'grams', 800,
            'line_price', '120.00'
        ),
        JSON_OBJECT(
            'id', 403,
            'properties', JSON_OBJECT(),
            'quantity', 4,
            'variant_id', 4003,
            'key', 'key4003',
            'discounted_price', '9.99',
            'discounts', JSON_ARRAY(),
            'gift_card', false,
            'grams', 50,
            'line_price', '39.96'
        )
    ),
    'note', 'This is a gift',
    'updated_at', '2025-09-07T14:45:00Z',
    'created_at', '2025-09-07T14:15:00Z'
), 209.96, 247.75, 7, '2025-09-07 14:45:00'),

(5, 'cart_789abc0123', JSON_OBJECT(
    'id', 'cart_789abc0123',
    'token', 'token789abc',
    'line_items', JSON_ARRAY(
        JSON_OBJECT(
            'id', 501,
            'properties', JSON_OBJECT(),
            'quantity', 3,
            'variant_id', 5001,
            'key', 'key5001',
            'discounted_price', '1500',
            'discounts', JSON_ARRAY(),
            'gift_card', false,
            'grams', 200,
            'line_price', '4500'
        ),
        JSON_OBJECT(
            'id', 502,
            'properties', JSON_OBJECT('edition', 'limited'),
            'quantity', 1,
            'variant_id', 5002,
            'key', 'key5002',
            'discounted_price', '5000',
            'discounts', JSON_ARRAY(),
            'gift_card', true,
            'grams', 0,
            'line_price', '5000'
        )
    ),
    'note', 'Expedited shipping requested',
    'updated_at', '2025-09-07T16:20:00Z',
    'created_at', '2025-09-07T16:00:00Z'
), 9500, 66.50, 4, '2025-09-07 16:20:00');
