// This registry maps internal Plan IDs to the Stripe infrastructure.
// Use these constants to ensure type-safe integration across the billing server and client.

export const STRIPE_CONFIG = {
  products: {
    creator: "prod_UTFpMwNHCkbLa9",
    creator_plus: "prod_REPLACE_ME", // Add product ID from Stripe
    creator_pro: "prod_REPLACE_ME",
    executive: "prod_REPLACE_ME",
  },
  features: {
    creator: "feat_61UdhUUuof6ANU85c41EZmsBpdBohWKG",
    creator_plus: "feat_REPLACE_ME", // Add feature ID from Stripe
    creator_pro: "feat_REPLACE_ME",
    executive: "feat_REPLACE_ME",
  },
  prices: {
    creator: "price_1TUJJPEZmsBpdBohCKL9ByvV",
    creator_plus: "price_1TUJMgEZmsBpdBohabs1udnE",
    creator_pro: "price_1TUJO9EZmsBpdBohHK6bYUW5",
    executive: "price_1TUJOaEZmsBpdBoh5Ai1Tcyh",
  }
} as const;

export type PlanKey = keyof typeof STRIPE_CONFIG.products;
