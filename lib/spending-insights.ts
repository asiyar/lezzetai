export type ReceiptPurchase = {
  id: string;
  name: string;
  categoryKey: string;
  amount: number;
  purchasedOn: string;
  storeName?: string;
  barcode?: string;
};

export type SpendingCategory = { key: string; amount: number; count: number; share: number };

export function summarizeReceiptSpending(purchases: ReceiptPurchase[]) {
  const total = purchases.reduce((sum, purchase) => sum + Math.max(0, purchase.amount), 0);
  const groups = purchases.reduce<Record<string, { amount: number; count: number }>>((result, purchase) => {
    const current = result[purchase.categoryKey] ?? { amount: 0, count: 0 };
    result[purchase.categoryKey] = { amount: current.amount + Math.max(0, purchase.amount), count: current.count + 1 };
    return result;
  }, {});
  const categories: SpendingCategory[] = Object.entries(groups)
    .map(([key, value]) => ({ key, ...value, share: total ? Math.round(value.amount / total * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount);
  return { total, categories, topCategory: categories[0] ?? null, purchaseCount: purchases.length };
}
