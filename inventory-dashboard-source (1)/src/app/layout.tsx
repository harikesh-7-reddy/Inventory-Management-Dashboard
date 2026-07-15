import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { getShopFromSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Inventory Management Dashboard",
  description:
    "Real-time inventory tracking with low-stock alerts, supplier management, and reorder recommendations",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const shop = await getShopFromSession();

  // If not authenticated, render a clean page (no sidebar) — the login
  // page or the middleware redirect will take it from here.
  if (!shop) {
    return (
      <html lang="en">
        <body className="antialiased bg-slate-50 text-slate-900">
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">
        <div className="flex min-h-screen">
          <Sidebar shopName={shop.shopName} />
          <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
