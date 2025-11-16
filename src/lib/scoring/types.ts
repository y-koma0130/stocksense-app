/**
 * スコアリング用の入力データ型
 */
export interface ScoringInput {
  tickerSymbol: string;
  stockId: string;
  currentPrice: number;
  per: number | null;
  pbr: number | null;
  rsi: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  sectorCode: string | null;
  sectorAvgPer: number | null;
  sectorAvgPbr: number | null;
}

/**
 * スコアリング結果の型
 */
export interface ScoringResult {
  stockId: string;
  tickerSymbol: string;
  scoreType: "mid_term" | "long_term";
  perScore: number;
  pbrScore: number;
  rsiScore: number;
  priceRangeScore: number;
  sectorScore: number;
  totalScore: number;
}

/**
 * スコアリング設定の型
 */
export interface ScoringConfig {
  // PERスコア設定
  perWeight: number;
  perThresholds: {
    veryLow: number; // 10以下
    low: number; // 15以下
  };

  // PBRスコア設定
  pbrWeight: number;
  pbrThresholds: {
    veryLow: number; // 0.8以下
    low: number; // 1.0以下
  };

  // RSIスコア設定
  rsiWeight: number;
  rsiThresholds: {
    oversold: number; // 30以下
    moderate: number; // 40以下
  };

  // 価格レンジスコア設定
  priceRangeWeight: number;
  priceRangeThresholds: {
    veryLow: number; // 0.3以下（安値圏）
    low: number; // 0.4以下
  };

  // 業種比較スコア設定
  sectorWeight: number;
  sectorThresholds: {
    muchLower: number; // 業種平均の70%以下
    lower: number; // 業種平均の85%以下
  };
}
