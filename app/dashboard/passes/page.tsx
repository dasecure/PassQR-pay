"use client";

import { useState } from "react";
import Link from "next/link";
import {
  QrCode,
  CreditCard,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  Smartphone,
  Search,
  Plus,
  MoreVertical,
  Mail,
  Clock,
  DollarSign,
  Eye,
  Ban,
  RefreshCw,
} from "lucide-react";

// Mock data
const mockPasses = Array.from({ length: 25 }, (_, i) => ({
  id: `pass_${String.fromCharCode(97 + (i % 26))}${String.fromCharCode(97 + ((i + 1) % 26))}${String.fromCharCode(97 + ((i + 2) % 26))}${i}`,
  email: `customer${i + 1}@example.com`,
  balance: parseFloat((Math.random() * 100).toFixed(2)),
  totalLoaded: parseFloat((Math.random() * 500 + 50).toFixed(2)),
  totalSpent: parseFloat((Math.random() * 400).toFixed(2)),
  transactionCount: Math.floor(Math.random() * 50) + 1,
  status: ["active", "active", "active", "active", "suspended"][i % 5] as "active" | "suspended",
  createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
  lastUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
}));

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(dateStr);
}

export default function PassesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [selectedPass, setSelectedPass] = useState<string | null>(null);

  const filteredPasses = mockPasses.filter((pass) => {
    if (statusFilter !== "all" && pass.status !== statusFilter) return false;
    if (searchQuery && !pass.email.includes(searchQuery) && !pass.id.includes(searchQuery)) return false;
    return true;
  });

  const stats = {
    total: mockPasses.length,
    active: mockPasses.filter(p => p.status === "active").length,
    totalBalance: mockPasses.reduce((sum, p) => sum + p.balance, 0),
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
            { icon: <TrendingUp className="w-5 h-5" />, label: "Dashboard", href: "/dashboard" },
            { icon: <CreditCard className="w-5 h-5" />, label: "Transactions", href: "/dashboard/transactions" },
            { icon: <Users className="w-5 h-5" />, label: "Passes", href: "/dashboard/passes", active: true },
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
            <h1 className="text-2xl font-bold text-white">Passes</h1>
            <p className="text-gray-400">Manage customer stored value passes</p>
          </div>
          <Link
            href="/dashboard/passes/new"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium text-white transition"
          >
            <Plus className="w-5 h-5" />
            Create Pass
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">Total Passes</div>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">Active Passes</div>
              <div className="w-2 h-2 bg-green-400 rounded-full" />
            </div>
            <div className="text-2xl font-bold text-green-400 mt-1">{stats.active}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">Total Balance</div>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">${stats.totalBalance.toFixed(2)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by email or pass ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Passes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPasses.map((pass) => (
            <div
              key={pass.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${pass.status === "active" ? "bg-green-400" : "bg-red-400"}`} />
                    <span className="text-white font-medium font-mono text-sm">{pass.id.slice(0, 16)}...</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Mail className="w-3 h-3" />
                    {pass.email}
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setSelectedPass(selectedPass === pass.id ? null : pass.id)}
                    className="p-1 hover:bg-gray-700 rounded transition"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                  {selectedPass === pass.id && (
                    <div className="absolute right-0 top-8 bg-gray-700 border border-gray-600 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 transition">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 transition">
                        <RefreshCw className="w-4 h-4" />
                        Reset QR Secret
                      </button>
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-600 transition">
                        <Ban className="w-4 h-4" />
                        {pass.status === "active" ? "Suspend" : "Reactivate"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-gray-500 text-xs mb-1">Balance</div>
                  <div className="text-2xl font-bold text-green-400">${pass.balance.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-xs mb-1">Total Spent</div>
                  <div className="text-lg font-semibold text-white">${pass.totalSpent.toFixed(2)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-700 pt-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last used: {formatTimeAgo(pass.lastUsed)}
                </span>
                <span>{pass.transactionCount} txns</span>
              </div>
            </div>
          ))}
        </div>

        {filteredPasses.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No passes found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <Link
              href="/dashboard/passes/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium text-white transition"
            >
              <Plus className="w-5 h-5" />
              Create First Pass
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
