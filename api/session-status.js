import Stripe from "stripe";
import { resolve_slug } from "./product-map.js";

const ALLOWED_ORIGINS = [
  "https://bravetto.com",
  "https://www.bravetto.com",
];

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    const product_slug = stripe_product_id ? (resolve_slug(stripe_product_id) || session.metadata?.product || undefined) : undefined;

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
