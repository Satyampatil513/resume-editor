const { Redis } = require('@upstash/redis');
const dotenv = require('dotenv');

dotenv.config();

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function test() {
    console.log('Pushing test job to queue...');

    // Using a known public zip file (GitHub Actions Starter Workflows)
    await redis.lpush('compile_queue', JSON.stringify({
        id: 'test-job-3',
        type: 'compile',
        payload: {
            zipUrl: 'https://github.com/actions/starter-workflows/archive/refs/heads/main.zip'
        }
    }));
    console.log('Job pushed!');
}

test().catch(console.error);
