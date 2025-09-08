export interface IWebhookHandler {
    topic: string; // e.g. 'carts/create'
    handle(payload: any): Promise<void>;
}