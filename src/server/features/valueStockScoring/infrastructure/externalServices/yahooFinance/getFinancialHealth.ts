import YahooFinance from "yahoo-finance2";
import {
  type FinancialHealthDataDto,
  financialHealthDataDtoSchema,
} from "../../../application/dto/yahooFinance.dto";

const yahooFinance = new YahooFinance();

/**
 * 財務健全性データの年次レコード型
 */
type AnnualFinancialRecord = {
  date: number | Date;
  operatingIncome?: number;
  operatingCashFlow?: number;
  stockholdersEquity?: number;
  totalAssets?: number;
};

/**
 * 財務健全性データを取得する関数の型定義
 */
export type GetFinancialHealth = (tickerSymbol: string) => Promise<FinancialHealthDataDto>;

/**
 * 営業利益の減少連続年数を計算
 * @param records - 日付順（古い順）にソートされたレコード
 * @returns 減少連続年数
 */
const calculateOperatingIncomeDeclineYears = (records: AnnualFinancialRecord[]): number | null => {
  const validRecords = records.filter(
    (r) => typeof r.operatingIncome === "number" && !Number.isNaN(r.operatingIncome),
  );

  if (validRecords.length < 2) return null;

  let declineYears = 0;
  // 最新から過去に向かって減少が続いているかチェック
  for (let i = validRecords.length - 1; i > 0; i--) {
    const current = validRecords[i].operatingIncome as number;
    const previous = validRecords[i - 1].operatingIncome as number;

    if (current < previous) {
      declineYears++;
    } else {
      break; // 減少が途切れたら終了
    }
  }

  return declineYears;
};

/**
 * 営業CFが負の連続年数を計算
 * @param records - 日付順（古い順）にソートされたレコード
 * @returns 負の連続年数
 */
const calculateOperatingCashFlowNegativeYears = (
  records: AnnualFinancialRecord[],
): number | null => {
  const validRecords = records.filter(
    (r) => typeof r.operatingCashFlow === "number" && !Number.isNaN(r.operatingCashFlow),
  );

  if (validRecords.length < 1) return null;

  let negativeYears = 0;
  // 最新から過去に向かって負が続いているかチェック
  for (let i = validRecords.length - 1; i >= 0; i--) {
    const ocf = validRecords[i].operatingCashFlow as number;

    if (ocf < 0) {
      negativeYears++;
    } else {
      break; // 正に転じたら終了
    }
  }

  return negativeYears;
};

/**
 * 最新の自己資本比率を計算
 * @param records - 日付順（古い順）にソートされたレコード
 * @returns 自己資本比率(%)
 */
const calculateLatestEquityRatio = (records: AnnualFinancialRecord[]): number | null => {
  // 最新のレコードから有効なデータを探す
  for (let i = records.length - 1; i >= 0; i--) {
    const record = records[i];
    if (
      typeof record.stockholdersEquity === "number" &&
      typeof record.totalAssets === "number" &&
      record.totalAssets > 0
    ) {
      return (record.stockholdersEquity / record.totalAssets) * 100;
    }
  }
  return null;
};

/**
 * Yahoo Financeから財務健全性データを取得
 * fundamentalsTimeSeriesを使用（バリデーションスキップ）
 */
export const getFinancialHealth: GetFinancialHealth = async (tickerSymbol) => {
  try {
    // 過去5年分のデータを取得
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    const result = await yahooFinance.fundamentalsTimeSeries(
      tickerSymbol,
      {
        period1: fiveYearsAgo.toISOString().split("T")[0],
        period2: new Date().toISOString().split("T")[0],
        type: "annual",
        module: "all",
      },
      { validateResult: false },
    );

    if (!result || result.length === 0) {
      return financialHealthDataDtoSchema.parse({
        tickerSymbol,
        equityRatio: null,
        operatingIncomeDeclineYears: null,
        operatingCashFlowNegativeYears: null,
      });
    }

    // レコードを日付順（古い順）にソート
    const records = (result as AnnualFinancialRecord[]).sort((a, b) => {
      const dateA = typeof a.date === "number" ? a.date : a.date.getTime() / 1000;
      const dateB = typeof b.date === "number" ? b.date : b.date.getTime() / 1000;
      return dateA - dateB;
    });

    const equityRatio = calculateLatestEquityRatio(records);
    const operatingIncomeDeclineYears = calculateOperatingIncomeDeclineYears(records);
    const operatingCashFlowNegativeYears = calculateOperatingCashFlowNegativeYears(records);

    return financialHealthDataDtoSchema.parse({
      tickerSymbol,
      equityRatio,
      operatingIncomeDeclineYears,
      operatingCashFlowNegativeYears,
    });
  } catch (error) {
    console.error(`Error fetching financial health for ${tickerSymbol}:`, error);
    return {
      tickerSymbol,
      equityRatio: null,
      operatingIncomeDeclineYears: null,
      operatingCashFlowNegativeYears: null,
    };
  }
};
