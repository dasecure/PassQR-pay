"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  QrCode, 
  CreditCard, 
  Smartphone, 
  Shield, 
  Zap, 
  Store,
  Users,
  TrendingUp,
  Check,
  ArrowRight,
  Wallet,
  RefreshCw
} from "lucide-react";

export default function Home() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">PassQR <span className="text-purple-400">Pay</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pos" className="text-gray-400 hover:text-white transition hidden sm:block">
              POS
            </Link>
            <Link href="/signup" className="text-gray-400 hover:text-white transition hidden sm:block">
              Sign Up
            </Link>
            <Link
              href="/signup?type=merchant"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              Secure Digital Gift Cards & Prepaid Passes
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Accept Payments with
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Dynamic QR Codes
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Stored value passes for coffee shops, bakeries, and local businesses.
              No hardware needed — just scan and charge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup?type=merchant"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-lg transition shadow-lg shadow-purple-500/25"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-lg transition"
              >
                See How It Works
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl" />
            <div className="relative bg-gray-800/50 backdrop-blur border border-gray-700 rounded-3xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Phone mockup - Customer */}
                <div className="text-center">
                  <div className="inline-block bg-gray-900 rounded-3xl p-4 shadow-2xl">
                    <div className="w-48 h-80 bg-gradient-to-b from-purple-900 to-gray-900 rounded-2xl flex flex-col items-center justify-center p-4">
                      <Wallet className="w-12 h-12 text-purple-400 mb-4" />
                      <div className="text-3xl font-bold text-white mb-2">$47.50</div>
                      <div className="text-gray-400 text-sm mb-4">Balance</div>
                      <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center">
                        <QrCode className="w-24 h-24 text-gray-800" />
                      </div>
                      <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                        <RefreshCw className="w-3 h-3" />
                        Refreshes in 27s
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 mt-4">Customer Pass</p>
                </div>
                {/* Phone mockup - Merchant */}
                <div className="text-center">
                  <div className="inline-block bg-gray-900 rounded-3xl p-4 shadow-2xl">
                    <div className="w-48 h-80 bg-gradient-to-b from-green-900 to-gray-900 rounded-2xl flex flex-col items-center justify-center p-4">
                      <Store className="w-12 h-12 text-green-400 mb-4" />
                      <div className="text-lg font-semibold text-white mb-4">Charge Customer</div>
                      <div className="w-full bg-gray-800 rounded-xl p-4 mb-4">
                        <input 
                          type="text" 
                          value="$5.75"
                          readOnly
                          className="w-full bg-transparent text-3xl font-bold text-center text-white outline-none"
                        />
                      </div>
                      <button className="w-full py-3 bg-green-600 rounded-xl font-semibold text-white">
                        Scan QR
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-400 mt-4">Merchant POS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="demo" className="py-20 px-4 bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Simple for customers, powerful for merchants
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: <Users className="w-8 h-8" />,
                title: "Customer Signs Up",
                desc: "Create a pass in seconds with email verification"
              },
              {
                step: "2",
                icon: <CreditCard className="w-8 h-8" />,
                title: "Add Funds",
                desc: "Top up via credit card, Apple Pay, or Google Pay"
              },
              {
                step: "3",
                icon: <QrCode className="w-8 h-8" />,
                title: "Show QR Code",
                desc: "Dynamic codes rotate every 30 seconds for security"
              },
              {
                step: "4",
                icon: <Smartphone className="w-8 h-8" />,
                title: "Merchant Scans",
                desc: "Enter amount, scan, done. Balance updates instantly"
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 h-full">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold mb-4">
                    {item.step}
                  </div>
                  <div className="text-purple-400 mb-4">{item.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-gray-600">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Security</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Enterprise-grade security without the enterprise complexity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-10 h-10" />,
                title: "HMAC-SHA256 Signed",
                desc: "Every QR code is cryptographically signed. Impossible to forge or replay.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <RefreshCw className="w-10 h-10" />,
                title: "30-Second Rotation",
                desc: "Codes expire quickly. Screenshots and photos won't work at checkout.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: <Zap className="w-10 h-10" />,
                title: "Instant Settlement",
                desc: "Atomic transactions ensure balances are always accurate. No double-spending.",
                color: "from-orange-500 to-red-500"
              }
            ].map((feature, i) => (
              <div key={i} className="group">
                <div className="bg-gray-800/30 border border-gray-700 rounded-2xl p-8 h-full hover:border-gray-600 transition">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              No monthly fees. Pay only when you make money.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
              <div className="text-gray-400 font-medium mb-2">Starter</div>
              <div className="text-4xl font-bold mb-1">Free</div>
              <div className="text-gray-500 text-sm mb-6">to get started</div>
              <ul className="space-y-3 mb-8">
                {["Up to 50 passes", "Basic POS", "Email support", "2.9% + 30¢ per top-up"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-green-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?type=merchant&plan=starter"
                className="block w-full py-3 text-center bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition"
              >
                Start Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-semibold">
                POPULAR
              </div>
              <div className="text-purple-400 font-medium mb-2">Pro</div>
              <div className="text-4xl font-bold mb-1">$29<span className="text-xl text-gray-400">/mo</span></div>
              <div className="text-gray-500 text-sm mb-6">per location</div>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited passes",
                  "Merchant dashboard",
                  "Transaction history",
                  "Apple & Google Wallet",
                  "Priority support",
                  "Lower fees: 2.5% + 25¢"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-purple-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?type=merchant&plan=pro"
                className="block w-full py-3 text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition"
              >
                Start 14-Day Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to modernize your payments?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Join hundreds of local businesses using PassQR Pay to offer
            gift cards and loyalty programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition"
            />
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium transition whitespace-nowrap">
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">PassQR Pay</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <Link href="/terms" className="hover:text-white transition">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="/contact" className="hover:text-white transition">Contact</Link>
            </div>
            <div className="text-gray-500 text-sm">
              © 2026 DaSecure Solutions LLC
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
