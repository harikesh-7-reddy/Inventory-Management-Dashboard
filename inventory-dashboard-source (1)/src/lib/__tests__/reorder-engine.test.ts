import { describe, it, expect } from "vitest";
import {
  calculateAvgDailyConsumption,
  calculateSafetyStock,
  calculateTargetLevel,
  calculateRecommendedQty,
  calculateDaysUntilStockout,
  getAlertSeverity,
  computeReorderSuggestion,
} from "@/lib/reorder-engine";

describe("calculateAvgDailyConsumption", () => {
  it("returns total divided by period", () => {
    expect(calculateAvgDailyConsumption(300, 30)).toBe(10);
  });

  it("returns 0 for zero period", () => {
    expect(calculateAvgDailyConsumption(100, 0)).toBe(0);
  });

  it("returns 0 for negative period", () => {
    expect(calculateAvgDailyConsumption(100, -5)).toBe(0);
  });
});

describe("calculateSafetyStock", () => {
  it("returns ceil(avgDaily * leadTime * 0.5)", () => {
    // 10/day * 5 days * 0.5 = 25
    expect(calculateSafetyStock(10, 5)).toBe(25);
  });

  it("rounds up", () => {
    // 3.3/day * 7 * 0.5 = 11.55 → ceil = 12
    expect(calculateSafetyStock(3.3, 7)).toBe(12);
  });
});

describe("calculateTargetLevel", () => {
  it("returns ceil(avgDaily * leadTime * 1.5)", () => {
    // 10/day * 5 days * 1.5 = 75
    expect(calculateTargetLevel(10, 5)).toBe(75);
  });
});

describe("calculateRecommendedQty", () => {
  it("returns targetLevel - currentStock when positive", () => {
    expect(calculateRecommendedQty(75, 20, 50)).toBe(55);
  });

  it("returns minimum reorderQty when target already met", () => {
    expect(calculateRecommendedQty(75, 80, 50)).toBe(50);
  });

  it("returns minimum reorderQty when exactly at target", () => {
    expect(calculateRecommendedQty(75, 75, 50)).toBe(50);
  });
});

describe("calculateDaysUntilStockout", () => {
  it("returns floor(stock / consumption)", () => {
    expect(calculateDaysUntilStockout(100, 10)).toBe(10);
  });

  it("returns Infinity when no consumption", () => {
    expect(calculateDaysUntilStockout(100, 0)).toBe(Infinity);
  });

  it("handles fractional consumption", () => {
    // 100 / 3.3 = 30.3 → floor = 30
    expect(calculateDaysUntilStockout(100, 3.3)).toBe(30);
  });
});

describe("getAlertSeverity", () => {
  it("returns CRITICAL when stock is 0", () => {
    expect(getAlertSeverity(0, 10)).toBe("CRITICAL");
  });

  it("returns CRITICAL when stock is negative", () => {
    expect(getAlertSeverity(-5, 10)).toBe("CRITICAL");
  });

  it("returns LOW when stock equals reorderPoint", () => {
    expect(getAlertSeverity(10, 10)).toBe("LOW");
  });

  it("returns LOW when stock is below reorderPoint", () => {
    expect(getAlertSeverity(5, 10)).toBe("LOW");
  });

  it("returns WATCH when stock is between reorderPoint and 1.5x", () => {
    // 1.5 * 10 = 15, 12 < 15
    expect(getAlertSeverity(12, 10)).toBe("WATCH");
  });

  it("returns WATCH when stock equals 1.5x reorderPoint", () => {
    // ceil(10 * 1.5) = 15
    expect(getAlertSeverity(15, 10)).toBe("WATCH");
  });

  it("returns null when stock is healthy", () => {
    expect(getAlertSeverity(50, 10)).toBeNull();
  });
});

describe("computeReorderSuggestion", () => {
  it("computes full suggestion for a low-stock product", () => {
    const result = computeReorderSuggestion({
      productId: 1,
      stockQty: 5,
      reorderPoint: 10,
      reorderQty: 50,
      unitCost: 8.5,
      totalConsumed: 300,
      periodDays: 30,
      leadTimeDays: 5,
    });

    // avgDaily = 300/30 = 10
    // safetyStock = ceil(10 * 5 * 0.5) = 25
    // targetLevel = ceil(10 * 5 * 1.5) = 75
    // recommendedQty = max(75 - 5, 50) = 70
    // estimatedCost = 70 * 8.5 = 595
    // daysUntilStockout = floor(5 / 10) = 0
    expect(result.avgDailyConsumption).toBe(10);
    expect(result.safetyStock).toBe(25);
    expect(result.targetLevel).toBe(75);
    expect(result.recommendedQty).toBe(70);
    expect(result.estimatedCost).toBe(595);
    expect(result.daysUntilStockout).toBe(0);
    expect(result.severity).toBe("LOW");
  });

  it("computes CRITICAL severity for out-of-stock product", () => {
    const result = computeReorderSuggestion({
      productId: 2,
      stockQty: 0,
      reorderPoint: 20,
      reorderQty: 100,
      unitCost: 3.5,
      totalConsumed: 200,
      periodDays: 30,
      leadTimeDays: 7,
    });

    expect(result.severity).toBe("CRITICAL");
    expect(result.recommendedQty).toBeGreaterThan(0);
  });

  it("returns Infinity days for product with no consumption", () => {
    const result = computeReorderSuggestion({
      productId: 3,
      stockQty: 100,
      reorderPoint: 10,
      reorderQty: 50,
      unitCost: 5.0,
      totalConsumed: 0,
      periodDays: 30,
      leadTimeDays: 5,
    });

    expect(result.avgDailyConsumption).toBe(0);
    expect(result.daysUntilStockout).toBe(Infinity);
  });
});
