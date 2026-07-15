"use client";

import { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: string;
  trend?: { value: number; label: string };
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
}: KPICardProps) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold mt-2 text-slate-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
