import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {Observable} from 'rxjs';
import * as crypto from 'crypto';
import {ConfigService} from "@nestjs/config";
import {ShopifyHeaders} from '../enums/shopify-headers.enum';

@Injectable()
export class ShopifyWebhookGuard implements CanActivate {
    constructor(private readonly configService: ConfigService) {
    }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const shopifyHmac = request.headers[ShopifyHeaders.SHOPIFY_HEADER_HMAC_SHA256.toLowerCase()] as string;
        
        if (!shopifyHmac) {
            throw new UnauthorizedException(`Missing ${ShopifyHeaders.SHOPIFY_HEADER_HMAC_SHA256} header`);
        }

        // Get the request body, which could be already parsed as JSON
        let byteArray = request.body;
        
        // If we don't have a raw body buffer, convert the parsed body back to a buffer
        if (!Buffer.isBuffer(byteArray)) {
            console.log('Converting request.body to buffer, type:', typeof request.body);
            
            // If body is an object, stringify it back to JSON
            if (typeof request.body === 'object' && request.body !== null) {
                byteArray = Buffer.from(JSON.stringify(request.body));
            } 
            // If it's a string, convert directly to buffer
            else if (typeof request.body === 'string') {
                byteArray = Buffer.from(request.body);
            } 
            // If we still don't have a buffer, throw an error
            else {
                throw new UnauthorizedException('Cannot convert request body to buffer');
            }
        }

        try {
            const webhookSecret = this.configService.get<string>('SHOPIFY_WEBHOOK_SECRET', 'myshopifysecret');

            const calculatedHmacDigest = crypto
                .createHmac('sha256', webhookSecret)
                .update(byteArray)
                .digest('base64');

            const hmacValid = crypto.timingSafeEqual(
                Buffer.from(calculatedHmacDigest),
                Buffer.from(shopifyHmac),
            );

            if (!hmacValid) {
                throw new UnauthorizedException('HMAC validation failed');
            }

            return true;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Error validating Shopify HMAC');
        }
    }
}