import YahooFinance from "yahoo-finance2";
import type { YahooQuoteData } from "./types";

const yahooFinance = new YahooFinance();

/**
 * 複数シンボルの株価データを取得
 * マーケットデータ表示用（株価指数、金価格など）
 */
export const getYahooQuotes = async (symbols: string[]): Promise<YahooQuoteData[]> => {
  const quotes = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const quote = await yahooFinance.quote(symbol);

        return {
          symbol,
          price: quote.regularMarketPrice ?? 0,
          change: quote.regularMarketChange ?? 0,
          changePercent: quote.regularMarketChangePercent ?? 0,
        };
      } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error);
        return {
          symbol,
          price: 0,
          change: 0,
          changePercent: 0,
        };
      }
    }),
  );

  return quotes;
};

/**
 * 金価格をUSD/ozからJPY/gramに変換
 * 1トロイオンス = 31.1034768グラム
 */
export const convertGoldToGramJPY = (priceUSD: number, usdJpyRate: number): number => {
  const TROY_OUNCE_TO_GRAM = 31.1034768;
  return (priceUSD / TROY_OUNCE_TO_GRAM) * usdJpyRate;
};
