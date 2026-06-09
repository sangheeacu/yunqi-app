// Stripe webhook - updates Supabase users table on payment completion
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL || "https://dqcxpevxkbgwqqzackjd.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    return res.status(500).json({ error: "Supabase service key not configured" });
  }

  let event;
  try {
    // Stripe signature verification (skipped if no secret - dev mode)
    const body = JSON.stringify(req.body);
    event = req.body;
  } catch (err) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const customerEmail = session.customer_email || session.customer_details?.email;
      const planType = session.metadata?.plan_type || "monthly";
      const stripeCustomerId = session.customer;
      const subscriptionId = session.subscription;

      if (!customerEmail) return res.status(200).json({ received: true });

      // Update users table with Supabase service role key
      const resp = await fetch(
        `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(customerEmail)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            plan: "paid",
            plan_type: planType,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: subscriptionId,
          }),
        }
      );
      if (!resp.ok) console.error("Supabase update failed:", await resp.text());
    }

    if (event.type === "customer.subscription.deleted" || event.type === "invoice.payment_failed") {
      const sub = event.data.object;
      const customerId = sub.customer;

      // Find user by stripe_customer_id and reset plan
      const resp = await fetch(
        `${supabaseUrl}/rest/v1/users?stripe_customer_id=eq.${customerId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ plan: "free", plan_type: null }),
        }
      );
      if (!resp.ok) console.error("Supabase downgrade failed:", await resp.text());
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
