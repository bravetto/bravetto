import Stripe from "stripe";

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
  res.setHeader("access-control-allow-methods", "POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  const { customer_email } = req.body || {};
  if (!customer_email || typeof customer_email !== "string") {
    return res.status(400).json({ error: "customer_email required" });
  }

  try {
    const customers = await stripe.customers.list({
      email: customer_email,
      limit: 1,
    });

    if (!customers.data.length) {
      return res.status(404).json({ error: "no customer found with that email" });
    }
    if (!process.env.SITE_URL) throw new Error("SITE_URL is required for billing portal");

    const portal_session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${process.env.SITE_URL}/pricing`,
    });

    return res.json({ url: portal_session.url });
  } catch (err) {
    console.error("[portal] error:", err.message);
    return res.status(500).json({ error: "portal session failed" });
  }
}
