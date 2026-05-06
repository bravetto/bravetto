import Stripe from "stripe";
import { resolve_product_id } from "./product-map.js";

const ALLOWED_ORIGINS = [
  "https://bravetto.com",
  "https://www.bravetto.com",
  "https://aiguardian.ai",
  "https://biasguards.ai",
];

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const AIGUARDIAN_SLUGS = new Set([
  "aiguardian-basic",
  "aiguardian-pro",
  "consciousness-mcp",
]);

function success_url_for(slug) {
  if (AIGUARDIAN_SLUGS.has(slug)) {
    return "https://mcp.aiguardian.ai/keys";
  }
  return `${process.env.SITE_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`;
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("access-control-allow-origin", origin);
  }
  res.setHeader("access-control-allow-methods", "POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  const { slug, attribution } = req.body || {};
  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "slug required" });
  }

  const resolved = resolve_product_id(slug);
  if (resolved.absent) {
    return res.status(400).json({ error: resolved.reason });
  }
  const stripe_product_id = resolved.id;

  // attribution data from client — embedded in session metadata for webhook retrieval
  const attr = attribution && typeof attribution === "object" ? attribution : {};

  try {
    const product = await stripe.products.retrieve(stripe_product_id);
    if (!product.active) {
      return res.status(400).json({ error: "product is not active" });
    }
    if (!product.default_price) {
      return res.status(400).json({ error: "product has no default price" });
    }

    const price_id = typeof product.default_price === "string"
      ? product.default_price
      : product.default_price.id;

    const price = await stripe.prices.retrieve(price_id);
    const checkout_mode = price.type === "recurring" ? "subscription" : "payment";
    if (!process.env.SITE_URL) throw new Error("SITE_URL is required for checkout");

    const session_params = {
      mode: checkout_mode,
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: success_url_for(slug),
      cancel_url: `${process.env.SITE_URL}/pricing`,
      metadata: {
        source: "bravetto-catalog",
        product: slug || product.name,
        fbclid: String(attr.fbclid || ""),
        gclid: String(attr.gclid || ""),
        utm_source: String(attr.utm_source || ""),
        utm_medium: String(attr.utm_medium || ""),
        utm_campaign: String(attr.utm_campaign || ""),
        fbp: String(attr.fbp || ""),
        fbc: String(attr.fbc || ""),
        user_agent: String(attr.user_agent || "").slice(0, 500),
      },
    };

    if (checkout_mode === "subscription") {
      session_params.subscription_data = { trial_period_days: 7 };
    }

    const session = await stripe.checkout.sessions.create(session_params);
    return res.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] error:", err.message);
    const status = err.statusCode || 500;
    const message = err.type === "StripeInvalidRequestError"
      ? "product not found"
      : "checkout failed";
    return res.status(status).json({ error: message });
  }
}
