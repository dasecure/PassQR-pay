import crypto from "crypto";

const QR_VALIDITY_SECONDS = 60; // QR valid for ±60 seconds

/**
 * Generate a cryptographically secure pass secret
 */
export function generatePassSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate a signed QR payload for a stored value pass
 * Format: passId:timestamp:signature
 */
export function generateSignedQR(passId: string, secret: string): {
  payload: string;
  expiresAt: number;
} {
  const timestamp = Math.floor(Date.now() / 1000);
  const message = `${passId}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex")
    .slice(0, 16); // Truncate for shorter QR

  return {
    payload: `${passId}:${timestamp}:${signature}`,
    expiresAt: timestamp + 30, // Refresh every 30s
  };
}

/**
 * Verify a signed QR payload
 * Returns passId if valid, null if invalid
 */
export function verifySignedQR(
  payload: string,
  secret: string
): { valid: boolean; passId?: string; error?: string } {
  const parts = payload.split(":");
  if (parts.length !== 3) {
    return { valid: false, error: "Invalid QR format" };
  }

  const [passId, timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) {
    return { valid: false, error: "Invalid timestamp" };
  }

  // Check timestamp is within valid window
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > QR_VALIDITY_SECONDS) {
    return { valid: false, error: "QR code expired" };
  }

  // Verify signature
  const message = `${passId}:${timestamp}`;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex")
    .slice(0, 16);

  if (signature !== expectedSig) {
    return { valid: false, error: "Invalid signature" };
  }

  return { valid: true, passId };
}

/**
 * Generate a secure PIN for POS device pairing
 */
export function generatePairingCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Hash a PIN for storage
 */
export function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin).digest("hex");
}
