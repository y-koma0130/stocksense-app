import type { ExchangeRateResponse, ForexQuote } from "./types";

const EXCHANGE_RATE_API_BASE = "https://api.exchangerate-api.com/v4/latest";

/**
 * Get USD/JPY exchange rate
 */
export async function getUSDJPYRate(): Promise<ForexQuote> {
  const url = `${EXCHANGE_RATE_API_BASE}/USD`;

  const response = await fetch(url, {
    next: { revalidate: 3600 }, // Cache for 1 hour (rates update once per day)
  });

  if (!response.ok) {
    throw new Error(`ExchangeRate API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as ExchangeRateResponse;

  return {
    pair: "USDJPY",
    rate: data.rates.JPY,
  };
}
