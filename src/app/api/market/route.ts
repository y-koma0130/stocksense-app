import { NextResponse } from "next/server";
import { getBitcoinPrice } from "@/lib/coingecko/client";
import { getUSDJPYRate } from "@/lib/exchange-rate/client";
import { convertGoldToGramJPY, getYahooQuotes } from "@/lib/yahoo-finance/client";

export const dynamic = "force-dynamic";

interface MarketData {
  id: string;
  title: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export async function GET() {
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

    // Calculate BTC change (CoinGecko doesn't provide change, so we'll calculate from previous close if needed)
    // For now, we'll use 0 for change until we implement historical data
    const btcChange = 0;
    const btcChangePercent = 0;

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
        change: btcChange,
        changePercent: btcChangePercent,
        currency: "¥",
      },
    ];

    return NextResponse.json(marketData);
  } catch (error) {
    console.error("Error fetching market data:", error);
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 });
  }
}
