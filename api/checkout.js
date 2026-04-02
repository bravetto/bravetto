import Stripe from "stripe";

const ALLOWED_ORIGINS = [
  "https://bravetto.com",
  "https://www.bravetto.com",
  "https://aiguardian.ai",
  "https://biasguards.ai",
];

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("access-control-allow-origin", origin);
  }
  res.setHeader("access-control-allow-methods", "POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  const { stripe_product_id, slug, attribution } = req.body || {};
  if (!stripe_product_id || typeof stripe_product_id !== "string") {
    return res.status(400).json({ error: "stripe_product_id required" });
  }
  if (!stripe_product_id.startsWith("prod_")) {
    return res.status(400).json({ error: "invalid stripe_product_id format" });
  }

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

    const session_params = {
      mode: checkout_mode,
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: `${process.env.SITE_URL || "https://bravetto.com"}/products?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL || "https://bravetto.com"}/products`,
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
