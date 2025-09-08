/**
 * Enum for Shopify webhook headers
 * @description These headers are sent with every Shopify webhook request
 */
export enum ShopifyHeaders {
  /**
   * The name of the topic. Use the webhooks references to match this to the enum value 
   * when configuring webhook subscriptions using the Admin API.
   */
  SHOPIFY_HEADER_TOPIC = 'X-Shopify-Topic',
  
  /**
   * Verification, when using HTTPS delivery.
   */
  SHOPIFY_HEADER_HMAC_SHA256 = 'X-Shopify-Hmac-Sha256',
  
  /**
   * Identifying the associated store. Especially useful when configuring 
   * webhook subscriptions using the Admin API.
   */
  SHOPIFY_HEADER_SHOP_DOMAIN = 'X-Shopify-Shop-Domain',
  
  /**
   * Identifying unique webhooks.
   */
  SHOPIFY_HEADER_WEBHOOK_ID = 'X-Shopify-Webhook-Id',
  
  /**
   * Identifying the date and time when Shopify triggered the webhook.
   */
  SHOPIFY_HEADER_TRIGGERED_AT = 'X-Shopify-Triggered-At',
  
  /**
   * Identifying the event that occurred.
   */
  SHOPIFY_HEADER_EVENT_ID = 'X-Shopify-Event-Id'
}

