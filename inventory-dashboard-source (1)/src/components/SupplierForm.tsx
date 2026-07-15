"use client";

import { useState } from "react";

interface SupplierFormProps {
  supplier?: any;
  onSuccess: () => void;
}

export function SupplierForm({ supplier, onSuccess }: SupplierFormProps) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (supplier) {
      await fetch(`/api/suppliers/${supplier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setSaving(false);
    onSuccess();
  };

  const fieldClass =
    "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <input
          name="name"
          defaultValue={supplier?.name || ""}
          required
          className={fieldClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={supplier?.email || ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            name="phone"
            defaultValue={supplier?.phone || ""}
            className={fieldClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <input
          name="address"
          defaultValue={supplier?.address || ""}
          className={fieldClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Lead Time (days)
          </label>
          <input
            name="leadTimeDays"
            type="number"
            min="1"
            defaultValue={supplier?.leadTimeDays ?? 7}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Rating (0–5)</label>
          <input
            name="rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            defaultValue={supplier?.rating ?? 3}
            className={fieldClass}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : supplier ? "Update Supplier" : "Create Supplier"}
      </button>
    </form>
  );
}
