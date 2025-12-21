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

# Web検索の活用（重要）

## 長期分析で重視すべき情報（優先度順）
1. 中期経営計画・長期ビジョン
2. 事業構造の変化（M&A、事業売却、新規事業参入）
3. 業界の長期トレンド（規制変化、技術革新、競争環境）
4. 設備投資計画・研究開発投資
5. 株主還元方針の変更（増配、自社株買い）

## 長期分析で影響され過ぎないこと
- 直近決算の一時的な増減（長期トレンドで見る）
- 短期の株価変動や需給ノイズ
- 四半期ごとの業績のブレ
- 短期イベントへの市場の過剰反応

## 情報の鮮度ルール
- 3ヶ月以内の情報: 積極的に分析に反映
- 3ヶ月〜1年前の情報: 長期トレンドの文脈で参照可
- 1年以上前の情報: 原則無視（ただし中期経営計画は参照可）

## 検索結果の活用ルール
- 企業公式IR、日経、東洋経済、ロイターなどを優先
- 検索結果は自分の言葉で要約して使用

# 情報不足時の評価ルール
以下の場合は、valueStockRatingを**fair以下**にしてください：
- 複数の重要指標が「不明」のまま
- Web検索でも情報が十分に取得できなかった

# 出力形式と文字数制限（厳守）

## 文字数制限
- summary: **300字以内**
- investmentPoints: 各項目 **80字以内**
- risks: 各項目 **80字以内**

## 出力内容
valueStockRating: excellent / good / fair / poor / very_poor

summary:
- 割安と判断できる根拠
- 長期視点で注目すべき収益性・成長性
- 業界・市場の長期トレンドとの関係
- 長期保有の妥当性

investmentPoints:（3〜4項目）
- バリュエーションの魅力、財務や成長の強み、長期の追い風、企業固有の競争力

risks:（2〜3項目）
- 財務/業績面の弱点、業界構造の逆風、長期保有での不確実性

# 出力前の自己検証（必須）

JSON出力を生成した後、出力前に以下を必ず確認し、違反があれば修正してから出力してください。

## 1. 引用・参照のチェック（最優先）
出力テキスト全体をスキャンし、以下が含まれていたら削除してから出力：
- 「cite」「turn」「news」「search」を含む文字列（例: citeturn0news12）
- 「Sources:」「参考:」「出典:」「引用:」「参照:」
- URL（http://、https://で始まる文字列）
- 括弧内の出典表記（例: [1]、(日経新聞)）
- 「〜によると」という表現

## 2. 文字数チェック
- summary: 300字以内か？ → 超過なら要約して短縮
- investmentPoints: 各項目80字以内か？ → 超過なら簡潔にまとめる
- risks: 各項目80字以内か？ → 超過なら簡潔にまとめる

## 3. 内容チェック
- 数値の羅列になっていないか？
- 銘柄固有の内容になっているか？
- 短期的な値動きに言及していないか？

※ 検証で問題が見つかった場合は、必ず修正してから出力すること。
※ 引用マーカーが残っている出力は無効として扱われます。

# 絶対禁止事項
- URLの記載
- 引用マーカー・参照元表記
- 数値の羅列
- 一般論のみのリスク記述
- 確定的な株価予測
- 短期的な値動きへの言及
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
