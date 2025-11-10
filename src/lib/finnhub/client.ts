import type { FinnhubError, FinnhubQuote, MarketQuote } from "./types";

const FINNHUB_API_BASE_URL = "https://finnhub.io/api/v1";

export class FinnhubClient {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Finnhub API key is required");
    }
    this.apiKey = apiKey;
  }

  /**
   * Get quote data for a symbol
   */
  async getQuote(symbol: string): Promise<MarketQuote> {
    const url = `${FINNHUB_API_BASE_URL}/quote?symbol=${symbol}&token=${this.apiKey}`;

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as FinnhubQuote | FinnhubError;

    if ("error" in data) {
      throw new Error(`Finnhub API error: ${data.error}`);
    }

    return {
      symbol,
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
    };
  }

  /**
   * Get quotes for multiple symbols
   */
  async getQuotes(symbols: string[]): Promise<MarketQuote[]> {
    const quotes = await Promise.all(symbols.map((symbol) => this.getQuote(symbol)));
    return quotes;
  }
}

/**
 * Create a Finnhub client instance
 */
export function createFinnhubClient(): FinnhubClient {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    throw new Error("FINNHUB_API_KEY environment variable is not set");
  }

  return new FinnhubClient(apiKey);
}
