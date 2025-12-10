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
