/**
 * 長期銘柄分析プロンプトビルダー
 */

import type { MarketAnalysisDto } from "@/server/features/marketAnalysis/application/dto/marketAnalysis.dto";
import { calculateEpsGrowthRate } from "@/server/features/valueStockScoring/domain/services/calculateEpsGrowthRate.service";
import type { LongTermStockIndicatorDto } from "../../application/dto/longTermStockIndicator.dto";

/**
 * プロンプトビルダーのパラメータ
 */
type BuildLongTermAnalysisPromptParams = Readonly<{
  stockData: LongTermStockIndicatorDto;
  marketAnalysis: MarketAnalysisDto | null;
}>;

/**
 * プロンプトビルダーの戻り値
 */
type AnalysisPromptResult = Readonly<{
  instructions: string;
  input: string;
}>;

/**
 * 長期分析用コンテキストデータ
 */
type LongTermAnalysisContext = Readonly<{
  period: {
    type: "long_term";
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
    epsLatest: number | null;
    eps3yAgo: number | null;
    epsGrowthRatePercent: number | null;
  };
  sectorComparison: {
    sectorAvgPer: number | null;
    sectorAvgPbr: number | null;
    perVsSectorPercent: number | null;
    pbrVsSectorPercent: number | null;
  };
  marketEnvironment: MarketAnalysisDto | null;
}>;

/**
 * 長期銘柄分析用のLLMプロンプトを生成
 */
export const buildLongTermAnalysisPrompt = ({
  stockData,
  marketAnalysis,
}: BuildLongTermAnalysisPromptParams): AnalysisPromptResult => {
  // 価格位置パーセント計算
  const pricePositionPercent =
    stockData.currentPrice !== null &&
    stockData.priceHigh !== null &&
    stockData.priceLow !== null &&
    stockData.priceHigh !== stockData.priceLow
      ? parseFloat(
          (
            ((stockData.currentPrice - stockData.priceLow) /
              (stockData.priceHigh - stockData.priceLow)) *
            100
          ).toFixed(1),
        )
      : null;

  // 業種平均との比較パーセント計算
  const perVsSectorPercent =
    stockData.per !== null && stockData.sectorAvgPer !== null && stockData.sectorAvgPer !== 0
      ? parseFloat(((stockData.per / stockData.sectorAvgPer) * 100).toFixed(1))
      : null;

  const pbrVsSectorPercent =
    stockData.pbr !== null && stockData.sectorAvgPbr !== null && stockData.sectorAvgPbr !== 0
      ? parseFloat(((stockData.pbr / stockData.sectorAvgPbr) * 100).toFixed(1))
      : null;

  // EPS成長率計算（ドメインサービスを利用）
  const epsGrowthRate = calculateEpsGrowthRate(stockData.epsLatest, stockData.eps3yAgo);
  const epsGrowthRatePercent = epsGrowthRate !== null ? parseFloat(epsGrowthRate.toFixed(1)) : null;

  // 構造化コンテキストデータ
  const context: LongTermAnalysisContext = {
    period: {
      type: "long_term",
      description: "長期（6ヶ月-3年）",
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
      epsLatest: stockData.epsLatest,
      eps3yAgo: stockData.eps3yAgo,
      epsGrowthRatePercent,
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
提供されたコンテキストデータに基づき、対象銘柄を長期（6ヶ月〜3年）の投資目線で分析してください。

# 長期分析で重視すべきポイント
長期投資では、短期的な値動きではなく以下を重視してください：
- 収益の持続性とEPSの成長傾向
- 業界全体の長期構造変化（人口動態、政策、技術革新）
- 財務の安定性（特にPBR・資本効率）
- 長期テーマ（インバウンド、AI、省力化、GX等）の追い風の有無

# EPS成長率について
コンテキストデータの 'epsGrowthRatePercent' は3年間のEPS年平均成長率（CAGR）です。
- **20%以上**: 高成長（成長×バリューで長期的に最強）
- **10-20%**: 良好な成長（理想的な長期バリュー株）
- **0-10%**: 低成長だが安定（ディフェンシブ系）
- **負の値/不明**: 業績軟化リスクあり

EPS成長は**リターン源泉の8割を決める最重要指標**として扱い、評価に必ず反映してください。

# 文字数制限（厳守）
- summary: 最大300字
- investmentPoints: 各80字以内
- risks: 各80字以内

# 分析要件

## 1. バリュー株としての評価 (valueStockRating)
この銘柄は内部スコアリングにより「上位銘柄」に抽出されています。
その中での相対的魅力度を5段階で評価してください：
- excellent
- good
- fair
- poor
- very_poor

## 2. 総合評価コメント (summary)
300字以内で、以下を簡潔に記述：
- 割安と判断できる根拠
- 長期視点で注目すべき収益性・成長性
- 業界・市場の長期トレンドとの関係
- 長期保有の妥当性（ROE・EPS成長・PBRなどを要約）

※ 数値の羅列は禁止。指標の本質だけ簡潔にまとめる。

## 3. 投資魅力ポイント (investmentPoints)
3〜4項目、各80字以内で：
- バリュエーションの魅力
- 財務や成長の強み
- 業界や政策など長期の追い風
- 企業固有の競争力

## 4. リスク (risks)
2〜3項目、各80字以内で：
- 財務/業績面の弱点
- 業界構造の逆風
- 長期保有で注意したい特有の不確実性

# 注意事項
- **ウェブ検索活用必須**：最新の業績・ニュース・需給を確認すること
- **数値の羅列は禁止**：ポイントだけを抽象化して説明する
- **文字数厳守**
- **引用マーカー禁止**

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
