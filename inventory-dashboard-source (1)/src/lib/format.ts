export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function getStockStatus(
  stockQty: number,
  reorderPoint: number
): { label: string; color: string; bg: string } {
  if (stockQty <= 0)
    return { label: "Out of Stock", color: "text-red-700", bg: "bg-red-100" };
  if (stockQty <= reorderPoint)
    return {
      label: "Low Stock",
      color: "text-amber-700",
      bg: "bg-amber-100",
    };
  if (stockQty <= reorderPoint * 1.5)
    return {
      label: "Watch",
      color: "text-blue-700",
      bg: "bg-blue-100",
    };
  return {
    label: "In Stock",
    color: "text-green-700",
    bg: "bg-green-100",
  };
}
