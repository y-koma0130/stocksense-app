export interface MarketIndex {
  id: string;
  title: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export const mockMarketData: MarketIndex[] = [
  {
    id: "nikkei",
    title: "日経平均",
    price: 33442.88,
    change: 245.32,
    changePercent: 0.74,
    currency: "¥",
  },
  {
    id: "dow",
    title: "ダウ平均",
    price: 37986.4,
    change: -57.94,
    changePercent: -0.15,
    currency: "$",
  },
  {
    id: "sp500",
    title: "S&P 500",
    price: 5268.45,
    change: 12.85,
    changePercent: 0.24,
    currency: "$",
  },
  {
    id: "gold",
    title: "金価格",
    price: 2384.6,
    change: -18.3,
    changePercent: -0.76,
    currency: "$",
  },
  {
    id: "btc",
    title: "BTC",
    price: 67234.5,
    change: 1842.3,
    changePercent: 2.82,
    currency: "$",
  },
];
