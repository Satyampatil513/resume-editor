import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { randomUUID } from 'crypto';

// Initialize Redis
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

console.log('Redis Config:', {
    url: process.env.UPSTASH_REDIS_REST_URL ? 'Set' : 'Missing',
    token: process.env.UPSTASH_REDIS_REST_TOKEN ? 'Set' : 'Missing'
});

export async function POST(req: NextRequest) {
    try {
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const jobId = randomUUID();

        // Push job to Redis queue
        await redis.lpush('compile_queue', JSON.stringify({
            id: jobId,
            type: 'check_syntax',
            payload: { content }
        }));

        // Poll for result (simple polling for now, could be improved with SSE or WebSockets)
        let attempts = 0;
        const maxAttempts = 20; // 10 seconds total (500ms * 20)

        while (attempts < maxAttempts) {
            const result = await redis.get(`job_result:${jobId}`);

            if (result) {
                // Clean up result
                await redis.del(`job_result:${jobId}`);

                const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;

                if (parsedResult.status === 'failed') {
                    return NextResponse.json({ error: parsedResult.error }, { status: 500 });
                }

                return NextResponse.json({ errors: parsedResult.result });
            }

            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }

        return NextResponse.json({ error: 'Timeout waiting for syntax check' }, { status: 504 });

    } catch (error) {
        console.error('Error in syntax check API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
