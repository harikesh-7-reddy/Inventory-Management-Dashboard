"use client";

import { useState } from "react";
import useSWR from "swr";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  ShoppingCart,
  Plus,
  TrendingUp,
  Clock,
  Package,
  Check,
  X,
  Lightbulb,
  Truck,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ReordersPage() {
  const [tab, setTab] = useState<"suggestions" | "active" | "history">(
    "suggestions"
  );

  const { data: suggestions, mutate: mutateSuggestions } = useSWR(
    "/api/reorder-suggestions",
    fetcher
  );
  const { data: reorders, mutate: mutateReorders } = useSWR(
    "/api/reorders",
    fetcher
  );

  const handleCreateReorder = async (
    productId: number,
    supplierId: number,
    qty: number
  ) => {
    await fetch("/api/reorders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        supplierId,
        qty,
        status: "PENDING",
      }),
    });
    mutateReorders();
    mutateSuggestions();
  };

  const handleStatusChange = async (id: number, status: string) => {
    await fetch(`/api/reorders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    mutateReorders();
  };

  const activeReorders =
    reorders?.filter(
      (r: any) => r.status === "PENDING" || r.status === "SENT"
    ) || [];
  const historicalReorders =
    reorders?.filter(
      (r: any) => r.status === "RECEIVED" || r.status === "CANCELLED"
    ) || [];

  return (
    <div className="pt-14 lg:pt-0">
      <PageHeader
        title="Reorders"
        description="AI-powered reorder recommendations and purchase order tracking"
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {[
          { id: "suggestions", label: "Suggestions", icon: Lightbulb },
          { id: "active", label: "Active Orders", icon: Clock },
          { id: "history", label: "History", icon: Check },
        ].map((t) => {
          const Icon = t.icon;
          const count =
            t.id === "suggestions"
              ? suggestions?.length || 0
              : t.id === "active"
                ? activeReorders.length
                : historicalReorders.length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Suggestions Tab */}
      {tab === "suggestions" && (
        <div>
          {suggestions?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">
                No reorder suggestions needed
              </p>
              <p className="text-sm text-slate-400">
                All products are above their reorder thresholds
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions?.map((s: any) => (
                <SuggestionCard
                  key={s.productId}
                  suggestion={s}
                  onCreate={() =>
                    handleCreateReorder(
                      s.productId,
                      s.supplier.id,
                      s.recommendedQty
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Orders Tab */}
      {tab === "active" && (
        <div>
          {activeReorders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No active reorders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeReorders.map((r: any) => (
                <ReorderCard
                  key={r.id}
                  reorder={r}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <div>
          {historicalReorders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No completed reorders yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">PO #</th>
                      <th className="text-left px-4 py-3 font-medium">Product</th>
                      <th className="text-left px-4 py-3 font-medium">Supplier</th>
                      <th className="text-right px-4 py-3 font-medium">Qty</th>
                      <th className="text-right px-4 py-3 font-medium">Cost</th>
                      <th className="text-center px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historicalReorders.map((r: any) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs">
                          #{r.id}
                        </td>
                        <td className="px-4 py-3">{r.product?.name}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {r.supplier?.name}
                        </td>
                        <td className="px-4 py-3 text-right">{r.qty}</td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(Number(r.totalCost))}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant={
                              r.status === "RECEIVED" ? "success" : "danger"
                            }
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionCard({
  suggestion: s,
  onCreate,
}: {
  suggestion: any;
  onCreate: () => void;
}) {
  const [creating, setCreating] = useState(false);

  const severityConfig: Record<string, { color: string; bg: string }> = {
    CRITICAL: { color: "text-red-600", bg: "bg-red-50 border-red-200" },
    LOW: { color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
    WATCH: { color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  };
  const config = severityConfig[s.severity] || severityConfig.WATCH;

  return (
    <div className={`bg-white border ${config.bg} rounded-2xl p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Package className={`w-5 h-5 ${config.color}`} />
            <h3 className="font-semibold">{s.product.name}</h3>
            <Badge
              variant={
                s.severity === "CRITICAL"
                  ? "danger"
                  : s.severity === "LOW"
                    ? "warning"
                    : "info"
              }
            >
              {s.severity}
            </Badge>
            <span className="font-mono text-xs text-slate-400">
              {s.product.sku}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <Metric
              label="Current Stock"
              value={`${s.product.stockQty} ${s.product.unit}`}
            />
            <Metric
              label="Avg Daily Use"
              value={`${s.avgDailyConsumption}/day`}
            />
            <Metric
              label="Days to Stockout"
              value={
                s.daysUntilStockout === Infinity
                  ? "∞"
                  : `${s.daysUntilStockout}d`
              }
            />
            <Metric
              label="Lead Time"
              value={`${s.supplier.leadTimeDays}d`}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-slate-500">Recommended Reorder Qty</p>
            <p className="text-lg font-bold text-blue-600">
              {formatNumber(s.recommendedQty)} units
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Estimated Cost</p>
            <p className="text-lg font-bold text-slate-700">
              {formatCurrency(s.estimatedCost)}
            </p>
          </div>
        </div>
        <button
          onClick={async () => {
            setCreating(true);
            await onCreate();
            setCreating(false);
          }}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
        >
          <ShoppingCart className="w-4 h-4" />
          {creating ? "Creating..." : "Create Reorder"}
        </button>
      </div>
    </div>
  );
}

function ReorderCard({
  reorder: r,
  onStatusChange,
}: {
  reorder: any;
  onStatusChange: (id: number, status: string) => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-sm font-semibold">PO #{r.id}</span>
            <Badge variant={r.status === "PENDING" ? "warning" : "info"}>
              {r.status}
            </Badge>
          </div>
          <h3 className="font-semibold">{r.product?.name}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <Truck className="w-3.5 h-3.5" />
            {r.supplier?.name}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span>
              <span className="text-slate-500">Qty:</span>{" "}
              <span className="font-medium">{r.qty}</span>
            </span>
            <span>
              <span className="text-slate-500">Cost:</span>{" "}
              <span className="font-medium">
                {formatCurrency(Number(r.totalCost))}
              </span>
            </span>
            {r.notes && (
              <span className="text-slate-500 italic">"{r.notes}"</span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {r.status === "PENDING" && (
            <button
              onClick={() => onStatusChange(r.id, "SENT")}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 whitespace-nowrap"
            >
              Mark as Sent
            </button>
          )}
          {r.status === "SENT" && (
            <button
              onClick={() => onStatusChange(r.id, "RECEIVED")}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 whitespace-nowrap"
            >
              Mark Received
            </button>
          )}
          {(r.status === "PENDING" || r.status === "SENT") && (
            <button
              onClick={() => onStatusChange(r.id, "CANCELLED")}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 whitespace-nowrap"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
