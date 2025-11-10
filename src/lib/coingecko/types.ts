export interface CoinGeckoSimplePrice {
  [coinId: string]: {
    [currency: string]: number;
  };
}

export interface CryptoQuote {
  symbol: string;
  priceJPY: number;
}
