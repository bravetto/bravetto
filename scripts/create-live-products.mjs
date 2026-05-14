// create-live-products.mjs
// run: op run --env-file=.env -- node scripts/create-live-products.mjs
// requires: STRIPE_SECRET_KEY (live mode sk_live_...)
// output: slug, product_id, price_id — paste into api/product-map.js

import Stripe from "stripe";
import { sellable_catalog } from "./sellable-catalog.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function main() {
  const key_prefix = process.env.STRIPE_SECRET_KEY?.slice(0, 8);
  if (!key_prefix?.startsWith("sk_live")) {
    console.error("STRIPE_SECRET_KEY must be a live mode key (sk_live_...)");
    console.error("got prefix:", key_prefix);
    process.exit(1);
  }

  console.log("creating live products...\n");

  const results = [];

  for (const p of sellable_catalog) {
    const params = {
      name: p.name,
      metadata: { slug: p.slug, source: "bravetto-catalog" },
      default_price_data: {
        unit_amount: p.cents,
        currency: "usd",
      },
      expand: ["default_price"],
    };

    if (p.interval) {
      params.default_price_data.recurring = { interval: p.interval };
    }

    const product = await stripe.products.create(params);
    const price_id =
      typeof product.default_price === "object"
        ? product.default_price.id
        : product.default_price;

    results.push({ slug: p.slug, product_id: product.id, price_id });
    console.log(`  ${p.slug}: ${product.id} (${price_id})`);
  }

  console.log("\n// paste into api/product-map.js live section:");
  console.log("const live = {");
  for (const r of results) {
    console.log(`  "${r.slug}": "${r.product_id}",`);
  }
  console.log("};");
}

main().catch((err) => {
  console.error("failed:", err.message);
  process.exit(1);
});
