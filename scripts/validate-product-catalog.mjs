import Stripe from "stripe";

import { live_product_ids, test_product_ids } from "../api/product-map.js";
import {
  sellable_catalog,
  sellable_catalog_by_slug,
} from "./sellable-catalog.mjs";

function normalize_keys(record) {
  return Object.keys(record).sort();
}

function diff_keys(expected, actual) {
  const expected_set = new Set(expected);
  const actual_set = new Set(actual);
  return {
    missing: expected.filter((key) => !actual_set.has(key)),
    extra: actual.filter((key) => !expected_set.has(key)),
  };
}

async function validate_stripe(mode, ids) {
  if (
    !("STRIPE_SECRET_KEY" in process.env) ||
    process.env.STRIPE_SECRET_KEY === ""
  ) {
    return { skipped: "STRIPE_SECRET_KEY missing" };
  }

  const wants_test = process.env.STRIPE_SECRET_KEY.startsWith("sk_test_");
  if ((mode === "test") !== wants_test) {
    return { skipped: `key mode does not match ${mode} map` };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const issues = [];

  for (const [slug, product_id] of Object.entries(ids)) {
    try {
      const product = await stripe.products.retrieve(product_id);
      const expected = sellable_catalog_by_slug.get(slug);
      if (!expected) {
        issues.push(`${mode}: ${slug} not in sellable catalog`);
        continue;
      }
      if (!product.active)
        issues.push(`${mode}: ${slug} -> ${product_id} inactive in Stripe`);
      if ((product.metadata?.slug || "") !== slug) {
        issues.push(
          `${mode}: ${slug} -> ${product_id} metadata.slug mismatch (${product.metadata?.slug || ""})`,
        );
      }
      if (product.name !== expected.name) {
        issues.push(
          `${mode}: ${slug} -> ${product_id} name mismatch (${product.name})`,
        );
      }
    } catch (error) {
      issues.push(
        `${mode}: ${slug} -> ${product_id} Stripe lookup failed (${error.message})`,
      );
    }
  }

  return { issues };
}

async function validate_supabase() {
  if (
    !("SUPABASE_URL" in process.env) ||
    !("SUPABASE_SERVICE_ROLE_KEY" in process.env)
  ) {
    return { skipped: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing" };
  }

  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/products?select=slug,stripe_product_id&order=slug.asc`,
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  );

  if (!response.ok) {
    return { issues: [`supabase query failed (${response.status})`] };
  }

  const rows = await response.json();
  const issues = [];
  const known_ids = new Set([
    ...Object.values(test_product_ids),
    ...Object.values(live_product_ids),
  ]);

  for (const product of sellable_catalog) {
    const row = rows.find((candidate) => candidate.slug === product.slug);
    if (!row) {
      issues.push(`supabase: missing row for ${product.slug}`);
      continue;
    }
    if (row.stripe_product_id && !known_ids.has(row.stripe_product_id)) {
      issues.push(
        `supabase: ${product.slug} has unknown stripe_product_id ${row.stripe_product_id}`,
      );
    }
  }

  return { issues };
}

async function main() {
  const catalog_slugs = sellable_catalog.map((product) => product.slug).sort();
  const test_slugs = normalize_keys(test_product_ids);
  const live_slugs = normalize_keys(live_product_ids);
  const errors = [];

  const test_diff = diff_keys(catalog_slugs, test_slugs);
  const live_diff = diff_keys(catalog_slugs, live_slugs);

  if (test_diff.missing.length || test_diff.extra.length) {
    errors.push(
      `test map drift: missing=[${test_diff.missing.join(", ")}] extra=[${test_diff.extra.join(", ")}]`,
    );
  }
  if (live_diff.missing.length || live_diff.extra.length) {
    errors.push(
      `live map drift: missing=[${live_diff.missing.join(", ")}] extra=[${live_diff.extra.join(", ")}]`,
    );
  }

  for (const product of sellable_catalog) {
    if (product.interval !== null && product.interval !== "month") {
      errors.push(`${product.slug}: unsupported interval ${product.interval}`);
    }
  }

  const [test_remote, live_remote, supabase] = await Promise.all([
    validate_stripe("test", test_product_ids),
    validate_stripe("live", live_product_ids),
    validate_supabase(),
  ]);

  for (const result of [test_remote, live_remote, supabase]) {
    if (result.issues) errors.push(...result.issues);
  }

  console.log("catalog slugs:", catalog_slugs.join(", "));
  if (test_remote.skipped) console.log("stripe test:", test_remote.skipped);
  if (live_remote.skipped) console.log("stripe live:", live_remote.skipped);
  if (supabase.skipped) console.log("supabase:", supabase.skipped);

  if (errors.length) {
    console.error("catalog reconciliation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log("catalog reconciliation passed");
}

main().catch((error) => {
  console.error("catalog reconciliation failed:", error.message);
  process.exit(1);
});
