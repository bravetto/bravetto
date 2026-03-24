import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  const { stripe_product_id, slug } = req.body;
  if (!stripe_product_id) return res.status(400).json({ error: "stripe_product_id required" });

  try {
    const product = await stripe.products.retrieve(stripe_product_id);
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
      success_url: `${process.env.SITE_URL || "https://bravetto.com"}/products?success=true`,
      cancel_url: `${process.env.SITE_URL || "https://bravetto.com"}/products`,
      metadata: { source: "bravetto-catalog", product: slug || product.name },
    };

    if (checkout_mode === "subscription") {
      session_params.subscription_data = { trial_period_days: 7 };
    }

    const session = await stripe.checkout.sessions.create(session_params);
    return res.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] error:", err.message);
    return res.status(500).json({ error: "checkout failed" });
  }
}
