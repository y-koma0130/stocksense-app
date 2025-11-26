import { getBitcoinPrice } from "@/lib/coingecko/client";
import { convertGoldToGramJPY, getYahooQuotes } from "@/lib/yahooFinance/client";
import { feedbackRouter } from "@/server/features/feedback/presentation/router";
import { lineNotificationRouter } from "@/server/features/lineNotification/presentation/router";
import { valueStockScoringRouter } from "@/server/features/valueStockScoring/presentation/router";
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
        // JPY=X is USD/JPY forex pair from Yahoo Finance
        const [yahooQuotes, btcPrice] = await Promise.all([
          getYahooQuotes(["^N225", "^DJI", "^IXIC", "GC=F", "JPY=X"]), // Nikkei, Dow, NASDAQ, Gold Futures, USD/JPY
          getBitcoinPrice(),
        ]);

        const [nikkei, dow, nasdaq, goldFutures, usdJpy] = yahooQuotes;

        // Convert gold from USD/oz to JPY/gram
        const goldPriceJPYPerGram = convertGoldToGramJPY(goldFutures.price, usdJpy.price);
        const goldChangeJPYPerGram = convertGoldToGramJPY(goldFutures.change, usdJpy.price);

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
            price: usdJpy.price,
            change: usdJpy.change,
            changePercent: usdJpy.changePercent,
            currency: "¥",
          },
          {
            id: "btc",
            title: "BTC",
            price: btcPrice.priceJPY,
            // 24時間変動率から変動額を計算
            change:
              (btcPrice.priceJPY * btcPrice.changePercent24h) / (100 + btcPrice.changePercent24h),
            changePercent: btcPrice.changePercent24h,
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
  valueStockScoring: valueStockScoringRouter,
  lineNotification: lineNotificationRouter,
  feedback: feedbackRouter,
});

export type AppRouter = typeof appRouter;
