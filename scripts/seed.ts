/**
 * Seed script for PassQR Pay POC
 * 
 * Creates a test merchant (coffee shop) and POS device
 * 
 * Run with: npx tsx scripts/seed.ts
 */

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Load env from .env.local
import "dotenv/config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE env vars. Create .env.local first.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log("🌱 Seeding PassQR Pay database...\n");

  // 1. Create test merchant
  console.log("Creating test merchant...");
  const { data: merchant, error: merchantError } = await supabase
    .from("merchants")
    .upsert(
      {
        email: "demo@brewhaus.coffee",
        business_name: "Brew Haus Coffee",
      },
      { onConflict: "email" }
    )
    .select()
    .single();

  if (merchantError) {
    console.error("Failed to create merchant:", merchantError);
    process.exit(1);
  }

  console.log(`✅ Merchant: ${merchant.business_name} (${merchant.id})\n`);

  // 2. Create POS device
  console.log("Creating POS device...");
  const deviceToken = crypto.randomBytes(24).toString("hex");

  const { data: device, error: deviceError } = await supabase
    .from("pos_devices")
    .insert({
      merchant_id: merchant.id,
      device_name: "Counter iPad",
      device_token: deviceToken,
      is_active: true,
    })
    .select()
    .single();

  if (deviceError) {
    // Might already exist, try to fetch
    const { data: existingDevice } = await supabase
      .from("pos_devices")
      .select()
      .eq("merchant_id", merchant.id)
      .single();

    if (existingDevice) {
      console.log(`✅ POS Device exists: ${existingDevice.device_name}`);
      console.log(`   Token: ${existingDevice.device_token}\n`);
    } else {
      console.error("Failed to create POS device:", deviceError);
      process.exit(1);
    }
  } else {
    console.log(`✅ POS Device: ${device.device_name}`);
    console.log(`   Token: ${device.device_token}\n`);
  }

  // 3. Create a test pass (customer)
  console.log("Creating test customer pass...");
  const passSecret = crypto.randomBytes(32).toString("hex");

  const { data: pass, error: passError } = await supabase
    .from("stored_value_passes")
    .insert({
      merchant_id: merchant.id,
      holder_name: "Test Customer",
      holder_email: "customer@example.com",
      balance_cents: 0, // Start with $0
      secret_key: passSecret,
      is_active: true,
    })
    .select()
    .single();

  if (passError) {
    console.error("Failed to create pass:", passError);
    process.exit(1);
  }

  console.log(`✅ Customer Pass: ${pass.id}`);
  console.log(`   Balance: $${(pass.balance_cents / 100).toFixed(2)}\n`);

  // Summary
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Seed complete! Here's what you need:\n");
  console.log(`📍 Merchant ID: ${merchant.id}`);
  console.log(`🏪 Business: ${merchant.business_name}`);
  console.log(`📱 POS Token: ${device?.device_token || "(check above)"}`);
  console.log(`💳 Pass URL: /pass/${pass.id}`);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\nTest the flow:");
  console.log(`1. Open: http://localhost:3000/pass/${pass.id}`);
  console.log("2. Top up with Stripe (use 4242424242424242)");
  console.log("3. Open: http://localhost:3000/pos");
  console.log(`4. Login with token: ${device?.device_token || "(see above)"}`);
  console.log("5. Scan the customer QR to charge");
}

seed().catch(console.error);
