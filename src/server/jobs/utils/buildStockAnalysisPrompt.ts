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
提供されたコンテキストデータに基づき、対象銘柄を${periodDescription}の投資目線で詳細に分析してください。

**重要**: この分析は「バリュー株（割安株）」としての評価です。投資推奨ではなく、割安度の評価に焦点を当ててください。

# 分析要件

## 1. バリュー株としての評価 (valueStockRating)
この銘柄は「既に内部スコアリングにより上位に抽出された銘柄」であり、
本分析は「上位銘柄の中で相対的にどの程度魅力があるか」を評価することが目的です。
**5段階評価で、割安度を評価してください（以下の値から選択）**
- **excellent**: 上位銘柄の中でも特に優れる
- **good**: 上位銘柄として十分魅力がある
- **fair**: 上位銘柄の中では平均的
- **poor**: 上位抽出されているが慎重に判断すべき
- **very_poor**: 上位抽出されているが割安株とは言えない

## 2. 評価理由 (rationale)
200字以内で、上記評価の根拠を簡潔に説明してください。

## 3. 強み・魅力ポイント (strengths)
3-5項目、各80字以内で列挙してください：
- バリュエーション面の魅力
- 事業・財務面の強み
- マーケット環境との整合性
- セクター内での優位性

## 4. リスク・懸念点 (risks)
2-3項目、各80字以内で列挙してください：
- 財務・業績面のリスク
- 市場環境の逆風
- セクター固有のリスク
- テクニカル面の懸念

## 5. 財務分析コメント (financialAnalysis)
150字以内で、PER/PBRなどの財務指標から見た割安度を分析してください。

## 6. セクター内位置づけ (sectorPosition)
100字以内で、同業種内での相対的な位置づけを評価してください。

# 重要な注意事項

- **ウェブ検索を活用**: 最新のニュース、業績発表、市場動向を必ず確認してください
- **マーケット環境との整合性**: コンテキストのマーケット分析結果を踏まえて評価してください
- **バリュー投資の視点**: 割安度を最重視し、本質的価値との乖離を評価してください
- **文字数制限を厳守**: 各項目の文字数制限を必ず守ってください
- **引用情報は出力に含めないこと**: ウェブ検索結果の引用マーカーを一切含めず、純粋な分析文のみを出力してください

# ウェブ検索に関する重要要件

- 必ず銘柄名 + 業種 + 市場 の3要素でウェブ検索を行うこと
- 対象の投資期間の情報を優先すること
- 検索結果から得た情報で「定性分析パート」を補完すること
- ただし引用マーカーは使わず、自然な文だけで記述すること
- 検索を行わないと成立しない文章を必ず1つ以上含めること
`;



  // ユーザー入力（input）- 構造化データを含める
  const input = `# 分析対象銘柄データ

${JSON.stringify(context, null, 2)}

# タスク

上記データに基づき、${stockData.name} (${stockData.tickerCode}) のバリュー株としての評価を実施してください。

指標データとマーケット環境を踏まえ、割安度を5段階で評価し、根拠となる理由、強み、リスク、財務分析、セクター内位置づけを構造化された形式で出力してください。`;

  return {
    instructions,
    input,
  };
};
