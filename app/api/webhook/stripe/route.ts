import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
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

    // Top up the pass using database function
    const { data: result, error } = await supabase
      .rpc("topup_pass", {
        p_pass_id: passId,
        p_amount_cents: amountCents,
        p_stripe_payment_id: stripePaymentId,
        p_description: `Top-up via Stripe`,
      })
      .single();

    if (error) {
      console.error("Top-up RPC error:", error);
      return NextResponse.json({ error: "Top-up failed" }, { status: 500 });
    }

    if (!result.success) {
      console.error("Top-up failed:", result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    console.log(`[TOPUP] Pass ${passId} topped up by $${amountCents / 100}. New balance: $${result.new_balance / 100}`);
  }

  return NextResponse.json({ received: true });
}
