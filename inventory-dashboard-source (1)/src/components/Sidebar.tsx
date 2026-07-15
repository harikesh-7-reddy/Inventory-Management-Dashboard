"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Truck,
  Bell,
  ShoppingCart,
  TrendingUp,
  Boxes,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/reorders", label: "Reorders", icon: ShoppingCart },
  { href: "/movements", label: "Movements", icon: TrendingUp },
];

export function Sidebar({ shopName }: { shopName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Boxes className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-sm">Inventory</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-2 rounded-lg whitespace-nowrap ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200 flex-col z-30">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm">Inventory</h1>
              <p className="text-xs text-slate-500">Management System</p>
            </div>
          </div>
          {shopName && (
            <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-slate-500">Signed in as</p>
              <p className="text-sm font-semibold text-blue-700 truncate">
                {shopName}
              </p>
            </div>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200 space-y-2">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            {loggingOut ? "Signing out..." : "Sign Out"}
          </button>
          <div className="text-xs text-slate-400 text-center">
            Inventory Dashboard v1.0
          </div>
        </div>
      </aside>
    </>
  );
}
