"use client";

import useSWR from "swr";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { formatCurrency, formatNumber, timeAgo } from "@/lib/format";
import {
  Package,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Boxes,
  Store,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR("/api/dashboard", fetcher, {
    refreshInterval: 30000,
  });

  if (isLoading)
    return (
      <div className="pt-14 lg:pt-0">
        <PageHeader title="Dashboard" description="Loading..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-5 h-32"
            />
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="pt-14 lg:pt-0">
        <PageHeader title="Dashboard" />
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          Failed to load dashboard data
        </div>
      </div>
    );

  const { kpis, categoryBreakdown, stockStatus, topProductsByValue, movementTrend, recentMovements } = data;

  return (
    <div className="pt-14 lg:pt-0">
      <PageHeader
        title="Dashboard"
        description="Real-time inventory overview and key metrics"
      />

      {/* Low-stock alert banner */}
      {kpis.outOfStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">
            <span className="font-semibold">{kpis.outOfStockCount}</span> product
            {kpis.outOfStockCount !== 1 ? "s" : ""} out of stock.{" "}
            <span className="font-semibold">{kpis.lowStockCount}</span> product
            {kpis.lowStockCount !== 1 ? "s" : ""} at or below reorder point.
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Products"
          value={formatNumber(kpis.totalProducts)}
          subtitle={`${kpis.totalCategories} categories`}
          icon={<Package className="w-6 h-6" />}
          color="blue"
        />
        <KPICard
          title="Inventory Value"
          value={formatCurrency(kpis.inventoryValue)}
          subtitle={`Retail: ${formatCurrency(kpis.retailValue)}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <KPICard
          title="Low Stock Items"
          value={formatNumber(kpis.lowStockCount)}
          subtitle={`${kpis.outOfStockCount} out of stock`}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="amber"
        />
        <KPICard
          title="Pending Reorders"
          value={formatNumber(kpis.pendingReorders)}
          subtitle={`${kpis.totalSuppliers} suppliers`}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Stock Movement Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Stock Movement (7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={movementTrend}>
              <defs>
                <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "13px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Area
                type="monotone"
                dataKey="stockIn"
                name="Stock In"
                stroke="#22c55e"
                fill="url(#inGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="stockOut"
                name="Stock Out"
                stroke="#ef4444"
                fill="url(#outGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Status Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Stock Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {stockStatus.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "13px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">
            Inventory Value by Category
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#94a3b8"
                fontSize={12}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "13px",
                }}
                formatter={(value: any) => formatCurrency(Number(value))}
              />
              <Bar
                dataKey="value"
                name="Inventory Value"
                fill="#3b82f6"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products by Value */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Top Products by Value</h3>
          <div className="space-y-3">
            {topProductsByValue.slice(0, 6).map((product: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {product.stockQty} units
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {formatCurrency(product.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Stock Movements</h3>
        <div className="space-y-2">
          {recentMovements.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No recent movements
            </p>
          ) : (
            recentMovements.map((m: any) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    m.type === "IN"
                      ? "bg-green-50 text-green-600"
                      : m.type === "OUT"
                        ? "bg-red-50 text-red-600"
                        : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {m.type === "IN" ? (
                    <ArrowDownCircle className="w-5 h-5" />
                  ) : m.type === "OUT" ? (
                    <ArrowUpCircle className="w-5 h-5" />
                  ) : (
                    <Boxes className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {m.productName}{" "}
                    <span className="text-slate-400">({m.productSku})</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {m.reason} · {timeAgo(m.createdAt)}
                  </p>
                </div>
                <Badge
                  variant={
                    m.type === "IN"
                      ? "success"
                      : m.type === "OUT"
                        ? "danger"
                        : "info"
                  }
                >
                  {m.type === "IN" ? "+" : m.type === "OUT" ? "−" : "±"}
                  {m.qty}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
