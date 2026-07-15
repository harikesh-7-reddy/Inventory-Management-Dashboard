"use client";

import { useState } from "react";
import useSWR from "swr";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import {
  AlertTriangle,
  AlertCircle,
  Eye,
  CheckCircle,
  Bell,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AlertsPage() {
  const [filter, setFilter] = useState("all");
  const [showAcked, setShowAcked] = useState(false);

  const queryParams = new URLSearchParams();
  if (filter !== "all") queryParams.set("severity", filter);
  if (!showAcked) queryParams.set("unacknowledged", "true");

  const { data: alerts, isLoading, mutate } = useSWR(
    `/api/alerts?${queryParams.toString()}`,
    fetcher,
    { refreshInterval: 15000 }
  );

  const handleAck = async (id: number) => {
    await fetch(`/api/alerts/${id}/ack`, { method: "POST" });
    mutate();
  };

  const severityConfig: Record<
    string,
    { icon: any; color: string; bg: string; border: string }
  > = {
    CRITICAL: {
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    LOW: {
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    WATCH: {
      icon: Eye,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
  };

  const grouped = {
    CRITICAL: alerts?.filter((a: any) => a.severity === "CRITICAL") || [],
    LOW: alerts?.filter((a: any) => a.severity === "LOW") || [],
    WATCH: alerts?.filter((a: any) => a.severity === "WATCH") || [],
  };

  const totalAlerts = alerts?.length || 0;

  return (
    <div className="pt-14 lg:pt-0">
      <PageHeader
        title="Alerts"
        description="Low-stock alerts and reorder triggers"
        actions={
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={showAcked}
              onChange={(e) => setShowAcked(e.target.checked)}
              className="rounded"
            />
            Show acknowledged
          </label>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(["CRITICAL", "LOW", "WATCH"] as const).map((sev) => {
          const config = severityConfig[sev];
          const Icon = config.icon;
          const count = grouped[sev]?.length || 0;
          return (
            <div
              key={sev}
              className={`${config.bg} border ${config.border} rounded-2xl p-4 flex items-center gap-3`}
            >
              <Icon className={`w-8 h-8 ${config.color}`} />
              <div>
                <p className={`text-2xl font-bold ${config.color}`}>{count}</p>
                <p className="text-xs text-slate-600 capitalize">
                  {sev.toLowerCase()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {["all", "CRITICAL", "LOW", "WATCH"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f === "all" ? "All Alerts" : f.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Alert list */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading alerts...</div>
      ) : totalAlerts === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">All clear!</p>
          <p className="text-sm text-slate-400">
            No {showAcked ? "" : "unacknowledged "}alerts
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts?.map((alert: any) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            return (
              <div
                key={alert.id}
                className={`bg-white border ${config.border} rounded-2xl p-4 flex items-center gap-4 ${
                  alert.acknowledgedAt ? "opacity-60" : ""
                }`}
              >
                <div
                  className={`${config.bg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-6 h-6 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{alert.message}</p>
                    {alert.acknowledgedAt && (
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        Acknowledged
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="font-mono">{alert.product?.sku}</span>
                    <span>·</span>
                    <span>{alert.product?.supplier?.name}</span>
                    <span>·</span>
                    <span>
                      Stock: {alert.product?.stockQty ?? "—"} / Reorder:{" "}
                      {alert.product?.reorderPoint ?? "—"}
                    </span>
                  </div>
                </div>
                {!alert.acknowledgedAt && (
                  <button
                    onClick={() => handleAck(alert.id)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50 whitespace-nowrap"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
