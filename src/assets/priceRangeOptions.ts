/**
 * 価格帯オプション（最小値）
 */
export const PRICE_MIN_OPTIONS = [
  { value: "", label: "指定なし" },
  { value: "500", label: "500円以上" },
  { value: "1000", label: "1,000円以上" },
  { value: "3000", label: "3,000円以上" },
  { value: "5000", label: "5,000円以上" },
  { value: "8000", label: "8,000円以上" },
  { value: "10000", label: "10,000円以上" },
] as const;

/**
 * 価格帯オプション（最大値）
 */
export const PRICE_MAX_OPTIONS = [
  { value: "", label: "指定なし" },
  { value: "500", label: "500円以下" },
  { value: "1000", label: "1,000円以下" },
  { value: "3000", label: "3,000円以下" },
  { value: "5000", label: "5,000円以下" },
  { value: "8000", label: "8,000円以下" },
  { value: "10000", label: "10,000円以下" },
] as const;

export type PriceMinOption = (typeof PRICE_MIN_OPTIONS)[number];
export type PriceMaxOption = (typeof PRICE_MAX_OPTIONS)[number];
