import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Session} from '../entities/session.entity';
import {InjectQueue} from "@nestjs/bullmq";
import {IWebhookHandler} from "../interfaces/webhook-handlers/webhook-handler.interface";

@Injectable()
export class CreateCartHandler implements IWebhookHandler {
    private readonly logger: Logger = new Logger(CreateCartHandler.name);
    public topic = 'carts/create';

    constructor(
        @InjectRepository(Session)
        private sessionRepository: Repository<Session>,
        @InjectQueue('currency-converter')
        private currencyConverter: any,
    ) {}

    async handle(payload: any): Promise<void> {
        const cart = payload as Cart;

        // Find the session by Shopify cart ID
        const session = await this.sessionRepository.findOne({
            where: {shopifyCartId: cart.id},
            relations: ['shop'],
        });

        if (!session) {
            this.logger.warn(`Session not found for cart ID: ${cart.id}`);
            return;
        }

        // Check if the incoming webhook data is newer than what we have
        const webhookUpdatedAt = new Date(cart.updated_at);
        if (session.cartUpdatedAt && session.cartUpdatedAt >= webhookUpdatedAt) {
            this.logger.warn(`Received outdated cart data for cart ID: ${cart.id}`);
            return;
        }

        // Calculate the total cart value
        const cartValue = this.calculateCartValue(cart.line_items);
        const itemCount = this.calculateItemCount(cart.line_items);

        // Update session with cart data
        session.cartData = cart;
        session.value = cartValue.toString();
        session.itemCount = itemCount;
        session.cartUpdatedAt = webhookUpdatedAt;

        // Get currency from the shop
        const currency = session.shop.currency;

        // Save the session immediately with the current data
        await this.sessionRepository.save(session);

        // Convert value to USD asynchronously
        this.currencyConverter.add('convert', {
            sessionId: session.id,
            value: cartValue,
            currency: currency
        });
    }

    private calculateCartValue(items: LineItem[]): number {
        return items.reduce((total, item) => {
            return total + (Number(item.price) * item.quantity);
        }, 0);
    }

    private calculateItemCount(items: LineItem[]): number {
        return items.reduce((count, item) => count + item.quantity, 0);
    }
}