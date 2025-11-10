import YahooFinance from "yahoo-finance2";
import type { MarketQuote } from "./types";

const yahooFinance = new YahooFinance();

/**
 * Get quote data from Yahoo Finance
 */
export async function getYahooQuote(symbol: string): Promise<MarketQuote> {
  const quote = await yahooFinance.quote(symbol);

  return {
    symbol,
    price: quote.regularMarketPrice ?? 0,
    change: quote.regularMarketChange ?? 0,
    changePercent: quote.regularMarketChangePercent ?? 0,
    previousClose: quote.regularMarketPreviousClose ?? 0,
  };
}

/**
 * Get multiple quotes from Yahoo Finance
 */
export async function getYahooQuotes(symbols: string[]): Promise<MarketQuote[]> {
  const quotes = await Promise.all(symbols.map((symbol) => getYahooQuote(symbol)));
  return quotes;
}

/**
 * Convert gold price from USD/troy oz to JPY/gram
 */
export function convertGoldToGramJPY(priceUSDPerOz: number, usdJpyRate: number): number {
  const TROY_OZ_TO_GRAM = 31.1035;
  return (priceUSDPerOz / TROY_OZ_TO_GRAM) * usdJpyRate;
}
