import {Inject, Injectable, Logger} from '@nestjs/common';
import {WEBHOOK_HANDLERS} from "./webhook-handlers";
import {IWebhookHandler} from "./interfaces/webhook-handlers/webhook-handler.interface";


@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);
    private readonly handlers: Map<string, IWebhookHandler>;

    constructor(
        @Inject(WEBHOOK_HANDLERS) handlers: IWebhookHandler[],
    ) {
        this.handlers = new Map(handlers.map(h => [h.topic, h]));
    }

    async handleWebhook(topic: string, data: any): Promise<void> {
        const handler = this.handlers.get(topic);

        if (!handler) {
            this.logger.warn(`No handler for topic ${topic}`);
            return;
        }

        await handler.handle(data);
    }
}
