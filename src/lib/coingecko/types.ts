export type CoinGeckoSimplePrice = {
  [coinId: string]: {
    jpy: number;
    jpy_24h_change?: number;
  };
};

export type CryptoQuote = {
  symbol: string;
  priceJPY: number;
  changePercent24h: number;
};
