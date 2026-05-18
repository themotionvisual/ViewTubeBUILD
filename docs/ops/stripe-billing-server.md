# Stripe Billing Server (Launch Runtime)

## Endpoints

- `POST /billing/checkout-session`
- `POST /billing/webhook`
- `GET /billing/entitlement/:userId`

Server path: `viewtubeX/server/billing-server.mjs`

## Launch billing model

- `starter` = free (non-Stripe)
- `creator_plus` = paid monthly (USD)
- `business_team` = paid monthly (USD)
- Paid plans include a **48-hour trial** (Stripe-managed)
- Stripe Tax automatic enabled at checkout

## Required server environment variables

```bash
STRIPE_SECRET_KEY=sk_live_or_test
STRIPE_WEBHOOK_SECRET=whsec_...

STRIPE_PRICE_CREATOR_PLUS=price_...
STRIPE_PRICE_BUSINESS_TEAM=price_...

# Optional compatibility vars (not required for launch)
STRIPE_PRICE_PRO_INTELLIGENCE=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# Runtime
BILLING_PORT=3000
BILLING_ORIGIN=http://localhost:5173
STRIPE_API_BASE=https://api.stripe.com/v1
STRIPE_TRIAL_HOURS=48
```

## Required client environment variable

```bash
VITE_BILLING_API_BASE=http://localhost:3000
```

## Stripe dashboard setup checklist

1. Create product `creator_plus` and monthly USD recurring price.
2. Create product `business_team` and monthly USD recurring price.
3. Copy `price_...` IDs into `STRIPE_PRICE_CREATOR_PLUS` and `STRIPE_PRICE_BUSINESS_TEAM`.
4. Enable Stripe Tax automatic in Stripe account settings.
5. Create webhook endpoint: `POST /billing/webhook`.
6. Subscribe webhook events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`

## Local development

Run server:

```bash
npm run billing:dev
```

Forward webhooks:

```bash
stripe listen --forward-to localhost:3000/billing/webhook
```

Copy the CLI-provided signing secret to `STRIPE_WEBHOOK_SECRET`.

## Quick smoke checks

Create checkout session:

```bash
curl -X POST http://localhost:3000/billing/checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "creator_plus",
    "userId": "local-user",
    "successUrl": "http://localhost:5173/settings?panel=billing",
    "cancelUrl": "http://localhost:5173/settings?panel=billing"
  }'
```

Get entitlement:

```bash
curl http://localhost:3000/billing/entitlement/local-user
```

## Notes

- Webhook events are idempotent and persisted under `.billing/`.
- `invoice.paid` with referral metadata increments referral conversion counters.
- If checkout fails in UI, verify `VITE_BILLING_API_BASE` first (dev fallback is disabled for launch mode).
