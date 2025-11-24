import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function main() {
    console.log('Worker started. Listening for jobs...');

    while (true) {
        try {
            // Simulate polling - in a real scenario with Upstash HTTP, we might just fetch periodically
            // or use a stream if supported. For simple queue:
            // We'll assume a list named 'compile_queue'

            // RPOP is simple for now. 
            // Note: Upstash HTTP is stateless, so blocking pop (BRPOP) might have timeouts or not be ideal 
            // depending on the plan. We'll use simple polling with sleep for now.

            const jobData = await redis.rpop('compile_queue');

            if (jobData) {
                console.log('Received job:', jobData);
                // TODO: Process job
            } else {
                // No jobs, wait a bit
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error('Error in worker loop:', error);
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
}

main().catch(console.error);
