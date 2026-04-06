import Stripe from "stripe";

const ALLOWED_ORIGINS = [
  "https://bravetto.com",
  "https://www.bravetto.com",
];

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// product slug mapping — stripe product id to welcome page checklist key
const product_slugs = {
  "prod_UHZH0KtSTp4YKF": "voice-starter",
  "prod_UHZJP2aZTq0tbE": "voice-growth",
  "prod_UCq5BtnjQAmHr3": "biasguards-pro",
  "prod_UCq5I2XDhjL8Yf": "consciousness-mcp",
  "prod_THHMePuerp6FjH": "aiguardian-basic",
  "prod_THHOADvQALBJJG": "aiguardian-pro",
  "prod_U6RpU8NISL5h7h": "domain-reservation",
  "prod_TrRJmM2YNKFj3j": "advancedring-agent",
  "prod_TrPxO2boKbnljr": "advancedring-leader",
};

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("access-control-allow-origin", origin);
  }
  res.setHeader("access-control-allow-methods", "GET, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "method not allowed" });

  const session_id = req.query.session_id;
  if (!session_id || typeof session_id !== "string") {
    return res.status(400).json({ error: "session_id required" });
  }
  if (!session_id.startsWith("cs_")) {
    return res.status(400).json({ error: "invalid session_id format" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items.data.price.product"],
    });

    const customer_name = session.customer_details?.name || null;
    const item = session.line_items?.data?.[0];
    const product = item?.price?.product;
    const plan_name = typeof product === "object" ? product.name : null;
    const stripe_product_id = typeof product === "object" ? product.id : typeof product === "string" ? product : null;
    const product_slug = stripe_product_id ? (product_slugs[stripe_product_id] || session.metadata?.product || null) : null;

    return res.json({
      customer_name: customer_name,
      plan_name: plan_name,
      amount: session.amount_total || 0,
      product_slug: product_slug,
      status: session.payment_status,
    });
  } catch (err) {
    console.error("[session-status] error:", err.message);
    return res.status(400).json({ error: "session not found" });
  }
}
