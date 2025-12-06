/**
 * LINE通知メッセージビルダー
 * マーケット分析とランキング通知のメッセージ生成
 */

import type { PeriodType } from "@/server/features/marketAnalysis/domain/values/types";

/**
 * LINE通知用のマーケット分析データ型
 * Inngest step.runでシリアライズされるため、DateはstringまたはDateを許容
 */
type MarketAnalysisForLine = Readonly<{
  analyzedAt: Date | string;
  interestRateTrend: string;
  favorableSectors: ReadonlyArray<{
    sectorCode: string;
    sectorName: string;
    reason: string;
  }>;
  unfavorableSectors: ReadonlyArray<{
    sectorCode: string;
    sectorName: string;
    reason: string;
  }>;
  favorableThemes: ReadonlyArray<{
    theme: string;
    description: string;
  }>;
  unfavorableThemes: ReadonlyArray<{
    theme: string;
    description: string;
  }>;
  economicSummary: string;
}>;

/**
 * LINE通知用の個別株分析データ型
 */
type StockAnalysisForLine = Readonly<{
  valueStockRating: string | null;
  summary: string | null;
}>;

type TopStock = Readonly<{
  stockId: string;
  tickerCode: string;
  name: string;
  currentPrice: number | null;
  per: number | null;
  pbr: number | null;
  sectorAvgPer: number | null;
  sectorAvgPbr: number | null;
  rsi: number | null;
  priceHigh: number | null;
  priceLow: number | null;
  valueScore: { totalScore: number };
}>;

const getDashboardUrl = () => `https://${process.env.SERVICE_DOMAIN}/dashboard`;

/**
 * 期間タイプの表示名を取得
 */
const getPeriodLabel = (periodType: PeriodType): string => {
  return periodType === "mid_term" ? "中期" : "長期";
};

/**
 * 価格位置を判定（底値圏、安値圏など）
 */
const getPricePosition = (
  currentPrice: number | null,
  priceHigh: number | null,
  priceLow: number | null,
): string => {
  if (!currentPrice || !priceHigh || !priceLow || priceHigh === priceLow) {
    return "";
  }

  const position = ((currentPrice - priceLow) / (priceHigh - priceLow)) * 100;

  if (position <= 20) return "📍底値圏";
  if (position <= 40) return "📉安値圏";
  if (position <= 60) return "➖中間";
  if (position <= 80) return "📈高値圏";
  return "⚠️天井圏";
};

/**
 * RSI状態を判定
 */
const getRSIStatus = (rsi: number | null): string => {
  if (!rsi) return "";
  if (rsi <= 30) return "🔵売られすぎ";
  if (rsi <= 50) return "🟢やや売られ気味";
  if (rsi <= 70) return "🟡やや過熱";
  return "🔴買われすぎ";
};

/**
 * 業種平均比を計算してフォーマット
 */
const formatRatio = (value: number | null, average: number | null, label: string): string => {
  if (!value || !average || average <= 0) return "";

  const ratio = Math.round((value / average) * 100);
  const arrow = ratio < 100 ? "⬇️" : "⬆️";
  return `${label}${value.toFixed(1)}(${ratio}%)${arrow}`;
};

/**
 * メダル絵文字を取得
 */
const getMedalEmoji = (rank: number): string => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `${rank}.`;
};

/**
 * AI評価のラベルを取得
 */
const getRatingLabel = (rating: string | null): string => {
  switch (rating) {
    case "excellent":
      return "⭐超おすすめ";
    case "good":
      return "◎おすすめ";
    case "fair":
      return "○中立";
    case "poor":
      return "△注意";
    case "very_poor":
      return "✕要注意";
    default:
      return "";
  }
};

/**
 * 日付フォーマット
 * Inngestのstep.runでシリアライズされるとstringになるため、両方対応
 */
const formatDate = (date?: Date | string): string => {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * マーケットサマリメッセージを生成（1通目）
 */
export const buildMarketSummaryMessage = (
  marketAnalysis: MarketAnalysisForLine,
  periodType: PeriodType,
): string => {
  const periodLabel = getPeriodLabel(periodType);

  // 注目セクター（上位3件）
  const favorableSectors = marketAnalysis.favorableSectors
    .slice(0, 3)
    .map((s) => `・${s.sectorName}: ${s.reason}`)
    .join("\n");

  // 注目テーマ（上位2件）
  const favorableThemes = marketAnalysis.favorableThemes
    .slice(0, 2)
    .map((t) => `・${t.theme}: ${t.description}`)
    .join("\n");

  // 経済サマリを150文字程度に要約（改行除去・トリム）
  const summaryText = marketAnalysis.economicSummary.replace(/\n/g, " ").trim().slice(0, 200);

  return `📈 【${periodLabel}】マーケット分析
更新日: ${formatDate(marketAnalysis.analyzedAt)}

🔔 マーケット総括
${summaryText}

📊 注目セクター
${favorableSectors}

🔥 注目テーマ
${favorableThemes}`;
};

/**
 * ランキングメッセージを生成（2通目）
 * 上位5銘柄にはAI分析コメントを追加
 */
export const buildRankingMessage = (
  stocks: readonly TopStock[],
  periodType: PeriodType,
  stockAnalyses: Map<string, StockAnalysisForLine>,
): string => {
  const periodLabel = getPeriodLabel(periodType);

  // 上位5銘柄は詳細表示 + AI分析
  const topFive = stocks
    .slice(0, 5)
    .map((stock, index) => {
      const rank = index + 1;
      const score = Math.round(stock.valueScore.totalScore * 100);
      const medal = getMedalEmoji(rank);

      // AI分析を取得
      const analysis = stockAnalyses.get(stock.stockId);
      const ratingLabel = analysis ? getRatingLabel(analysis.valueStockRating) : "";

      // 基本情報行
      const basicInfo = [`${medal} ${stock.tickerCode} ${stock.name} (${score}点)`, ratingLabel]
        .filter((s) => s !== "")
        .join(" ");

      // 指標行
      const metricsLine = [
        stock.currentPrice ? `💰${stock.currentPrice.toLocaleString()}円` : "",
        formatRatio(stock.per, stock.sectorAvgPer, "PER"),
        formatRatio(stock.pbr, stock.sectorAvgPbr, "PBR"),
        getRSIStatus(stock.rsi),
        getPricePosition(stock.currentPrice, stock.priceHigh, stock.priceLow),
      ]
        .filter((s) => s !== "")
        .join(" | ");

      // AI分析コメント（100文字程度に要約）
      let aiComment = "";
      if (analysis?.summary) {
        const summaryShort = analysis.summary.slice(0, 100);
        aiComment = `\n💡 ${summaryShort}`;
      }

      return `${basicInfo}\n${metricsLine}${aiComment}`;
    })
    .join("\n\n");

  // 6位以降は簡略表示
  const restLines = stocks
    .slice(5)
    .map((stock, index) => {
      const rank = index + 6;
      const score = Math.round(stock.valueScore.totalScore * 100);
      const price = stock.currentPrice ? `${stock.currentPrice.toLocaleString()}円` : "-";
      return `${rank}. ${stock.tickerCode} ${stock.name} (${score}点) ${price}`;
    })
    .join("\n");

  return `📊 【${periodLabel}】バリュー株ランキング
更新日: ${formatDate()}

${topFive}

--- 6位〜10位 ---
${restLines}

▼ 全ランキング・詳細分析
${getDashboardUrl()}`;
};
