import { VAT_RATE } from './payment';

export const NEWORDER_API_URL = process.env.NEWORDER_API_URL ?? 'https://neworderapi.azurewebsites.net';
export const NEWORDER_API_TOKEN = process.env.NEWORDER_API_TOKEN ?? '';

// branchId=1 is "נחלת בנימין 65 תל אביב" (main warehouse)
export const MAIN_BRANCH_ID = 1;

/**
 * Margin multipliers applied to costNoTax (pre-VAT cost from supplier).
 * Final B2B price = costNoTax * marginMultiplier * (1 + VAT_RATE)
 *
 * Category IDs from /api/Products/categories:
 *  1=כללי  2=מעבדה  3=מכשירים  4=שעונים חכמים  5=אוזניות
 *  6=אביזרים  7=ציוד היקפי  8=גיימינג  9=רכב  10=רמקולים
 *  11=מטענים  12=כבלים  13=כיסויים  14=אביזרי laut  15=אביזרי decoded
 *
 * TODO: Review these with Liron and adjust per category.
 * Current defaults: 1.3 = 30% margin above cost (before VAT).
 */
export const CATEGORY_MARGIN: Record<number, number> = {
  1:  1.3,  // כללי
  2:  1.4,  // מעבדה
  3:  1.25, // מכשירים
  4:  1.3,  // שעונים חכמים
  5:  1.35, // אוזניות
  6:  1.35, // אביזרים
  7:  1.3,  // ציוד היקפי
  8:  1.3,  // גיימינג
  9:  1.35, // רכב
  10: 1.35, // רמקולים
  11: 1.3,  // מטענים
  12: 1.4,  // כבלים
  13: 1.35, // כיסויים
  14: 1.3,  // אביזרי laut
  15: 1.3,  // אביזרי decoded
};

const DEFAULT_MARGIN = 1.3;

export function getMargin(categoryId: number): number {
  return CATEGORY_MARGIN[categoryId] ?? DEFAULT_MARGIN;
}

/** B2B price = costNoTax × margin × (1 + VAT) — what the customer pays */
export function calcB2BPrice(costNoTax: number, categoryId: number): number {
  return costNoTax * getMargin(categoryId) * (1 + VAT_RATE);
}
