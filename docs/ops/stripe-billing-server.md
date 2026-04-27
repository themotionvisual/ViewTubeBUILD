# Stripe Billing Server (Local Launch Runtime)

## What this server provides

- `POST /billing/checkout-session`
- `POST /billing/webhook`
- `GET /billing/entitlement/:userId`

Implementation path: `server/billing-server.mjs`

## Required environment variables

```bash
export STRIPE_SECRET_KEY=sk_live_or_test
export STRIPE_WEBHOOK_SECRET=whsec_...

# Plan price IDs
export STRIPE_PRICE_CREATOR_PLUS=price_...
export STRIPE_PRICE_PRO_INTELLIGENCE=price_...
export STRIPE_PRICE_BUSINESS_TEAM=price_...
export STRIPE_PRICE_ENTERPRISE=price_...

# Optional
export BILLING_PORT=3000
export BILLING_ORIGIN=http://localhost:5173
export STRIPE_API_BASE=https://api.stripe.com/v1
```

Client-side env (`.env.local`):

```bash
VITE_BILLING_API_BASE=http://localhost:3000
```

## Run

```bash
npm run billing:dev
```

## Stripe webhook forwarding (local)

```bash
stripe listen --forward-to localhost:3000/billing/webhook
```

Then copy generated webhook secret into `STRIPE_WEBHOOK_SECRET`.

## Quick smoke checks

Checkout session:

```bash
curl -X POST http://localhost:3000/billing/checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "creator_plus",
    "userId": "local-user",
    "successUrl": "http://localhost:5173/performance",
    "cancelUrl": "http://localhost:5173/subscribe"
  }'
```

Get entitlement:

```bash
curl http://localhost:3000/billing/entitlement/local-user
```

## Notes

- Webhook handler verifies Stripe signature and ignores duplicate event IDs.
- Entitlements and idempotency ledger are persisted under `.billing/` in this repo.
- `invoice.paid` with `metadata.referralCode` increments referral conversion and free-month counters.
