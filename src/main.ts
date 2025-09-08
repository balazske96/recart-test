import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';

async function bootstrap() {
    // Use standard configuration, we'll handle raw body in middleware
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
}

bootstrap();
