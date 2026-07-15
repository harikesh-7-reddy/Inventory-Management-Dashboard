import { describe, it, expect } from "vitest";
import { getStockStatus, formatCurrency, formatNumber, timeAgo } from "@/lib/format";

describe("getStockStatus", () => {
  it("returns 'Out of Stock' for zero stock", () => {
    const status = getStockStatus(0, 10);
    expect(status.label).toBe("Out of Stock");
  });

  it("returns 'Low Stock' when stock <= reorderPoint", () => {
    const status = getStockStatus(8, 10);
    expect(status.label).toBe("Low Stock");
  });

  it("returns 'Low Stock' when stock equals reorderPoint", () => {
    const status = getStockStatus(10, 10);
    expect(status.label).toBe("Low Stock");
  });

  it("returns 'Watch' when between reorder and 1.5x", () => {
    const status = getStockStatus(12, 10);
    expect(status.label).toBe("Watch");
  });

  it("returns 'In Stock' when healthy", () => {
    const status = getStockStatus(100, 10);
    expect(status.label).toBe("In Stock");
  });
});

describe("formatCurrency", () => {
  it("formats a positive number as USD", () => {
    expect(formatCurrency(1234.56)).toMatch(/\$1,234\.56/);
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toMatch(/\$0\.00/);
  });
});

describe("formatNumber", () => {
  it("formats large numbers with commas", () => {
    expect(formatNumber(1000000)).toBe("1,000,000");
  });
});

describe("timeAgo", () => {
  it("returns 'just now' for very recent", () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe("just now");
  });

  it("returns minutes ago", () => {
    const d = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(d)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const d = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(d)).toBe("3h ago");
  });

  it("returns days ago", () => {
    const d = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(d)).toBe("2d ago");
  });
});
