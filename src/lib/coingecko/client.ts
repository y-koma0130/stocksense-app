import type { CoinGeckoSimplePrice, CryptoQuote } from "./types";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

/**
 * Get Bitcoin price in JPY from CoinGecko with 24h change
 */
export async function getBitcoinPrice(): Promise<CryptoQuote> {
  const url = `${COINGECKO_API_BASE}/simple/price?ids=bitcoin&vs_currencies=jpy&include_24hr_change=true`;

  const response = await fetch(url, {
    next: { revalidate: 60 }, // Cache for 1 minute
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as CoinGeckoSimplePrice;

  return {
    symbol: "BTC",
    priceJPY: data.bitcoin.jpy,
    changePercent24h: data.bitcoin.jpy_24h_change ?? 0,
  };
}
