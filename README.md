# 10-mail-routing

A Cloudflare Worker for Cloudflare Email Routing that parses incoming emails and forwards them securely to a webhook destination.

## Features

- **Email Parsing:** Uses [`postal-mime`](https://github.com/postalsys/postal-mime) to extract headers, subject, HTML, and plain text content.
- **HMAC Signatures:** Computes an HMAC-SHA256 signature over the payload and timestamp (`X-Webhook-Signature` & `X-Webhook-Timestamp`) for webhook verification.
- **Lightweight & Fast:** Runs on Cloudflare Workers runtime.

## Configuration

Required secrets / environment variables:

| Secret | Description |
| --- | --- |
| `WEBHOOK_URL` | The endpoint URL where parsed emails will be forwarded via HTTP POST |
| `WEBHOOK_SIGNING_SECRET` | Secret key used to sign the payload using HMAC-SHA256 |

### Local Development

1. Install dependencies:
   ```bash
   bun install
   ```

2. Add secrets to `.dev.vars` for local testing:
   ```env
   WEBHOOK_URL=https://your-webhook-endpoint.com/api/emails
   WEBHOOK_SIGNING_SECRET=your_secret_here
   ```

3. Start dev server:
   ```bash
   bun run dev
   ```

### Deployment

Deploy to Cloudflare Workers:

```bash
bun run deploy
```

Set secrets in Cloudflare Workers:

```bash
npx wrangler secret put WEBHOOK_URL
npx wrangler secret put WEBHOOK_SIGNING_SECRET
```
