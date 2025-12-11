/**
 * 市場区分オプション
 */
export const MARKET_OPTIONS = [
  { value: "プライム", label: "プライム" },
  { value: "スタンダード", label: "スタンダード" },
  { value: "グロース", label: "グロース" },
] as const;

export type MarketOption = (typeof MARKET_OPTIONS)[number];
export type MarketValue = MarketOption["value"];

/**
 * 市場の値一覧（Zodバリデーション用）
 */
export const MARKET_VALUES = [
  "プライム",
  "スタンダード",
  "グロース",
] as const satisfies readonly MarketValue[];
