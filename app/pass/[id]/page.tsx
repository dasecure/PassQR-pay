"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import QRCode from "qrcode";

interface PassData {
  balance: number;
  balanceCents: number;
  payload: string;
  expiresAt: number;
}

export default function PassPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const passId = params.id as string;

  const [passData, setPassData] = useState<PassData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);

  // Check for topup result
  const topupResult = searchParams.get("topup");

  const fetchQR = useCallback(async () => {
    try {
      const res = await fetch(`/api/qr?passId=${passId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load pass");
        return;
      }

      setPassData(data);

      // Generate QR code image
      const qrUrl = await QRCode.toDataURL(data.payload, {
        width: 280,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      setQrDataUrl(qrUrl);
      setCountdown(30);
      setError("");
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [passId]);

  // Initial load and refresh every 30 seconds
  useEffect(() => {
    fetchQR();
    const interval = setInterval(fetchQR, 30000);
    return () => clearInterval(interval);
  }, [fetchQR]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount < 1) {
      alert("Minimum top-up is $1.00");
      return;
    }

    setTopupLoading(true);
    try {
      const res = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passId,
          amountCents: Math.round(amount * 100),
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Failed to start checkout");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setTopupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={fetchQR}
            className="px-4 py-2 bg-white text-black rounded-lg font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Success message */}
        {topupResult === "success" && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-center">
            <p className="text-green-400 font-medium">✓ Top-up successful!</p>
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 mb-6 shadow-xl">
          <p className="text-white/70 text-sm mb-1">Available Balance</p>
          <p className="text-4xl font-bold">
            ${passData?.balance.toFixed(2)}
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="flex justify-center mb-4">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="Payment QR" className="w-64 h-64" />
            )}
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Show this QR to pay • Refreshes in{" "}
              <span className="font-mono font-bold text-purple-600">
                {countdown}s
              </span>
            </p>
          </div>
        </div>

        {/* Top-up Section */}
        <div className="bg-gray-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Add Funds</h3>
          <div className="flex gap-2 mb-4">
            {[5, 10, 25, 50].map((amt) => (
              <button
                key={amt}
                onClick={() => setTopupAmount(amt.toString())}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  topupAmount === amt.toString()
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                $
              </span>
              <input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="Other amount"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={handleTopup}
              disabled={topupLoading || !topupAmount}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-500 transition disabled:opacity-50"
            >
              {topupLoading ? "..." : "Top Up"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8">
          Powered by PassQR Pay
        </p>
      </div>
    </div>
  );
}
