import {Body, Controller, Header, Post, Req, UseGuards} from '@nestjs/common';
import {AppService} from './app.service';
import {ShopifyWebhookGuard} from "./guards/shopify-webhook.guard";
import {ShopifyHeaders} from "./enums/shopify-headers.enum";
import {Request} from "express";

@Controller('webhooks')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @UseGuards(ShopifyWebhookGuard)
    @Post()
    handleWebhookCall(@Body() body: object, @Req() request: Request): object {
        // Since we want to respond quickly to Shopify, we handle the webhook asynchronously
        this.appService.handleWebhook(
            request.header(ShopifyHeaders.SHOPIFY_HEADER_TOPIC) ?? '',
            body
        );

        return {
            message: 'ok',
        }
    }
}
