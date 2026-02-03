# PassQR Pay

Stored value pass system for small merchants. Gift cards, prepaid cards, and loyalty balances — secured with dynamic QR codes.

## Features

- **Dynamic QR Codes**: Rotate every 30 seconds with HMAC-SHA256 signatures
- **Replay Protection**: Each QR can only be used once
- **Stripe Integration**: Easy top-ups via credit card
- **Simple POS**: Web-based scanner, works on any device
- **Atomic Transactions**: PostgreSQL functions for safe balance operations

## Architecture

```
Customer App (PWA)          Merchant POS
     │                           │
     │ shows dynamic QR          │ scans QR
     │                           │
     └──────────┬────────────────┘
                │
         PassQR Pay Server
                │
      ┌─────────┼─────────┐
      │         │         │
  Supabase   Stripe   Apple/Google
  (balance)  (topup)    (future)
```

## Setup

### 1. Database (Supabase)

Run `supabase/schema.sql` in your Supabase SQL editor.

### 2. Environment Variables

```bash
cp .env.example .env.local
# Fill in your keys
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Deploy to Vercel

```bash
vercel --prod
```

## API Endpoints

### `GET /api/qr?passId=xxx`
Generate signed QR payload for customer display.

### `POST /api/pos/debit`
Validate QR and debit amount.
```json
{
  "qrPayload": "passId:timestamp:signature",
  "amountCents": 500,
  "deviceToken": "xxx"
}
```

### `POST /api/topup`
Create Stripe checkout for top-up.
```json
{
  "passId": "xxx",
  "amountCents": 1000
}
```

### `POST /api/webhook/stripe`
Handle Stripe webhooks for completed payments.

## Security

- QR codes are HMAC-SHA256 signed with per-pass secrets
- 60-second validity window prevents screenshots
- Timestamp tracking prevents replay attacks
- POS devices require authentication tokens

## Future Enhancements

- [ ] Apple Wallet pass integration
- [ ] Google Wallet pass integration
- [ ] Native mobile apps (React Native)
- [ ] Merchant dashboard
- [ ] Transaction history
- [ ] Refunds
