import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

/**
 * 財務指標データの型定義
 */
export interface FundamentalsData {
  tickerSymbol: string;
  currentPrice: number | null;
  per: number | null; // Price-to-Earnings Ratio
  pbr: number | null; // Price-to-Book Ratio
  marketCap: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
}

/**
 * Yahoo FinanceからPER/PBR等の財務指標を取得
 *
 * @param tickerSymbol - 銘柄シンボル（例: "7203.T"）
 * @returns 財務指標データ
 */
export async function getFundamentals(tickerSymbol: string): Promise<FundamentalsData> {
  try {
    const result = await yahooFinance.quoteSummary(tickerSymbol, {
      modules: ["price", "summaryDetail", "defaultKeyStatistics"],
    });

    const price = result.price;
    const summaryDetail = result.summaryDetail;
    const keyStats = result.defaultKeyStatistics;

    const perValue = keyStats?.trailingPE ?? summaryDetail?.trailingPE;

    return {
      tickerSymbol,
      currentPrice: typeof price?.regularMarketPrice === "number" ? price.regularMarketPrice : null,
      per: typeof perValue === "number" ? perValue : null,
      pbr: typeof keyStats?.priceToBook === "number" ? keyStats.priceToBook : null,
      marketCap: typeof price?.marketCap === "number" ? price.marketCap : null,
      fiftyTwoWeekHigh:
        typeof summaryDetail?.fiftyTwoWeekHigh === "number" ? summaryDetail.fiftyTwoWeekHigh : null,
      fiftyTwoWeekLow:
        typeof summaryDetail?.fiftyTwoWeekLow === "number" ? summaryDetail.fiftyTwoWeekLow : null,
    };
  } catch (error) {
    console.error(`Error fetching fundamentals for ${tickerSymbol}:`, error);
    return {
      tickerSymbol,
      currentPrice: null,
      per: null,
      pbr: null,
      marketCap: null,
      fiftyTwoWeekHigh: null,
      fiftyTwoWeekLow: null,
    };
  }
}

/**
 * 複数銘柄の財務指標を一括取得
 *
 * @param tickerSymbols - 銘柄シンボルの配列
 * @param delayMs - 各リクエスト間の遅延時間（ミリ秒）
 * @returns 財務指標データの配列
 */
export async function getBatchFundamentals(
  tickerSymbols: string[],
  delayMs = 100,
): Promise<FundamentalsData[]> {
  const results: FundamentalsData[] = [];

  for (const symbol of tickerSymbols) {
    const data = await getFundamentals(symbol);
    results.push(data);

    // レート制限対策
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
