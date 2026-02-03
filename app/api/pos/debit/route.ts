import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { verifySignedQR } from "@/lib/crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/pos/debit
 * Validate QR and debit amount from stored value pass
 * 
 * Body: { qrPayload, amountCents, deviceToken }
 */
export async function POST(req: NextRequest) {
  try {
    const { qrPayload, amountCents, deviceToken, description } = await req.json();

    if (!qrPayload || !amountCents || !deviceToken) {
      return NextResponse.json(
        { error: "qrPayload, amountCents, and deviceToken required" },
        { status: 400 }
      );
    }

    if (amountCents <= 0) {
      return NextResponse.json(
        { error: "Amount must be positive" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify POS device token
    const { data: device, error: deviceError } = await supabase
      .from("pos_devices")
      .select("id, merchant_id, is_active")
      .eq("device_token", deviceToken)
      .single();

    if (deviceError || !device) {
      return NextResponse.json(
        { error: "Invalid device token" },
        { status: 401 }
      );
    }

    if (!device.is_active) {
      return NextResponse.json(
        { error: "Device is deactivated" },
        { status: 403 }
      );
    }

    // Parse QR payload to get passId
    const parts = qrPayload.split(":");
    if (parts.length !== 3) {
      return NextResponse.json(
        { error: "Invalid QR format" },
        { status: 400 }
      );
    }
    const passId = parts[0];

    // Get pass details including secret
    const { data: pass, error: passError } = await supabase
      .from("stored_value_passes")
      .select("id, secret_key, balance_cents, is_active, merchant_id, last_qr_timestamp")
      .eq("id", passId)
      .single();

    if (passError || !pass) {
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

    // Verify pass belongs to this merchant
    if (pass.merchant_id !== device.merchant_id) {
      return NextResponse.json(
        { error: "Pass does not belong to this merchant" },
        { status: 403 }
      );
    }

    // Verify QR signature and timestamp
    const verification = verifySignedQR(qrPayload, pass.secret_key);
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || "Invalid QR code" },
        { status: 400 }
      );
    }

    // Replay protection: check timestamp hasn't been used
    const qrTimestamp = parseInt(parts[1], 10);
    if (qrTimestamp <= pass.last_qr_timestamp) {
      return NextResponse.json(
        { error: "QR code already used" },
        { status: 400 }
      );
    }

    // Perform atomic debit using database function
    const { data, error: debitError } = await supabase
      .rpc("debit_pass", {
        p_pass_id: passId,
        p_amount_cents: amountCents,
        p_pos_device_id: device.id,
        p_description: description || null,
      })
      .single();

    if (debitError) {
      console.error("Debit RPC error:", debitError);
      return NextResponse.json(
        { error: "Transaction failed" },
        { status: 500 }
      );
    }

    const result = data as { success: boolean; new_balance: number; error: string | null };

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Update last used timestamp for replay protection
    await supabase
      .from("stored_value_passes")
      .update({ last_qr_timestamp: qrTimestamp })
      .eq("id", passId);

    // Update device last used
    await supabase
      .from("pos_devices")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", device.id);

    return NextResponse.json({
      success: true,
      debitedAmount: amountCents / 100,
      debitedCents: amountCents,
      newBalance: result.new_balance / 100,
      newBalanceCents: result.new_balance,
    });
  } catch (error: any) {
    console.error("POS debit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
