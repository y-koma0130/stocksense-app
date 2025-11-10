export interface ExchangeRateResponse {
  base: string;
  date: string;
  time_last_updated: number;
  rates: {
    [currency: string]: number;
  };
}

export interface ForexQuote {
  pair: string;
  rate: number;
}
