import {Processor, WorkerHost} from '@nestjs/bullmq';
import {Job} from 'bullmq';
import {InjectRepository} from "@nestjs/typeorm";
import {Session} from "../entities/session.entity";
import {Repository} from "typeorm";

interface CurrencyConversionJobData {
    sessionId: number;
    value: number;
    currency: string;
}

@Processor('currency-converter')
export class AudioConsumer extends WorkerHost {
    constructor(
        @InjectRepository(Session) private readonly sessionRepository: Repository<Session>
    ) {
        super();
    }

    async process(job: Job<CurrencyConversionJobData>): Promise<any> {
        const {sessionId, value, currency} = job.data;

        try {
            // Simulate time-consuming conversion
            const valueUSD = await this.convertCurrencyToUSD(value, currency);

            // Update session with USD value
            await this.sessionRepository.update(
                {id: sessionId},
                {valueUSD: valueUSD.toString()}
            );
        } catch (error) {
            throw new Error(`Failed to convert value to USD: ${error.message}`);
        }
    }


    private async convertCurrencyToUSD(value: number, currency: string): Promise<number> {
        // This would be an actual API call to a currency conversion service
        // For now, just simulate a delay and return a dummy conversion
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real implementation, you would call an exchange rate API
        // and perform the actual conversion based on current rates
        if (currency === 'USD'
        )
            return value;

        // Dummy exchange rates (in a real app, these would come from an API)
        const exchangeRates = {
            'EUR': 1.18,
            'GBP': 1.38,
            'CAD': 0.80,
            // Add more currencies as needed
        };

        const rate = exchangeRates[currency] || 1;
        return value * rate;
    }
}