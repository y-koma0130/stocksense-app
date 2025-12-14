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

# Web検索の活用（重要）

## 中期分析で重視すべき情報（優先度順）
1. 直近1ヶ月以内の決算発表・業績修正
2. 直近のIR・プレスリリース
3. 需給動向（信用残、外国人売買動向など）
4. セクター全体に影響する短期イベント
5. 突発的なリスク（不祥事、訴訟、事故、行政処分）

## 中期分析で影響され過ぎないこと
- 長期テーマや構造変化（中期では織り込み済みか見極める）
- 中期経営計画（1-6ヶ月で達成されるものではない）
- 5年後・10年後の成長ストーリー

## 情報の鮮度ルール
- 1ヶ月以内の情報: 積極的に分析に反映
- 1〜3ヶ月前の情報: 参考程度
- 3ヶ月以上前の情報: 原則無視

## 検索結果の活用ルール
- 企業公式IR、日経、東洋経済、ロイターなどを優先
- 検索結果は自分の言葉で要約して使用

# RSIモメンタムの評価ルール
- 正の値 → 反発初動・需給改善の兆し
- 負の値 → 調整継続の可能性、エントリー慎重
- ただし短期ノイズの可能性もあるため、他指標と総合判断すること

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
- 割安性の判断根拠
- 市場・セクター環境との整合性
- モメンタムと需給の評価
- 中期での投資判断ポイント

investmentPoints:（3〜4項目）
- バリュー面、セクター面、モメンタム面、中期のメリット

risks:（2〜3項目）
- 業績変動要因、市場環境リスク、セクター固有リスク

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

※ 検証で問題が見つかった場合は、必ず修正してから出力すること。
※ 引用マーカーが残っている出力は無効として扱われます。

# 絶対禁止事項
- URLの記載
- 引用マーカー・参照元表記
- 数値の羅列
- 一般論のみのリスク記述
- 確定的な株価予測
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
