"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";
import { SupplierForm } from "@/components/SupplierForm";
import { Search, Plus, Pencil, Trash2, Truck, Mail, Phone, Clock, Star } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    return params.toString();
  }, [search]);

  const { data: suppliers, isLoading, mutate } = useSWR(
    `/api/suppliers?${queryParams}`,
    fetcher
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this supplier? Products linked will lose their supplier.")) return;
    await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    mutate();
  };

  return (
    <div className="pt-14 lg:pt-0">
      <PageHeader
        title="Suppliers"
        description="Manage supplier relationships and contacts"
        actions={
          <button
            onClick={() => {
              setEditingSupplier(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading suppliers...</div>
      ) : suppliers?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No suppliers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers?.map((s: any) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{s.name}</h3>
                    <Badge variant="info">{s._count.products} products</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingSupplier(s);
                      setShowModal(true);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                {s.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{s.email}</span>
                  </div>
                )}
                {s.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {s.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {s.leadTimeDays} day lead time
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  {Number(s.rating).toFixed(1)} rating
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingSupplier ? "Edit Supplier" : "Add Supplier"}
        size="md"
      >
        <SupplierForm
          supplier={editingSupplier}
          onSuccess={() => {
            setShowModal(false);
            mutate();
          }}
        />
      </Modal>
    </div>
  );
}
