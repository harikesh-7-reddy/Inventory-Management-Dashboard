"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";
import { formatCurrency, getStockStatus } from "@/lib/format";
import { ProductForm } from "@/components/ProductForm";
import { Search, Plus, Pencil, Trash2, ArrowDown, ArrowUp, Package } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [supplier, setSupplier] = useState("all");
  const [status, setStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [adjustProduct, setAdjustProduct] = useState<any>(null);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    if (supplier !== "all") params.set("supplier", supplier);
    if (status !== "all") params.set("status", status);
    return params.toString();
  }, [search, category, supplier, status]);

  const { data: products, isLoading, mutate } = useSWR(
    `/api/products?${queryParams}`,
    fetcher
  );
  const { data: categories } = useSWR("/api/categories", fetcher);
  const { data: suppliers } = useSWR("/api/suppliers", fetcher);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    mutate();
  };

  const handleAdjust = async (productId: number, qty: number, reason: string) => {
    await fetch(`/api/products/${productId}/adjust-stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty, reason }),
    });
    mutate();
    setAdjustProduct(null);
  };

  return (
    <div className="pt-14 lg:pt-0">
      <PageHeader
        title="Products"
        description="Manage your inventory items"
        actions={
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories?.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Suppliers</option>
            {suppliers?.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="critical">Out of Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="in-stock">In Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading products...</div>
        ) : products?.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">SKU</th>
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Supplier</th>
                  <th className="text-right px-4 py-3 font-medium">Stock</th>
                  <th className="text-right px-4 py-3 font-medium">Reorder Pt</th>
                  <th className="text-right px-4 py-3 font-medium">Unit Cost</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products?.map((p: any) => {
                  const stockStatus = getStockStatus(
                    p.stockQty,
                    p.reorderPoint
                  );
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {p.sku}
                      </td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {p.category?.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {p.supplier?.name}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {p.stockQty}{" "}
                        <span className="text-xs text-slate-400">
                          {p.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {p.reorderPoint}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(Number(p.unitCost))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}
                        >
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setAdjustProduct(p)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                            title="Adjust stock"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setShowModal(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? "Edit Product" : "Add Product"}
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          categories={categories}
          suppliers={suppliers}
          onSuccess={() => {
            setShowModal(false);
            mutate();
          }}
        />
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        open={!!adjustProduct}
        onClose={() => setAdjustProduct(null)}
        title={`Adjust Stock — ${adjustProduct?.name || ""}`}
        size="sm"
      >
        <StockAdjustForm
          product={adjustProduct}
          onSubmit={(qty, reason) => handleAdjust(adjustProduct.id, qty, reason)}
          onCancel={() => setAdjustProduct(null)}
        />
      </Modal>
    </div>
  );
}

function StockAdjustForm({
  product,
  onSubmit,
  onCancel,
}: {
  product: any;
  onSubmit: (qty: number, reason: string) => void;
  onCancel: () => void;
}) {
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const n = parseInt(qty);
        if (!n || n <= 0) return;
        onSubmit(direction === "in" ? n : -n, reason || "Manual adjustment");
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Current Stock</label>
        <div className="px-3 py-2 bg-slate-50 rounded-lg text-sm">
          {product?.stockQty} {product?.unit}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setDirection("in")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
            direction === "in"
              ? "bg-green-50 border-green-500 text-green-700"
              : "border-slate-200 text-slate-500"
          }`}
        >
          <ArrowDown className="w-4 h-4 inline mr-1" />
          Stock In
        </button>
        <button
          type="button"
          onClick={() => setDirection("out")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
            direction === "out"
              ? "bg-red-50 border-red-500 text-red-700"
              : "border-slate-200 text-slate-500"
          }`}
        >
          <ArrowUp className="w-4 h-4 inline mr-1" />
          Stock Out
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Quantity</label>
        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Reason</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Manual adjustment"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Apply Adjustment
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
