"use client";

import { useState } from "react";
import Link from "next/link";
import {
  QrCode,
  CreditCard,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  LogOut,
  Smartphone,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

// Extended mock data
const mockTransactions = Array.from({ length: 50 }, (_, i) => ({
  id: `txn_${i + 1}`,
  type: ["debit", "topup", "debit", "debit", "refund"][i % 5] as "debit" | "topup" | "refund",
  amount: parseFloat((Math.random() * 50 + 2).toFixed(2)),
  passId: `pass_${String.fromCharCode(97 + (i % 26))}${String.fromCharCode(97 + ((i + 1) % 26))}${String.fromCharCode(97 + ((i + 2) % 26))}`,
  passMasked: `***${String.fromCharCode(97 + (i % 26))}${String.fromCharCode(97 + ((i + 1) % 26))}${String.fromCharCode(97 + ((i + 2) % 26))}`,
  timestamp: new Date(Date.now() - i * 1000 * 60 * 30).toISOString(),
  status: "completed" as const,
  deviceId: `pos_${(i % 3) + 1}`,
}));

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "debit" | "topup" | "refund">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "all">("all");
  
  const itemsPerPage = 15;

  const filteredTransactions = mockTransactions.filter((txn) => {
    if (typeFilter !== "all" && txn.type !== typeFilter) return false;
    if (searchQuery && !txn.passId.includes(searchQuery) && !txn.id.includes(searchQuery)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totals = {
    debits: filteredTransactions.filter(t => t.type === "debit").reduce((sum, t) => sum + t.amount, 0),
    topups: filteredTransactions.filter(t => t.type === "topup").reduce((sum, t) => sum + t.amount, 0),
    refunds: filteredTransactions.filter(t => t.type === "refund").reduce((sum, t) => sum + t.amount, 0),
  };

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
            { icon: <TrendingUp className="w-5 h-5" />, label: "Dashboard", href: "/dashboard", active: false },
            { icon: <CreditCard className="w-5 h-5" />, label: "Transactions", href: "/dashboard/transactions", active: true },
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
            <h1 className="text-2xl font-bold text-white">Transactions</h1>
            <p className="text-gray-400">View and manage all pass transactions</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 rounded-lg text-white transition">
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">Total Debits</div>
              <ArrowUpRight className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-red-400 mt-1">${totals.debits.toFixed(2)}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">Total Top-ups</div>
              <ArrowDownRight className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400 mt-1">${totals.topups.toFixed(2)}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">Total Refunds</div>
              <RefreshCw className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-yellow-400 mt-1">${totals.refunds.toFixed(2)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by pass ID or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Types</option>
              <option value="debit">Debits</option>
              <option value="topup">Top-ups</option>
              <option value="refund">Refunds</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Transaction ID</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Type</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Pass</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Amount</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Time</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {paginatedTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4">
                      <span className="text-white font-mono text-sm">{txn.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        txn.type === "debit" ? "bg-red-500/20 text-red-400" :
                        txn.type === "topup" ? "bg-green-500/20 text-green-400" :
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {txn.type === "debit" && <ArrowUpRight className="w-3 h-3" />}
                        {txn.type === "topup" && <ArrowDownRight className="w-3 h-3" />}
                        {txn.type === "refund" && <RefreshCw className="w-3 h-3" />}
                        {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 font-mono text-sm">{txn.passMasked}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${
                        txn.type === "debit" ? "text-red-400" :
                        txn.type === "topup" ? "text-green-400" :
                        "text-yellow-400"
                      }`}>
                        {txn.type === "debit" ? "-" : txn.type === "topup" ? "+" : "↺"}${txn.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(txn.timestamp)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                        ✓ Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
            <div className="text-gray-400 text-sm">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      currentPage === page
                        ? "bg-purple-600 text-white"
                        : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
