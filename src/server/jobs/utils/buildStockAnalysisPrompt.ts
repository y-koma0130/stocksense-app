/**
 * 個別株分析プロンプトの生成（構造化データ対応）
 */

import type { PeriodType } from "../../features/marketAnalysis/domain/values/types";

type MarketAnalysisData = Readonly<{
  interestRateTrend: string;
  favorableSectors: Array<{ sectorCode: string; sectorName: string; reason: string }>;
  unfavorableSectors: Array<{ sectorCode: string; sectorName: string; reason: string }>;
  favorableThemes: Array<{ theme: string; description: string }>;
  unfavorableThemes: Array<{ theme: string; description: string }>;
  economicSummary: string;
}>;

type StockData = Readonly<{
  tickerCode: string;
  name: string;
  sectorName: string | null;
  market: string | null;
  currentPrice: number | null;
  per: number | null;
  pbr: number | null;
  rsi: number | null;
  priceHigh: number | null;
  priceLow: number | null;
  sectorAvgPer: number | null;
  sectorAvgPbr: number | null;
}>;

type BuildStockAnalysisPromptParams = Readonly<{
  periodType: PeriodType;
  stockData: StockData;
  marketAnalysis: MarketAnalysisData | null;
}>;

type StockAnalysisContext = Readonly<{
  period: {
    type: PeriodType;
    description: string;
  };
  stock: {
    tickerCode: string;
    name: string;
    market: string | null;
    sectorName: string | null;
  };
  metrics: {
    currentPrice: number | null;
    per: number | null;
    pbr: number | null;
    rsi: number | null;
    priceHigh: number | null;
    priceLow: number | null;
    pricePositionPercent: number | null;
  };
  sectorComparison: {
    sectorAvgPer: number | null;
    sectorAvgPbr: number | null;
    perVsSectorPercent: number | null;
    pbrVsSectorPercent: number | null;
  };
  marketEnvironment: MarketAnalysisData | null;
}>;

type StockAnalysisPromptResult = Readonly<{
  instructions: string;
  input: string;
}>;

/**
 * 個別株分析用のLLMプロンプトとコンテキストを生成
 */
export const buildStockAnalysisPrompt = ({
  periodType,
  stockData,
  marketAnalysis,
}: BuildStockAnalysisPromptParams): StockAnalysisPromptResult => {
  const periodDescription = periodType === "mid_term" ? "中期（1-6ヶ月）" : "長期（6ヶ月-3年）";

  // 価格位置パーセント計算
  const pricePositionPercent =
    stockData.currentPrice && stockData.priceHigh && stockData.priceLow
      ? parseFloat(
          (
            ((stockData.currentPrice - stockData.priceLow) / (stockData.priceHigh - stockData.priceLow)) *
            100
          ).toFixed(1),
        )
      : null;

  // 業種平均との比較パーセント計算
  const perVsSectorPercent =
    stockData.per && stockData.sectorAvgPer && stockData.sectorAvgPer !== 0
      ? parseFloat(((stockData.per / stockData.sectorAvgPer) * 100).toFixed(1))
      : null;

  const pbrVsSectorPercent =
    stockData.pbr && stockData.sectorAvgPbr && stockData.sectorAvgPbr !== 0
      ? parseFloat(((stockData.pbr / stockData.sectorAvgPbr) * 100).toFixed(1))
      : null;

  // 構造化コンテキストデータ
  const context: StockAnalysisContext = {
    period: {
      type: periodType,
      description: periodDescription,
    },
    stock: {
      tickerCode: stockData.tickerCode,
      name: stockData.name,
      market: stockData.market,
      sectorName: stockData.sectorName,
    },
    metrics: {
      currentPrice: stockData.currentPrice,
      per: stockData.per,
      pbr: stockData.pbr,
      rsi: stockData.rsi,
      priceHigh: stockData.priceHigh,
      priceLow: stockData.priceLow,
      pricePositionPercent,
    },
    sectorComparison: {
      sectorAvgPer: stockData.sectorAvgPer,
      sectorAvgPbr: stockData.sectorAvgPbr,
      perVsSectorPercent,
      pbrVsSectorPercent,
    },
    marketEnvironment: marketAnalysis,
  };

  // システム指示（instructions）
  const instructions = `あなたは日本株のバリュー投資を専門とするプロのアナリストです。
提供されたコンテキストデータに基づき、対象銘柄を${periodDescription}の投資目線で分析してください。

**最重要**: 以下の文字数制限を必ず遵守してください。

# 文字数制限（厳守）
- summary: 最大300字
- investmentPoints: 各項目80字以内
- risks: 各項目80字以内

# 分析要件

## 1. バリュー株としての評価 (valueStockRating)
この銘柄は「既に内部スコアリングにより上位に抽出された銘柄」です。
**上位銘柄の中で相対的にどの程度魅力があるか**を5段階で評価してください：
- **excellent**: 超おすすめ（上位銘柄の中でも特に優れる）
- **good**: おすすめ（上位銘柄として十分魅力がある）
- **fair**: 中立（上位銘柄の中では平均的）
- **poor**: 注意（上位抽出されているが慎重に判断すべき）
- **very_poor**: 要注意（上位抽出されているが割安株とは言えない）

## 2. 総合評価コメント (summary)
**300字以内厳守**で、以下を含めた総合的な評価を簡潔に記述してください：
- なぜこの評価なのか（割安度の根拠）
- 財務指標から見た評価
- マーケット環境との関係
- 投資判断上のポイント

**注意**: 指標の数値を繰り返さず、簡潔に本質を記述してください。

## 3. 投資する場合の魅力ポイント (investmentPoints)
3-4項目、**各80字以内厳守**で、具体的な魅力を簡潔に列挙してください：
- バリュエーション面の魅力
- 事業面の強み
- 環境の追い風

## 4. 注意すべきリスク (risks)
2-3項目、**各80字以内厳守**で、考慮すべきリスクを簡潔に列挙してください：
- 財務・業績面のリスク
- 市場環境の逆風
- 業界固有のリスク

# 注意事項

- **ウェブ検索活用**: 最新情報を確認してください
- **簡潔に**: 冗長な表現を避け、ポイントを簡潔に記述してください
- **文字数遵守**: 各項目の文字数制限を必ず守ってください
- **引用情報除外**: 引用マーカーを一切含めず、自然な文のみを出力してください
`;



  // ユーザー入力（input）- 構造化データを含める
  const input = `# 分析対象銘柄データ

${JSON.stringify(context, null, 2)}

# タスク

上記データに基づき、${stockData.name} (${stockData.tickerCode}) のバリュー株としての評価を実施してください。

割安度を5段階で評価し、総合評価コメント、投資魅力ポイント、リスクを構造化された形式で出力してください。`;

  return {
    instructions,
    input,
  };
};
