"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface DebitResult {
  success: boolean;
  debitedAmount?: number;
  newBalance?: number;
  error?: string;
}

export default function POSPage() {
  const [deviceToken, setDeviceToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [amount, setAmount] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<DebitResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Check for stored device token
  useEffect(() => {
    const stored = localStorage.getItem("pos_device_token");
    if (stored) {
      setDeviceToken(stored);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (deviceToken.trim()) {
      localStorage.setItem("pos_device_token", deviceToken.trim());
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pos_device_token");
    setDeviceToken("");
    setIsAuthenticated(false);
  };

  const startScanning = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Enter a valid amount first");
      return;
    }

    setScanning(true);
    setResult(null);

    // Small delay to let the DOM render
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        false
      );

      scanner.render(
        async (decodedText) => {
          // QR scanned successfully
          scanner.clear();
          setScanning(false);
          await processDebit(decodedText);
        },
        (error) => {
          // Scan error (usually just means no QR found yet)
        }
      );

      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const processDebit = async (qrPayload: string) => {
    setProcessing(true);
    setResult(null);

    try {
      const res = await fetch("/api/pos/debit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrPayload,
          amountCents: Math.round(parseFloat(amount) * 100),
          deviceToken,
          description: `POS Sale`,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult({
          success: true,
          debitedAmount: data.debitedAmount,
          newBalance: data.newBalance,
        });
        // Clear amount for next transaction
        setAmount("");
        // Play success sound
        playSound("success");
      } else {
        setResult({
          success: false,
          error: data.error || "Transaction failed",
        });
        playSound("error");
      }
    } catch (err) {
      setResult({
        success: false,
        error: "Network error",
      });
      playSound("error");
    } finally {
      setProcessing(false);
    }
  };

  const playSound = (type: "success" | "error") => {
    // Simple beep using Web Audio API
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = type === "success" ? 880 : 220;
      gain.gain.value = 0.3;
      oscillator.start();
      setTimeout(() => oscillator.stop(), type === "success" ? 150 : 300);
    } catch (e) {
      // Audio not supported
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            POS Login
          </h1>
          <input
            type="text"
            value={deviceToken}
            onChange={(e) => setDeviceToken(e.target.value)}
            placeholder="Enter device token"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 mb-4 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-500 transition"
          >
            Connect Device
          </button>
          <p className="text-gray-500 text-xs text-center mt-4">
            Contact your administrator for device token
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">PassQR POS</h1>
          <button
            onClick={handleLogout}
            className="text-gray-400 text-sm hover:text-white"
          >
            Logout
          </button>
        </div>

        {/* Result Display */}
        {result && (
          <div
            className={`mb-6 p-6 rounded-2xl text-center ${
              result.success
                ? "bg-green-500/20 border border-green-500/30"
                : "bg-red-500/20 border border-red-500/30"
            }`}
          >
            {result.success ? (
              <>
                <p className="text-green-400 text-5xl mb-2">✓</p>
                <p className="text-2xl font-bold text-green-400">
                  ${result.debitedAmount?.toFixed(2)} Charged
                </p>
                <p className="text-gray-400 mt-2">
                  Remaining balance: ${result.newBalance?.toFixed(2)}
                </p>
              </>
            ) : (
              <>
                <p className="text-red-400 text-5xl mb-2">✕</p>
                <p className="text-xl font-bold text-red-400">{result.error}</p>
              </>
            )}
          </div>
        )}

        {/* Amount Entry */}
        {!scanning && (
          <div className="bg-gray-800 rounded-2xl p-6 mb-6">
            <label className="block text-gray-400 text-sm mb-2">
              Charge Amount
            </label>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl text-gray-500">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl pl-12 pr-4 py-4 text-3xl text-white text-right focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[1, 5, 10, 20].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className="py-2 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 transition"
                >
                  ${amt}
                </button>
              ))}
            </div>

            <button
              onClick={startScanning}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Scan to Charge ${amount || "0.00"}
            </button>
          </div>
        )}

        {/* Scanner */}
        {scanning && (
          <div className="bg-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400">
                Charging: <span className="text-white font-bold">${amount}</span>
              </p>
              <button
                onClick={stopScanning}
                className="text-red-400 hover:text-red-300"
              >
                Cancel
              </button>
            </div>
            <div id="qr-reader" className="rounded-lg overflow-hidden" />
            <p className="text-center text-gray-500 text-sm mt-4">
              Point camera at customer&apos;s QR code
            </p>
          </div>
        )}

        {/* Processing overlay */}
        {processing && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-white text-lg">Processing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
