import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            <span className="text-purple-400">PassQR</span> Pay
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Stored value passes for small merchants. Gift cards, prepaid cards,
            and loyalty balances — secured with dynamic QR codes.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-lg font-semibold mb-2">Cryptographically Signed</h3>
            <p className="text-gray-400 text-sm">
              Dynamic QR codes rotate every 30 seconds with HMAC signatures.
              Screenshots won&apos;t work.
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-lg font-semibold mb-2">Easy Top-ups</h3>
            <p className="text-gray-400 text-sm">
              Customers add funds via Stripe. Instant balance updates.
              No cash handling.
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Simple POS</h3>
            <p className="text-gray-400 text-sm">
              Scan customer QR, enter amount, done. Works on any phone or tablet.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <Link
            href="/pos"
            className="inline-block px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-500 transition"
          >
            Open POS Scanner
          </Link>
          <p className="text-gray-500 text-sm">
            Merchant? Contact us to set up your account.
          </p>
        </div>
      </div>
    </div>
  );
}
