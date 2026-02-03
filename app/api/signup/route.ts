import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { generatePassSecret } from "@/lib/crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/signup
 * Create a new stored value pass for a customer
 * 
 * Body: { merchantId, name?, email?, phone? }
 */
export async function POST(req: NextRequest) {
  try {
    const { merchantId, name, email, phone } = await req.json();

    if (!merchantId) {
      return NextResponse.json(
        { error: "merchantId required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify merchant exists
    const { data: merchant, error: merchantError } = await supabase
      .from("merchants")
      .select("id, business_name")
      .eq("id", merchantId)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json(
        { error: "Merchant not found" },
        { status: 404 }
      );
    }

    // Generate secure secret for QR signing
    const secretKey = generatePassSecret();

    // Create the stored value pass
    const { data: pass, error: passError } = await supabase
      .from("stored_value_passes")
      .insert({
        merchant_id: merchantId,
        holder_name: name || null,
        holder_email: email || null,
        holder_phone: phone || null,
        balance_cents: 0,
        secret_key: secretKey,
        is_active: true,
      })
      .select("id, balance_cents, created_at")
      .single();

    if (passError) {
      console.error("Failed to create pass:", passError);
      return NextResponse.json(
        { error: "Failed to create pass" },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return NextResponse.json({
      success: true,
      pass: {
        id: pass.id,
        balance: 0,
        balanceCents: pass.balance_cents,
        merchantName: merchant.business_name,
        createdAt: pass.created_at,
      },
      // URL to view/use the pass
      passUrl: `${baseUrl}/pass/${pass.id}`,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
