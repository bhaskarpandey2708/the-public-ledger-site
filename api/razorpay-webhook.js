import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

async function rawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function validSignature(raw, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const left = Buffer.from(expected, "utf8");
  const right = Buffer.from(String(signature), "utf8");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const raw = await rawBody(req);
  if (!validSignature(raw, req.headers["x-razorpay-signature"], process.env.RAZORPAY_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: "invalid_signature" });
  }
  let event;
  try { event = JSON.parse(raw.toString("utf8")); } catch { return res.status(400).json({ error: "invalid_json" }); }
  if (event.event !== "payment_link.paid") return res.status(200).json({ ok: true, ignored: true });

  const entity = event.payload?.payment_link?.entity || event.payload?.payment?.entity || {};
  const notes = entity.notes || {};
  const productId = notes.product_id;
  const providerPaymentId = entity.id || entity.payment_id;
  const buyerEmail = entity.customer?.email || entity.email || entity.notify?.email;
  const amountInr = Number(entity.amount || 0) / 100;
  if (!productId || !providerPaymentId || !buyerEmail) return res.status(422).json({ error: "missing_product_payment_or_email" });

  const serverKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serverKey || !process.env.SUPABASE_URL) return res.status(503).json({ error: "server_not_configured" });
  const supabase = createClient(process.env.SUPABASE_URL, serverKey, { auth: { persistSession: false } });
  const { data: product, error: productError } = await supabase.from("products").select("amount_inr,active").eq("id", productId).maybeSingle();
  if (productError || !product || !product.active || Number(product.amount_inr) !== amountInr) {
    return res.status(422).json({ error: "unknown_or_mismatched_product" });
  }
  const { error } = await supabase.from("orders").upsert({
    provider: "razorpay",
    provider_payment_id: providerPaymentId,
    product_id: productId,
    buyer_email: String(buyerEmail).trim().toLowerCase(),
    amount_inr: amountInr,
    status: "paid"
  }, { onConflict: "provider_payment_id" });
  if (error) return res.status(500).json({ error: "order_record_failed" });
  return res.status(200).json({ ok: true });
}
