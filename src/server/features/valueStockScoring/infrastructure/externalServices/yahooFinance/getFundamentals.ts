import YahooFinance from "yahoo-finance2";
import {
  type FundamentalsDataDto,
  fundamentalsDataDtoSchema,
} from "../../../application/dto/yahooFinance.dto";

const yahooFinance = new YahooFinance();

/**
 * Yahoo FinanceからPER/PBR等の財務指標を取得
 */
export const getFundamentals = async (tickerSymbol: string): Promise<FundamentalsDataDto> => {
  try {
    const result = await yahooFinance.quoteSummary(tickerSymbol, {
      modules: ["price", "summaryDetail", "defaultKeyStatistics"],
    });

    const price = result.price;
    const summaryDetail = result.summaryDetail;
    const keyStats = result.defaultKeyStatistics;
    const perValue = keyStats?.trailingPE ?? summaryDetail?.trailingPE;

    const rawData = {
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

    return fundamentalsDataDtoSchema.parse(rawData);
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
};
