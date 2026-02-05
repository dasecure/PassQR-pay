import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/merchant/:id
 * Get merchant info for App Clip display
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = createAdminClient();

    const { data: merchant, error } = await supabase
      .from("merchants")
      .select("id, business_name, logo_url")
      .eq("id", id)
      .single();

    if (error || !merchant) {
      return NextResponse.json(
        { error: "Merchant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      merchant: {
        id: merchant.id,
        name: merchant.business_name,
        logoUrl: merchant.logo_url,
      },
    });
  } catch (error) {
    console.error("Get merchant error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
