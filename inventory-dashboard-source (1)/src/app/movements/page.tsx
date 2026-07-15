"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { formatDateTime } from "@/lib/format";
import { TrendingUp, ArrowDownCircle, ArrowUpCircle, Boxes } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MovementsPage() {
  const [type, setType] = useState("all");
  const [product, setProduct] = useState("");

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({ limit: "100" });
    if (type !== "all") params.set("type", type);
    if (product) params.set("productId", product);
    return params.toString();
  }, [type, product]);

  const { data: movements, isLoading } = useSWR(
    `/api/stock-movements?${queryParams}`,
    fetcher
  );

  return (
    <div className="pt-14 lg:pt-0">
      <PageHeader
        title="Stock Movements"
        description="Complete audit trail of all inventory changes"
      />

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
            <option value="ADJUST">Adjustments</option>
          </select>
          <input
            type="text"
            placeholder="Product ID..."
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">
            Loading movements...
          </div>
        ) : movements?.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No movements found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">SKU</th>
                  <th className="text-right px-4 py-3 font-medium">Quantity</th>
                  <th className="text-left px-4 py-3 font-medium">Reason</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements?.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {m.type === "IN" ? (
                          <ArrowDownCircle className="w-4 h-4 text-green-500" />
                        ) : m.type === "OUT" ? (
                          <ArrowUpCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Boxes className="w-4 h-4 text-blue-500" />
                        )}
                        <Badge
                          variant={
                            m.type === "IN"
                              ? "success"
                              : m.type === "OUT"
                                ? "danger"
                                : "info"
                          }
                        >
                          {m.type}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {m.product?.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {m.product?.sku}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {m.type === "IN" ? "+" : m.type === "OUT" ? "−" : "±"}
                      {m.qty}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{m.reason}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDateTime(m.createdAt.toISOString())}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
