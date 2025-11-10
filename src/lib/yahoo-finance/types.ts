export interface YahooQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketPreviousClose: number;
}

export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
}
