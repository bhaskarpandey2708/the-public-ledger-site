export default function handler(_req, res) {
  const serverKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  res.status(200).json({
    ok: true,
    service: "the-public-ledger-commerce",
    publishableKeyConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY),
    authBackendConfigured: Boolean(process.env.SUPABASE_URL && serverKey),
    webhookConfigured: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET && serverKey)
  });
}
