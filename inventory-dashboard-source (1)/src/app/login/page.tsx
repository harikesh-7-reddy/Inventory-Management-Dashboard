"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Boxes, Loader2, Store, Lock, AlertCircle, UserPlus, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [shopName, setShopName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, redirect to dashboard
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.shop) router.replace("/");
      })
      .catch(() => {});
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!shopName.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName: shopName.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <Boxes className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === "login"
              ? "Sign in to manage your inventory"
              : "Create your shop account"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Mode tabs */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Shop Name
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. My Electronics Store"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  autoComplete={mode === "login" ? "username" : "off"}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-blue-200"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === "login" ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Footer toggle */}
          <p className="text-center text-sm text-slate-500 mt-6">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in instead
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
