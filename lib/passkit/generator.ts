import crypto from "crypto";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { PassData, PassConfig, DEFAULT_PASS_CONFIG } from "./types";

const CERTS_DIR = path.join(process.cwd(), "certs");
const PASS_TEMPLATE_DIR = path.join(process.cwd(), "pass-template");

interface GeneratePassOptions {
  passData: PassData;
  config?: Partial<PassConfig>;
}

export async function generatePass({ passData, config }: GeneratePassOptions): Promise<Buffer> {
  const passConfig = { ...DEFAULT_PASS_CONFIG, ...config };
  
  // Create temp directory for pass contents
  const tempDir = fs.mkdtempSync("/tmp/pkpass-");
  
  try {
    // 1. Create pass.json
    const passJson = createPassJson(passData, passConfig);
    fs.writeFileSync(path.join(tempDir, "pass.json"), JSON.stringify(passJson, null, 2));
    
    // 2. Copy template images (logo, icon, strip)
    copyTemplateImages(tempDir);
    
    // 3. Create manifest.json (SHA1 hashes of all files)
    const manifest = createManifest(tempDir);
    fs.writeFileSync(path.join(tempDir, "manifest.json"), JSON.stringify(manifest, null, 2));
    
    // 4. Sign the manifest
    signManifest(tempDir);
    
    // 5. Create .pkpass (zip file)
    const pkpassBuffer = createPkpass(tempDir);
    
    return pkpassBuffer;
  } finally {
    // Cleanup temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function createPassJson(passData: PassData, config: PassConfig) {
  return {
    formatVersion: 1,
    passTypeIdentifier: config.passTypeIdentifier,
    teamIdentifier: config.teamIdentifier,
    organizationName: config.organizationName,
    serialNumber: passData.passId,
    description: config.description,
    logoText: config.logoText,
    foregroundColor: config.foregroundColor,
    backgroundColor: config.backgroundColor,
    labelColor: config.labelColor,
    
    // Barcode/QR Code
    barcode: {
      format: "PKBarcodeFormatQR",
      message: passData.qrPayload,
      messageEncoding: "iso-8859-1",
    },
    barcodes: [{
      format: "PKBarcodeFormatQR",
      message: passData.qrPayload,
      messageEncoding: "iso-8859-1",
    }],
    
    // Store card style
    storeCard: {
      headerFields: [
        {
          key: "balance",
          label: "BALANCE",
          value: passData.balance,
          currencyCode: "USD",
        },
      ],
      primaryFields: [
        {
          key: "store",
          label: "STORE",
          value: passData.merchantName,
        },
      ],
      secondaryFields: passData.holderName ? [
        {
          key: "holder",
          label: "CARD HOLDER",
          value: passData.holderName,
        },
      ] : [],
      backFields: [
        {
          key: "terms",
          label: "Terms & Conditions",
          value: "This card is issued by PassQR. Balance is non-refundable. Present QR code to pay.",
        },
        {
          key: "passId",
          label: "Card ID",
          value: passData.passId,
        },
      ],
    },
    
    // Web service for updates
    webServiceURL: process.env.NEXT_PUBLIC_BASE_URL + "/api/passes",
    authenticationToken: generateAuthToken(passData.passId),
    
    // Relevance
    relevantDate: new Date().toISOString(),
  };
}

function generateAuthToken(passId: string): string {
  const secret = process.env.PASS_AUTH_SECRET || "passqr-secret-key";
  return crypto.createHmac("sha256", secret).update(passId).digest("hex");
}

function copyTemplateImages(tempDir: string) {
  const images = ["icon.png", "icon@2x.png", "logo.png", "logo@2x.png", "strip.png", "strip@2x.png"];
  
  for (const img of images) {
    const src = path.join(PASS_TEMPLATE_DIR, img);
    const dest = path.join(tempDir, img);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  }
}

function createManifest(tempDir: string): Record<string, string> {
  const manifest: Record<string, string> = {};
  const files = fs.readdirSync(tempDir);
  
  for (const file of files) {
    if (file === "manifest.json" || file === "signature") continue;
    const filePath = path.join(tempDir, file);
    const content = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha1").update(content).digest("hex");
    manifest[file] = hash;
  }
  
  return manifest;
}

function signManifest(tempDir: string) {
  const manifestPath = path.join(tempDir, "manifest.json");
  const signaturePath = path.join(tempDir, "signature");
  const p12Path = path.join(CERTS_DIR, "pass.p12");
  const p12Password = process.env.PASS_P12_PASSWORD || "";
  
  // Extract cert and key from p12
  const certPath = path.join(tempDir, "cert.pem");
  const keyPath = path.join(tempDir, "key.pem");
  
  execSync(`openssl pkcs12 -in "${p12Path}" -clcerts -nokeys -out "${certPath}" -passin pass:${p12Password}`);
  execSync(`openssl pkcs12 -in "${p12Path}" -nocerts -out "${keyPath}" -passin pass:${p12Password} -passout pass:temp`);
  
  // Download Apple WWDR G4 certificate if not present
  const wwdrPath = path.join(CERTS_DIR, "AppleWWDRCAG4.cer");
  if (!fs.existsSync(wwdrPath)) {
    execSync(`curl -s -o "${wwdrPath}" "https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer"`);
  }
  const wwdrPemPath = path.join(tempDir, "wwdr.pem");
  execSync(`openssl x509 -inform DER -in "${wwdrPath}" -out "${wwdrPemPath}"`);
  
  // Sign with PKCS7
  execSync(
    `openssl smime -binary -sign -certfile "${wwdrPemPath}" -signer "${certPath}" -inkey "${keyPath}" ` +
    `-in "${manifestPath}" -out "${signaturePath}" -outform DER -passin pass:temp`
  );
  
  // Cleanup temp cert files
  fs.unlinkSync(certPath);
  fs.unlinkSync(keyPath);
  fs.unlinkSync(wwdrPemPath);
}

function createPkpass(tempDir: string): Buffer {
  const files = fs.readdirSync(tempDir);
  
  // Use zip command
  const pkpassPath = path.join(tempDir, "pass.pkpass");
  const fileList = files.join(" ");
  execSync(`cd "${tempDir}" && zip -q "${pkpassPath}" ${fileList}`);
  
  return fs.readFileSync(pkpassPath);
}

export function updatePassQrPayload(passId: string, newPayload: string): void {
  // This would trigger an APN push to update the pass
  // Implementation depends on APN setup
  console.log(`[PASS] Queued QR update for pass ${passId}`);
}
