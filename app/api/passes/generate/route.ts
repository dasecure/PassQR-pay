import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { generatePass } from "@/lib/passkit/generator";
import { generateSignedQR } from "@/lib/crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/passes/generate?passId=xxx
 * Generate an Apple Wallet pass for a stored value card
 */
export async function GET(req: NextRequest) {
  try {
    const passId = req.nextUrl.searchParams.get("passId");

    if (!passId) {
      return NextResponse.json({ error: "passId required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get pass details
    const { data: pass, error } = await supabase
      .from("stored_value_passes")
      .select(`
        id,
        balance_cents,
        holder_name,
        secret_key,
        merchant_id,
        merchants (
          id,
          business_name
        )
      `)
      .eq("id", passId)
      .single();

    if (error || !pass) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    // Generate QR payload
    const { payload } = generateSignedQR(passId, pass.secret_key);

    // Generate the .pkpass file
    const pkpassBuffer = await generatePass({
      passData: {
        passId: pass.id,
        balance: pass.balance_cents / 100,
        balanceCents: pass.balance_cents,
        holderName: pass.holder_name || undefined,
        merchantName: (pass.merchants as any)?.business_name || "Store",
        merchantId: pass.merchant_id,
        qrPayload: payload,
      },
    });

    // Return the .pkpass file
    return new NextResponse(pkpassBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="passqr-${passId.slice(0, 8)}.pkpass"`,
      },
    });
  } catch (error: any) {
    console.error("Pass generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate pass" },
      { status: 500 }
    );
  }
}
