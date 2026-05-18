---
name: managing-subscriptions-and-stripe
description: Use when configuring Stripe products, prices, and environment variables for the ViewTube billing system to ensure correct user entitlements.
---

# Managing Subscriptions and Stripe

## Overview
ViewTube uses a hybrid subscription model with local entitlement logic and a Stripe-powered checkout server. The system supports 5 tiers: `starter` (Free), `creator_plus` (Paid), `pro_intelligence` (Paid), `business_team` (Paid), and `enterprise` (Paid).

## Product and Price Alignment
Prices in Stripe MUST align with the IDs defined in `src/services/subscriptionPlans.ts`.

| Plan ID | Product Name | Required Env Variable |
|---------|--------------|-----------------------|
| `creator_plus` | Creator Plus | `STRIPE_PRICE_CREATOR_PLUS` |
| `pro_intelligence` | Pro Intelligence | `STRIPE_PRICE_PRO_INTELLIGENCE` |
| `business_team` | Business / Team | `STRIPE_PRICE_BUSINESS_TEAM` |
| `enterprise` | Enterprise | `STRIPE_PRICE_ENTERPRISE` |

## When to Use
- Setting up a new development or production Stripe environment.
- Adding or modifying subscription tiers.
- Troubleshooting "Access Denied" or incorrect capability matrix issues.

## Setup Procedure

### 1. Stripe Dashboard Configuration
1. Create a Product for each tier (except `starter`).
2. Add a **Monthly Recurring Price** in USD.
3. Enable **Stripe Tax** (automatic) in account settings.
4. Copy the Price IDs (starts with `price_...`).

### 2. Billing Server Configuration (`server/.env.billing`)
Ensure all Price IDs and secrets are populated:
```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_CREATOR_PLUS=price_...
STRIPE_PRICE_PRO_INTELLIGENCE=price_...
STRIPE_PRICE_BUSINESS_TEAM=price_...
STRIPE_PRICE_ENTERPRISE=price_...
```

### 3. Local Webhook Testing
1. Install Stripe CLI.
2. Run `stripe listen --forward-to localhost:3000/billing/webhook`.
3. Copy the signing secret provided by the CLI to `STRIPE_WEBHOOK_SECRET`.

## Core Logic Checkpoints

- **Capability Matrix**: `src/services/subscriptionPlans.ts` defines what data each tier can access.
- **Entitlement Fetching**: `src/services/billingEntitlement.ts` calls the billing server's `GET /billing/entitlement/:userId` endpoint.
- **Entitlement Gating**: Components should wrap restricted content in the `<EntitlementGate />` component.

## Common Mistakes & Rationalizations

| Excuse / Rationalization | Reality |
|--------------------------|---------|
| "I'll just mock the entitlement in dev." | Mocking hides integration bugs with Stripe webhooks. Test with the real billing server and Stripe CLI. |
| "Price IDs don't matter in the frontend." | They do. The checkout session creation depends on the correct price ID being sent to the server. |
| "I don't need a webhook for simple subs." | You do. `invoice.paid` and `subscription.deleted` events are the only way ViewTube stays in sync with Stripe's state. |

## Red Flags - STOP and Audit
- Hardcoded Price IDs in `src/services/subscriptionPlans.ts`.
- `VITE_BILLING_API_BASE` pointing to production in a local dev build.
- Missing webhook event handlers for `invoice.payment_failed`.

## Verification Checklist
- [ ] Prices match exactly between Stripe Dashboard and `.env.billing`.
- [ ] `POST /billing/checkout-session` returns a valid Stripe URL.
- [ ] Webhook events correctly update local user state (verify via logs).
- [ ] `GET /billing/entitlement/:userId` returns the correct `planId`.
