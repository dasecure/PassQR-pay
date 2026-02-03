import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

/**
 * POST /api/topup
 * Create a Stripe checkout session for topping up a pass
 * 
 * Body: { passId, amountCents }
 */
export async function POST(req: NextRequest) {
  try {
    const { passId, amountCents } = await req.json();

    if (!passId || !amountCents) {
      return NextResponse.json(
        { error: "passId and amountCents required" },
        { status: 400 }
      );
    }

    if (amountCents < 100) { // Minimum $1
      return NextResponse.json(
        { error: "Minimum top-up is $1.00" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify pass exists and is active
    const { data: pass, error } = await supabase
      .from("stored_value_passes")
      .select("id, is_active, holder_name, holder_email, merchant_id")
      .eq("id", passId)
      .single();

    if (error || !pass) {
      return NextResponse.json(
        { error: "Pass not found" },
        { status: 404 }
      );
    }

    if (!pass.is_active) {
      return NextResponse.json(
        { error: "Pass is inactive" },
        { status: 403 }
      );
    }

    // Get merchant info for Stripe Connect (if applicable)
    const { data: merchant } = await supabase
      .from("merchants")
      .select("business_name, stripe_account_id")
      .eq("id", pass.merchant_id)
      .single();

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pay.passqr.com";
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Top-up: ${merchant?.business_name || "Store Card"}`,
              description: `Add $${(amountCents / 100).toFixed(2)} to your balance`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/pass/${passId}?topup=success`,
      cancel_url: `${baseUrl}/pass/${passId}?topup=cancelled`,
      metadata: {
        passId,
        amountCents: amountCents.toString(),
        type: "passqr_topup",
      },
    };

    // If merchant has Stripe Connect, route payment to them
    if (merchant?.stripe_account_id) {
      sessionParams.payment_intent_data = {
        application_fee_amount: Math.round(amountCents * 0.029 + 30), // 2.9% + $0.30
        transfer_data: {
          destination: merchant.stripe_account_id,
        },
      };
    }

    const session = await getStripe().checkout.sessions.create(sessionParams);

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Top-up error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
