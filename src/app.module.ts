import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Shop} from "./entities/shop.entity";
import {Session} from "./entities/session.entity";
import {BullModule} from "@nestjs/bullmq";
import {webhookHandlerProviders, webhookHandlers} from "./webhook-handlers";

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                connection: {
                    host: configService.get<string>('REDDIS_HOST', 'localhost'),
                    port: configService.get<number>('REDDIS_PORT', 6379),
                },
            })
        }),
        BullModule.registerQueue({
            name: 'currency-converter',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get<string>('DB_HOST', 'localhost'),
                port: configService.get<number>('DB_PORT', 3306),
                database: configService.get<string>('DB_NAME', 'recart'),
                username: configService.get<string>('DB_USERNAME', 'recart_user'),
                password: configService.get<string>('DB_PASSWORD', 'recart_password'),
                entities: [Shop, Session],
                synchronize: false,
            })
        }),
        TypeOrmModule.forFeature([Shop, Session])],
    controllers: [AppController],
    providers: [AppService, ...webhookHandlers, webhookHandlerProviders],
})
export class AppModule {}
