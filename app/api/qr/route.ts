import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { generateSignedQR } from "@/lib/crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/qr?passId=xxx
 * Generate a signed, time-limited QR payload for the customer to display
 */
export async function GET(req: NextRequest) {
  const passId = req.nextUrl.searchParams.get("passId");

  if (!passId) {
    return NextResponse.json({ error: "passId required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Get pass and its secret
  const { data: pass, error } = await supabase
    .from("stored_value_passes")
    .select("id, secret_key, balance_cents, is_active, merchant_id")
    .eq("id", passId)
    .single();

  if (error || !pass) {
    return NextResponse.json({ error: "Pass not found" }, { status: 404 });
  }

  if (!pass.is_active) {
    return NextResponse.json({ error: "Pass is inactive" }, { status: 403 });
  }

  // Generate signed QR
  const { payload, expiresAt } = generateSignedQR(passId, pass.secret_key);

  return NextResponse.json({
    payload,
    expiresAt,
    balance: pass.balance_cents / 100, // Return in dollars for display
    balanceCents: pass.balance_cents,
  });
}
