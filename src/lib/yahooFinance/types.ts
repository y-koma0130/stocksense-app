/**
 * Yahoo Finance APIのレスポンス型定義
 */
export type YahooQuoteData = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
};
