import {Injectable, Logger} from '@nestjs/common';
import {CreateCartHandler} from "./create-cart.handler";
import {InjectRepository} from "@nestjs/typeorm";
import {Session} from "../entities/session.entity";
import {Repository} from "typeorm";
import {InjectQueue} from "@nestjs/bullmq";
import {IWebhookHandler} from "../interfaces/webhook-handlers/webhook-handler.interface";

@Injectable()
export class UpdateCartHandler implements IWebhookHandler {
    private readonly logger = new Logger(UpdateCartHandler.name);
    public topic = 'carts/update';

    constructor(
        @InjectRepository(Session)
        private sessionRepository: Repository<Session>,
        @InjectQueue('currency-converter')
        private currencyConverter: any,
    ) {
    }

    async handle(payload: any): Promise<void> {
        const createCartHandler = new CreateCartHandler(
            this.sessionRepository,
            this.currencyConverter,
        );

        await createCartHandler.handle(payload)
    }
}