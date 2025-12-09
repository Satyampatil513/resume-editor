const { Redis } = require('@upstash/redis');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function test() {
    console.log('Reading resume.zip...');
    const zipPath = path.join(__dirname, 'resume.zip');

    if (!fs.existsSync(zipPath)) {
        console.error('resume.zip not found!');
        return;
    }

    const fileBuffer = fs.readFileSync(zipPath);
    const base64Data = fileBuffer.toString('base64');
    const dataUri = `data:application/zip;base64,${base64Data}`;

    console.log('Pushing real job to queue...');

    await redis.lpush('compile_queue', JSON.stringify({
        id: 'test-job-real-1',
        type: 'compile',
        payload: {
            zipUrl: dataUri
        }
    }));
    console.log('Job pushed!');
}

test().catch(console.error);
