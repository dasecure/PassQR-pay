"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  QrCode,
  CreditCard,
  Users,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Settings,
  LogOut,
  Smartphone,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";

// Mock data - replace with real API calls
const mockStats = {
  totalBalance: 12450.75,
  totalPasses: 347,
  activePasses: 289,
  todayTransactions: 42,
  todayVolume: 847.50,
  weeklyGrowth: 12.5,
};

const mockTransactions = [
  { id: "txn_1", type: "debit", amount: 5.75, passId: "pass_abc", passMasked: "***abc", time: "2 min ago", status: "completed" },
  { id: "txn_2", type: "topup", amount: 50.00, passId: "pass_def", passMasked: "***def", time: "15 min ago", status: "completed" },
  { id: "txn_3", type: "debit", amount: 12.50, passId: "pass_ghi", passMasked: "***ghi", time: "32 min ago", status: "completed" },
  { id: "txn_4", type: "debit", amount: 8.25, passId: "pass_jkl", passMasked: "***jkl", time: "1 hour ago", status: "completed" },
  { id: "txn_5", type: "topup", amount: 25.00, passId: "pass_mno", passMasked: "***mno", time: "2 hours ago", status: "completed" },
  { id: "txn_6", type: "debit", amount: 4.50, passId: "pass_pqr", passMasked: "***pqr", time: "3 hours ago", status: "completed" },
  { id: "txn_7", type: "refund", amount: 15.00, passId: "pass_stu", passMasked: "***stu", time: "5 hours ago", status: "completed" },
];

const mockRecentPasses = [
  { id: "pass_abc", balance: 47.50, lastUsed: "2 min ago", totalSpent: 152.50 },
  { id: "pass_def", balance: 50.00, lastUsed: "15 min ago", totalSpent: 0 },
  { id: "pass_ghi", balance: 12.25, lastUsed: "32 min ago", totalSpent: 87.75 },
];

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("today");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gray-800 border-r border-gray-700 p-4 hidden lg:block">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">PassQR</span>
        </div>

        <nav className="space-y-2">
          {[
            { icon: <TrendingUp className="w-5 h-5" />, label: "Dashboard", href: "/dashboard", active: true },
            { icon: <CreditCard className="w-5 h-5" />, label: "Transactions", href: "/dashboard/transactions" },
            { icon: <Users className="w-5 h-5" />, label: "Passes", href: "/dashboard/passes" },
            { icon: <Smartphone className="w-5 h-5" />, label: "POS", href: "/pos" },
            { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "/dashboard/settings" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                item.active
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-700/50 rounded-xl p-4 mb-4">
            <div className="text-gray-400 text-sm mb-1">Store</div>
            <div className="text-white font-medium">Sunrise Coffee Co.</div>
          </div>
          <button className="flex items-center gap-2 text-gray-400 hover:text-white transition w-full px-4 py-2">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Welcome back! Here&apos;s your overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <Link
              href="/pos"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium text-white transition"
            >
              <Smartphone className="w-5 h-5" />
              Open POS
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Balance (All Passes)",
              value: `$${mockStats.totalBalance.toLocaleString()}`,
              change: `+${mockStats.weeklyGrowth}%`,
              positive: true,
              icon: <DollarSign className="w-6 h-6" />,
            },
            {
              label: "Active Passes",
              value: mockStats.activePasses.toString(),
              subtext: `of ${mockStats.totalPasses} total`,
              icon: <Users className="w-6 h-6" />,
            },
            {
              label: "Today's Transactions",
              value: mockStats.todayTransactions.toString(),
              subtext: `$${mockStats.todayVolume} volume`,
              icon: <CreditCard className="w-6 h-6" />,
            },
            {
              label: "Avg Transaction",
              value: `$${(mockStats.todayVolume / mockStats.todayTransactions).toFixed(2)}`,
              icon: <TrendingUp className="w-6 h-6" />,
            },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-gray-400 text-sm">{stat.label}</div>
                <div className="text-purple-400">{stat.icon}</div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              {stat.change && (
                <div className={`flex items-center gap-1 text-sm ${stat.positive ? "text-green-400" : "text-red-400"}`}>
                  {stat.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change} this week
                </div>
              )}
              {stat.subtext && <div className="text-gray-500 text-sm">{stat.subtext}</div>}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-40"
                  />
                </div>
                <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                  <Filter className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-700">
              {mockTransactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-4 hover:bg-gray-700/50 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      txn.type === "debit" ? "bg-red-500/20 text-red-400" :
                      txn.type === "topup" ? "bg-green-500/20 text-green-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {txn.type === "debit" ? <ArrowUpRight className="w-5 h-5" /> :
                       txn.type === "topup" ? <ArrowDownRight className="w-5 h-5" /> :
                       <RefreshCw className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-white font-medium capitalize">{txn.type}</div>
                      <div className="text-gray-500 text-sm">Pass: {txn.passMasked}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      txn.type === "debit" ? "text-red-400" :
                      txn.type === "topup" ? "text-green-400" :
                      "text-yellow-400"
                    }`}>
                      {txn.type === "debit" ? "-" : txn.type === "topup" ? "+" : "↺"}${txn.amount.toFixed(2)}
                    </div>
                    <div className="text-gray-500 text-sm flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {txn.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-700">
              <Link href="/dashboard/transactions" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                View all transactions →
              </Link>
            </div>
          </div>

          {/* Top Passes */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Recent Passes</h2>
              <Link href="/dashboard/passes" className="text-purple-400 hover:text-purple-300 text-sm">
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-700">
              {mockRecentPasses.map((pass) => (
                <div key={pass.id} className="p-4 hover:bg-gray-700/50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-medium font-mono text-sm">
                      {pass.id.slice(0, 12)}...
                    </div>
                    <div className="text-green-400 font-semibold">${pass.balance.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Last used: {pass.lastUsed}</span>
                    <span>Spent: ${pass.totalSpent.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-700">
              <Link
                href="/dashboard/passes/new"
                className="block w-full py-2 text-center bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition"
              >
                + Create New Pass
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
