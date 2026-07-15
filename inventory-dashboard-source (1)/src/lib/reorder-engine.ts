/**
 * Reorder Recommendation Engine
 *
 * Computes reorder suggestions based on consumption patterns.
 * Formula: recommendedQty = ceil(avgDailyConsumption × leadTimeDays × 1.5) - currentStock
 *          safetyStock     = avgDailyConsumption × leadTimeDays × 0.5
 *          targetLevel     = avgDailyConsumption × leadTimeDays × 1.5
 *
 * Alert thresholds:
 *   CRITICAL → stockQty === 0
 *   LOW      → stockQty <= reorderPoint (but > 0)
 *   WATCH    → stockQty <= ceil(reorderPoint × 1.5)
 */

export type AlertSeverity = "CRITICAL" | "LOW" | "WATCH";

export interface ConsumptionInput {
  productId: number;
  stockQty: number;
  reorderPoint: number;
  reorderQty: number;
  unitCost: number;
  /** total OUT movement qty over the period */
  totalConsumed: number;
  /** number of days in the consumption period */
  periodDays: number;
  leadTimeDays: number;
}

export interface ReorderSuggestion {
  productId: number;
  avgDailyConsumption: number;
  safetyStock: number;
  targetLevel: number;
  recommendedQty: number;
  estimatedCost: number;
  daysUntilStockout: number;
  severity: AlertSeverity;
}

/**
 * Calculate average daily consumption rate.
 * Returns 0 if period is 0 or no consumption recorded.
 */
export function calculateAvgDailyConsumption(
  totalConsumed: number,
  periodDays: number
): number {
  if (periodDays <= 0) return 0;
  return totalConsumed / periodDays;
}

/**
 * Calculate safety stock = avgDailyConsumption × leadTimeDays × 0.5
 */
export function calculateSafetyStock(
  avgDailyConsumption: number,
  leadTimeDays: number
): number {
  return Math.ceil(avgDailyConsumption * leadTimeDays * 0.5);
}

/**
 * Calculate target stock level = avgDailyConsumption × leadTimeDays × 1.5
 * This is the desired on-hand qty after a reorder arrives.
 */
export function calculateTargetLevel(
  avgDailyConsumption: number,
  leadTimeDays: number
): number {
  return Math.ceil(avgDailyConsumption * leadTimeDays * 1.5);
}

/**
 * Calculate recommended reorder quantity.
 * = targetLevel - currentStock (clamped to >= reorderQty minimum)
 */
export function calculateRecommendedQty(
  targetLevel: number,
  currentStock: number,
  minReorderQty: number
): number {
  const needed = targetLevel - currentStock;
  return Math.max(needed, minReorderQty);
}

/**
 * Estimate how many days until stock runs out at current consumption rate.
 * Returns Infinity if no consumption.
 */
export function calculateDaysUntilStockout(
  stockQty: number,
  avgDailyConsumption: number
): number {
  if (avgDailyConsumption <= 0) return Infinity;
  return Math.floor(stockQty / avgDailyConsumption);
}

/**
 * Determine alert severity for a product based on stock level vs reorder point.
 */
export function getAlertSeverity(
  stockQty: number,
  reorderPoint: number
): AlertSeverity | null {
  if (stockQty <= 0) return "CRITICAL";
  if (stockQty <= reorderPoint) return "LOW";
  if (stockQty <= Math.ceil(reorderPoint * 1.5)) return "WATCH";
  return null;
}

/**
 * Full reorder suggestion computation for a single product.
 */
export function computeReorderSuggestion(
  input: ConsumptionInput
): ReorderSuggestion {
  const avgDailyConsumption = calculateAvgDailyConsumption(
    input.totalConsumed,
    input.periodDays
  );
  const safetyStock = calculateSafetyStock(
    avgDailyConsumption,
    input.leadTimeDays
  );
  const targetLevel = calculateTargetLevel(
    avgDailyConsumption,
    input.leadTimeDays
  );
  const recommendedQty = calculateRecommendedQty(
    targetLevel,
    input.stockQty,
    input.reorderQty
  );
  const estimatedCost = recommendedQty * input.unitCost;
  const daysUntilStockout = calculateDaysUntilStockout(
    input.stockQty,
    avgDailyConsumption
  );
  const severity = getAlertSeverity(input.stockQty, input.reorderPoint);

  return {
    productId: input.productId,
    avgDailyConsumption: Math.round(avgDailyConsumption * 100) / 100,
    safetyStock,
    targetLevel,
    recommendedQty,
    estimatedCost: Math.round(estimatedCost * 100) / 100,
    daysUntilStockout,
    severity: severity ?? "WATCH",
  };
}
