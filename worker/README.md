# Compiler Worker

This service is responsible for compiling LaTeX projects into PDFs.

## Setup

1.  **Redis**: You need a Redis instance. We recommend [Upstash](https://upstash.com/).
2.  **Environment Variables**: Create a `.env` file in this directory (`worker/.env`) with the following content:

```bash
# Redis Connection
# If using Upstash Redis (Recommended for serverless/edge)
UPSTASH_REDIS_REST_URL="your_upstash_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"

# If using standard Redis
REDIS_URL="redis://..."
```

## Development

Run `npm install` then `npm run dev`.
