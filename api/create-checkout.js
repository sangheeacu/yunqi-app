// Create Stripe Checkout session
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return res.status(500).json({ error: "Stripe not configured" });

  const { planType, email, userId } = req.body;

  // Stripe Price IDs (create in Stripe dashboard, set as env vars)
  const PRICES = {
    monthly: process.env.STRIPE_PRICE_MONTHLY,
    annual: process.env.STRIPE_PRICE_ANNUAL,
  };

  const priceId = PRICES[planType];
  if (!priceId) return res.status(400).json({ error: "Invalid plan type" });

  try {
    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "payment_method_types[]": "card",
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        mode: "subscription",
        customer_email: email,
        "metadata[user_id]": userId,
        "metadata[plan_type]": planType,
        success_url: `${process.env.SITE_URL || "https://yunqi-app-chi.vercel.app"}?payment=success`,
        cancel_url: `${process.env.SITE_URL || "https://yunqi-app-chi.vercel.app"}?payment=cancelled`,
      }).toString(),
    });

    const session = await resp.json();
    if (!resp.ok) return res.status(400).json({ error: session.error?.message });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
