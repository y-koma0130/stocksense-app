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
  totalRevenue?: number;
  netIncome?: number;
  dilutedEPS?: number; // 希薄化後EPS
  basicEPS?: number; // 基本EPS
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
 * 最新のROEを計算
 * @param records - 日付順（古い順）にソートされたレコード
 * @returns ROE(%)
 */
const calculateLatestROE = (records: AnnualFinancialRecord[]): number | null => {
  // 最新のレコードから有効なデータを探す
  for (let i = records.length - 1; i >= 0; i--) {
    const record = records[i];
    if (
      typeof record.netIncome === "number" &&
      typeof record.stockholdersEquity === "number" &&
      record.stockholdersEquity > 0
    ) {
      return (record.netIncome / record.stockholdersEquity) * 100;
    }
  }
  return null;
};

/**
 * 売上の減少連続年数を計算
 * @param records - 日付順（古い順）にソートされたレコード
 * @returns 減少連続年数
 */
const calculateRevenueDeclineYears = (records: AnnualFinancialRecord[]): number | null => {
  const validRecords = records.filter(
    (r) => typeof r.totalRevenue === "number" && !Number.isNaN(r.totalRevenue),
  );

  if (validRecords.length < 2) return null;

  let declineYears = 0;
  // 最新から過去に向かって減少が続いているかチェック
  for (let i = validRecords.length - 1; i > 0; i--) {
    const current = validRecords[i].totalRevenue as number;
    const previous = validRecords[i - 1].totalRevenue as number;

    if (current < previous) {
      declineYears++;
    } else {
      break; // 減少が途切れたら終了
    }
  }

  return declineYears;
};

/**
 * EPSデータ（最新と3年前）を取得
 * @param records - 日付順（古い順）にソートされたレコード
 * @returns { epsLatest, eps3yAgo }
 */
const getEpsData = (
  records: AnnualFinancialRecord[],
): { epsLatest: number | null; eps3yAgo: number | null } => {
  // dilutedEPSを優先、なければbasicEPSを使用
  const getEps = (record: AnnualFinancialRecord): number | null => {
    if (typeof record.dilutedEPS === "number" && !Number.isNaN(record.dilutedEPS)) {
      return record.dilutedEPS;
    }
    if (typeof record.basicEPS === "number" && !Number.isNaN(record.basicEPS)) {
      return record.basicEPS;
    }
    return null;
  };

  // 有効なEPSを持つレコードを抽出
  const validRecords = records.filter((r) => getEps(r) !== null);

  if (validRecords.length === 0) {
    return { epsLatest: null, eps3yAgo: null };
  }

  // 最新のEPS
  const epsLatest = getEps(validRecords[validRecords.length - 1]);

  // 3年前のEPS（3年分以上のデータがある場合）
  // validRecordsは古い順なので、最新から3つ前のレコードを取得
  const eps3yAgo = validRecords.length >= 4 ? getEps(validRecords[validRecords.length - 4]) : null;

  return { epsLatest, eps3yAgo };
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
        roe: null,
        operatingIncomeDeclineYears: null,
        operatingCashFlowNegativeYears: null,
        revenueDeclineYears: null,
        epsLatest: null,
        eps3yAgo: null,
      });
    }

    // レコードを日付順（古い順）にソート
    const records = (result as AnnualFinancialRecord[]).sort((a, b) => {
      const dateA = typeof a.date === "number" ? a.date : a.date.getTime() / 1000;
      const dateB = typeof b.date === "number" ? b.date : b.date.getTime() / 1000;
      return dateA - dateB;
    });

    const equityRatio = calculateLatestEquityRatio(records);
    const roe = calculateLatestROE(records);
    const operatingIncomeDeclineYears = calculateOperatingIncomeDeclineYears(records);
    const operatingCashFlowNegativeYears = calculateOperatingCashFlowNegativeYears(records);
    const revenueDeclineYears = calculateRevenueDeclineYears(records);
    const { epsLatest, eps3yAgo } = getEpsData(records);

    return financialHealthDataDtoSchema.parse({
      tickerSymbol,
      equityRatio,
      roe,
      operatingIncomeDeclineYears,
      operatingCashFlowNegativeYears,
      revenueDeclineYears,
      epsLatest,
      eps3yAgo,
    });
  } catch (error) {
    console.error(`Error fetching financial health for ${tickerSymbol}:`, error);
    return {
      tickerSymbol,
      equityRatio: null,
      roe: null,
      operatingIncomeDeclineYears: null,
      operatingCashFlowNegativeYears: null,
      revenueDeclineYears: null,
      epsLatest: null,
      eps3yAgo: null,
    };
  }
};
