import { getBitcoinPrice } from "@/lib/coingecko/client";
import { getUSDJPYRate } from "@/lib/exchange-rate/client";
import { convertGoldToGramJPY, getYahooQuotes } from "@/lib/yahooFinance/client";
import { publicProcedure, router } from "./init";

export interface MarketData {
  id: string;
  title: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export const appRouter = router({
  market: router({
    getAll: publicProcedure.query(async (): Promise<MarketData[]> => {
      try {
        // Fetch all data in parallel
        const [yahooQuotes, btcPrice, usdJpyRate] = await Promise.all([
          getYahooQuotes(["^N225", "^DJI", "^IXIC", "GC=F"]), // Nikkei, Dow, NASDAQ, Gold Futures
          getBitcoinPrice(),
          getUSDJPYRate(),
        ]);

        const [nikkei, dow, nasdaq, goldFutures] = yahooQuotes;

        // Convert gold from USD/oz to JPY/gram
        const goldPriceJPYPerGram = convertGoldToGramJPY(goldFutures.price, usdJpyRate.rate);
        const goldChangeJPYPerGram = convertGoldToGramJPY(goldFutures.change, usdJpyRate.rate);

        const marketData: MarketData[] = [
          {
            id: "nikkei",
            title: "日経平均",
            price: nikkei.price,
            change: nikkei.change,
            changePercent: nikkei.changePercent,
            currency: "¥",
          },
          {
            id: "dow",
            title: "ダウ平均30種",
            price: dow.price,
            change: dow.change,
            changePercent: dow.changePercent,
            currency: "$",
          },
          {
            id: "nasdaq",
            title: "NASDAQ総合",
            price: nasdaq.price,
            change: nasdaq.change,
            changePercent: nasdaq.changePercent,
            currency: "$",
          },
          {
            id: "gold",
            title: "金価格 (1gあたり)",
            price: goldPriceJPYPerGram,
            change: goldChangeJPYPerGram,
            changePercent: goldFutures.changePercent,
            currency: "¥",
          },
          {
            id: "usdjpy",
            title: "ドル円",
            price: usdJpyRate.rate,
            change: 0, // ExchangeRate API doesn't provide daily change
            changePercent: 0,
            currency: "¥",
          },
          {
            id: "btc",
            title: "BTC",
            price: btcPrice.priceJPY,
            change: 0, // CoinGecko free tier doesn't provide change
            changePercent: 0,
            currency: "¥",
          },
        ];

        return marketData;
      } catch (error) {
        console.error("Error fetching market data:", error);
        throw new Error("Failed to fetch market data");
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
