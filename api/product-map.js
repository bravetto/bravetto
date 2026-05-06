// product-map.js — slug to stripe product id, per environment
// test ids created in prior sessions. live ids: run scripts/create-live-products.mjs

import { sellable_catalog_by_slug } from "../scripts/sellable-catalog.mjs";

export const test_product_ids = {
  "voice-starter": "prod_UHZH0KtSTp4YKF",
  "voice-growth": "prod_UHZJP2aZTq0tbE",
  "biasguards-pro": "prod_UCq5BtnjQAmHr3",
  "consciousness-mcp": "prod_UCq5I2XDhjL8Yf",
  "aiguardian-basic": "prod_THHMePuerp6FjH",
  "aiguardian-pro": "prod_THHOADvQALBJJG",
  "advancedring-agent": "prod_TrRJmM2YNKFj3j",
  "advancedring-leader": "prod_TrPxO2boKbnljr",
  "domain-reservation": "prod_U6RpU8NISL5h7h",
};

export const live_product_ids = {
  "voice-starter": "prod_UHf9z4kvcpYTKO",
  "voice-growth": "prod_UHf90Qu1QDJpIu",
  "biasguards-pro": "prod_UHf9xx9crwz5kJ",
  "consciousness-mcp": "prod_UHf9l75S4S1ojP",
  "aiguardian-basic": "prod_UHf9dLrsjWTJ3k",
  "aiguardian-pro": "prod_UHf9LZ1t4QKYwp",
  "advancedring-agent": "prod_UHf9LJIqVfRlto",
  "advancedring-leader": "prod_UHf9AoOTRHjJxc",
  "domain-reservation": "prod_UHf9MfPJ0S5Ler",
};

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required for product map");
}

const is_test = process.env.STRIPE_SECRET_KEY.startsWith("sk_test_");
const product_ids = is_test ? test_product_ids : live_product_ids;

// slug -> stripe product id. absent if slug not in current mode.
export function resolve_product_id(slug) {
  if (!sellable_catalog_by_slug.has(slug)) {
    return {
      absent: true,
      reason: "slug not in canonical sellable catalog",
    };
  }

  const id = product_ids[slug];
  if (!id)
    return {
      absent: true,
      reason: is_test
        ? "slug not in test map"
        : "live products not yet created",
    };
  return { absent: false, id };
}

// stripe product id -> slug (reverse lookup for session-status). absent if not found.
export function resolve_slug(stripe_product_id) {
  for (const [slug, pid] of Object.entries(product_ids)) {
    if (pid === stripe_product_id && sellable_catalog_by_slug.has(slug)) {
      return slug;
    }
  }
  return undefined;
}
