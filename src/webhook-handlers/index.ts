import {UpdateCartHandler} from "./update-cart.handler";
import {CreateCartHandler} from "./create-cart.handler";

export const WEBHOOK_HANDLERS = Symbol('WEBHOOK_HANDLERS');

export const webhookHandlers = [UpdateCartHandler, CreateCartHandler]

export const webhookHandlerProviders = {
    provide: WEBHOOK_HANDLERS,
    useFactory: (...handlers: any[]) => handlers,
    inject: webhookHandlers
}