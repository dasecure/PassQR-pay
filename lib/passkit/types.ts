// Apple Wallet Pass Types

export interface PassData {
  passId: string;
  balance: number;
  balanceCents: number;
  holderName?: string;
  merchantName: string;
  merchantId: string;
  qrPayload: string;
}

export interface PassConfig {
  passTypeIdentifier: string;
  teamIdentifier: string;
  organizationName: string;
  description: string;
  logoText: string;
  foregroundColor: string;
  backgroundColor: string;
  labelColor: string;
}

export const DEFAULT_PASS_CONFIG: PassConfig = {
  passTypeIdentifier: "pass.com.passqr.card",
  teamIdentifier: "685L2Q2WD9",
  organizationName: "PassQR",
  description: "PassQR Pay Card",
  logoText: "PassQR",
  foregroundColor: "rgb(255, 255, 255)",
  backgroundColor: "rgb(147, 51, 234)", // Purple
  labelColor: "rgb(255, 255, 255)",
};
