/**
 * 中期銘柄分析プロンプトビルダー
 */

import type { MarketAnalysisDto } from "@/server/features/marketAnalysis/application/dto/marketAnalysis.dto";
import type { MidTermStockIndicatorDto } from "../../application/dto/midTermStockIndicator.dto";

/**
 * プロンプトビルダーのパラメータ
 */
type BuildMidTermAnalysisPromptParams = Readonly<{
  stockData: MidTermStockIndicatorDto;
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
 * 中期分析用コンテキストデータ
 */
type MidTermAnalysisContext = Readonly<{
  period: {
    type: "mid_term";
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
    rsiShort: number | null;
    rsiMomentum: number | null;
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
  marketEnvironment: MarketAnalysisDto | null;
}>;

/**
 * 中期銘柄分析用のLLMプロンプトを生成
 */
export const buildMidTermAnalysisPrompt = ({
  stockData,
  marketAnalysis,
}: BuildMidTermAnalysisPromptParams): AnalysisPromptResult => {
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

  // RSIモメンタム計算（短期RSI - 長期RSI）
  const rsiMomentum =
    stockData.rsiShort !== null && stockData.rsi !== null
      ? parseFloat((stockData.rsiShort - stockData.rsi).toFixed(1))
      : null;

  // 構造化コンテキストデータ
  const context: MidTermAnalysisContext = {
    period: {
      type: "mid_term",
      description: "中期（1-6ヶ月）",
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
      rsiShort: stockData.rsiShort,
      rsiMomentum,
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
  const instructions = `あなたは日本株の中期バリュー投資に精通したプロアナリストです。
提供されたコンテキストデータに基づき、対象銘柄を
「中期（1〜6ヶ月）の投資目線」で専門的かつ簡潔に評価します。

# 中期分析で特に重視する視点
- バリュエーション（PER・PBR）
- セクター平均との相対比較
- 市場環境（TOPIX・業種トレンド）
- モメンタム（RSI、RSIモメンタム）
- 価格位置（価格帯の中で上/下どこにいるか）

※ 中期では「割安 × 需給改善 × セクター環境」の3点を最重要とし、
長期成長・テーマ性は優先度を下げて評価すること。

# Web検索の活用方針（重要）
WebSearch を利用して以下を確認し、分析に反映してください：
- 直近1ヶ月のニュース（決算、業績修正、ガバナンス）
- セクター全体の短期トレンド
- 指標に反映されない突発リスク（行政処分、M&A、事故など）
- マクロの影響（為替、金利、政策テーマ）

※ 情報は要旨のみを文章に反映し、引用やURLは一切含めないこと。

# RSIモメンタムの評価ルール
- 正の値 → 反発初動・需給改善の兆し
- 負の値 → 調整継続の可能性、エントリー慎重
- ただし短期ノイズの可能性もあるため、他指標と総合判断すること

# 出力フォーマットと文字数制限（厳守）
以下の形式で出力すること：

valueStockRating:
excellent / good / fair / poor / very_poor のいずれか。

summary（300字以内）
- 割安性の判断根拠
- 市場・セクター環境との整合性
- モメンタムと需給の評価
- 中期（1〜6ヶ月）での投資判断ポイント
※ 数字の羅列は禁止。簡潔に要点のみ。

investmentPoints（各80字以内 × 3〜4項目）
- バリュー面
- セクター面
- モメンタム面
- 中期の現実的メリット
を具体的に。

risks（各80字以内 × 2〜3項目）
- 業績変動要因
- 市場環境リスク
- セクター固有リスク
※ 「一般論のみ」は禁止。なるべく銘柄性に合わせて書くこと。

# 禁止事項
- 数値の羅列（PERがxx、PBRがxx…のような書き方）
- 文字数超過
- 引用マーカー・URLの記載
- 決めつけや確定的表現

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
