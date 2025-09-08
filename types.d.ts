interface Cart {
    id: string;
    token: string;
    line_items: LineItem[];
    note: string | null;
    updated_at: string; // ISO date string
    created_at: string; // ISO date string
}

interface LineItem {
    id: number;
    properties: Record<string, unknown>;
    quantity: number;
    variant_id: number;
    key: string;
    discounted_price: string;
    discounts: unknown[]; // can refine if you know the structure of discounts
    gift_card: boolean;
    grams: number;
    line_price: string;
    original_line_price: string;
    original_price: string;
    price: string;
    product_id: number;
    sku: string;
    taxable: boolean;
    title: string;
    total_discount: string;
    vendor: string;
    discounted_price_set: PriceSet;
    line_price_set: PriceSet;
    original_line_price_set: PriceSet;
    price_set: PriceSet;
    total_discount_set: PriceSet;
}

interface PriceSet {
    shop_money: Money;
    presentment_money: Money;
}

interface Money {
    amount: string;
    currency_code: string;
}
