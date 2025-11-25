import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
import { compileProject } from './compiler';

dotenv.config();

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function main() {
    console.log('Worker started. Listening for jobs...');

    while (true) {
        try {
            const jobData = await redis.rpop('compile_queue');

            if (jobData) {
                // Parse job data (handle if it's a string or object)
                const job = typeof jobData === 'string' ? JSON.parse(jobData) : jobData;
                console.log('Received job:', job);

                if (job.type === 'compile' && job.payload?.zipUrl) {
                    try {
                        console.log(`Processing job ${job.id}...`);
                        const pdfPath = await compileProject(job.id, job.payload.zipUrl);
                        console.log(`Job ${job.id} completed. PDF at: ${pdfPath}`);
                        // TODO: Upload PDF to storage and update DB
                    } catch (err) {
                        console.error(`Job ${job.id} failed:`, err);
                    }
                } else {
                    console.log('Invalid job format or type:', job);
                }
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
