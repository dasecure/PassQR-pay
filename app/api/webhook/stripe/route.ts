import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Check if this is a PassQR top-up
    if (session.metadata?.type !== "passqr_topup") {
      return NextResponse.json({ received: true });
    }

    const passId = session.metadata.passId;
    const amountCents = parseInt(session.metadata.amountCents, 10);
    const stripePaymentId = session.payment_intent as string;

    if (!passId || !amountCents) {
      console.error("Missing metadata in session:", session.id);
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get current balance
    const { data: pass, error: fetchError } = await supabase
      .from("stored_value_passes")
      .select("balance_cents")
      .eq("id", passId)
      .single();

    if (fetchError || !pass) {
      console.error("Pass not found:", passId);
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    // Update balance
    const newBalance = pass.balance_cents + amountCents;
    const { error: updateError } = await supabase
      .from("stored_value_passes")
      .update({ balance_cents: newBalance })
      .eq("id", passId);

    if (updateError) {
      console.error("Failed to update balance:", updateError);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    // Log the transaction (fire and forget)
    const { error: txError } = await supabase.from("transactions").insert({
      pass_id: passId,
      type: "topup",
      amount_cents: amountCents,
      balance_after_cents: newBalance,
      stripe_payment_id: stripePaymentId,
      description: "Top-up via Stripe",
    });
    if (txError) console.error("Transaction log failed:", txError);

    console.log(`[TOPUP] Pass ${passId} topped up by $${amountCents / 100}. New balance: $${newBalance / 100}`);
  }

  return NextResponse.json({ received: true });
}
