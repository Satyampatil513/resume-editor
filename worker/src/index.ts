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
                        console.log(`Processing compile job ${job.id}...`);
                        const pdfPath = await compileProject(job.id, job.payload.zipUrl);
                        console.log(`Job ${job.id} completed. PDF at: ${pdfPath}`);
                        // TODO: Upload PDF to storage and update DB
                    } catch (err) {
                        console.error(`Job ${job.id} failed:`, err);
                    }
                } else if (job.type === 'check_syntax' && job.payload?.content) {
                    try {
                        console.log(`Processing syntax check job ${job.id}...`);
                        const { checkSyntax } = await import('./syntax-checker');
                        const errors = await checkSyntax(job.id, job.payload.content);
                        console.log(`Job ${job.id} completed. Found ${errors.length} issues.`);

                        // Store result in Redis for retrieval
                        // Key: job_result:{jobId}
                        await redis.set(`job_result:${job.id}`, JSON.stringify({
                            status: 'completed',
                            result: errors
                        }), { ex: 300 }); // Expire in 5 minutes

                    } catch (err) {
                        console.error(`Job ${job.id} failed:`, err);
                        await redis.set(`job_result:${job.id}`, JSON.stringify({
                            status: 'failed',
                            error: err instanceof Error ? err.message : 'Unknown error'
                        }), { ex: 300 });
                    }
                } else if (job.type === 'compile_content' && job.payload?.content) {
                    try {
                        console.log(`Processing compile content job ${job.id}...`);
                        const { compileLatexContent } = await import('./compiler');
                        const pdfBase64 = await compileLatexContent(job.id, job.payload.content);
                        console.log(`Job ${job.id} completed. PDF generated.`);

                        await redis.set(`job_result:${job.id}`, JSON.stringify({
                            status: 'completed',
                            result: pdfBase64
                        }), { ex: 300 });

                    } catch (err) {
                        console.error(`Job ${job.id} failed:`, err);
                        await redis.set(`job_result:${job.id}`, JSON.stringify({
                            status: 'failed',
                            error: err instanceof Error ? err.message : 'Unknown error'
                        }), { ex: 300 });
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
