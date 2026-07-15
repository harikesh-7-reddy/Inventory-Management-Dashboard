"use client";

import { useState } from "react";

interface ProductFormProps {
  product?: any;
  categories?: any[];
  suppliers?: any[];
  onSuccess: () => void;
}

export function ProductForm({
  product,
  categories,
  suppliers,
  onSuccess,
}: ProductFormProps) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (product) {
      await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/products", {
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">SKU *</label>
          <input
            name="sku"
            defaultValue={product?.sku || ""}
            required
            className={fieldClass}
            placeholder="PROD-001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            name="name"
            defaultValue={product?.name || ""}
            required
            className={fieldClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          defaultValue={product?.description || ""}
          rows={2}
          className={fieldClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <select
            name="categoryId"
            defaultValue={product?.categoryId || ""}
            required
            className={fieldClass}
          >
            <option value="">Select...</option>
            {categories?.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Supplier *</label>
          <select
            name="supplierId"
            defaultValue={product?.supplierId || ""}
            required
            className={fieldClass}
          >
            <option value="">Select...</option>
            {suppliers?.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Unit Cost *</label>
          <input
            name="unitCost"
            type="number"
            step="0.01"
            defaultValue={product?.unitCost || ""}
            required
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price *</label>
          <input
            name="price"
            type="number"
            step="0.01"
            defaultValue={product?.price || ""}
            required
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Unit</label>
          <input
            name="unit"
            defaultValue={product?.unit || "pcs"}
            className={fieldClass}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Stock Qty</label>
          <input
            name="stockQty"
            type="number"
            defaultValue={product?.stockQty ?? 0}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reorder Point</label>
          <input
            name="reorderPoint"
            type="number"
            defaultValue={product?.reorderPoint ?? 10}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reorder Qty</label>
          <input
            name="reorderQty"
            type="number"
            defaultValue={product?.reorderQty ?? 50}
            className={fieldClass}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : product ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
