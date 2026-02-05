import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/pass/lookup?merchantId=xxx&email=yyy
 * Find a customer's pass by merchant and email
 * Used by App Clip for instant pass access
 */
export async function GET(req: NextRequest) {
  try {
    const merchantId = req.nextUrl.searchParams.get("merchantId");
    const email = req.nextUrl.searchParams.get("email");

    if (!merchantId || !email) {
      return NextResponse.json(
        { error: "merchantId and email required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Find pass by merchant and email
    const { data: pass, error } = await supabase
      .from("stored_value_passes")
      .select(`
        id,
        balance_cents,
        holder_name,
        holder_email,
        merchant_id,
        created_at,
        is_active,
        merchant:merchants(business_name)
      `)
      .eq("merchant_id", merchantId)
      .eq("holder_email", email.toLowerCase())
      .eq("is_active", true)
      .single();

    if (error || !pass) {
      // Return 404 so App Clip knows to show signup flow
      return NextResponse.json(
        { error: "Pass not found", pass: null },
        { status: 404 }
      );
    }

    const merchant = pass.merchant as unknown as { business_name: string } | null;

    return NextResponse.json({
      pass: {
        id: pass.id,
        balanceCents: pass.balance_cents,
        holderName: pass.holder_name,
        holderEmail: pass.holder_email,
        merchantId: pass.merchant_id,
        merchantName: merchant?.business_name || "Unknown",
        createdAt: pass.created_at,
      },
    });
  } catch (error) {
    console.error("Pass lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
