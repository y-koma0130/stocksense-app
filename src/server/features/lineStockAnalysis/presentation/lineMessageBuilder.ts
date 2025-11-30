/**
 * LINE銘柄分析用メッセージビルダー
 * Quick Reply対応のメッセージ生成
 */

import type { PeriodType } from "@/constants/periodTypes";
import type { SubscriptionPlan } from "@/constants/subscriptionPlans";
import { LINE_STOCK_ANALYSIS_LIMITS, PLAN_DISPLAY_NAMES } from "@/constants/subscriptionPlans";

/**
 * LINEメッセージの型定義
 */
export type LineTextMessage = {
  type: "text";
  text: string;
  quickReply?: {
    items: Array<{
      type: "action";
      action: {
        type: "postback";
        label: string;
        data: string;
        displayText?: string;
      };
    }>;
  };
};

/**
 * Quick Reply付きの銘柄確認メッセージを生成（期間選択付き）
 */
export const buildStockConfirmationMessage = (params: {
  tickerCode: string;
  stockName: string;
  stockId: string;
}): LineTextMessage => {
  const { tickerCode, stockName, stockId } = params;

  return {
    type: "text",
    text: `📊 ${tickerCode} ${stockName}\n\nこの銘柄のバリュー投資分析を行いますか？\n分析期間を選択してください。`,
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "postback",
            label: "中期（1-6ヶ月）",
            data: `action=analyze&stockId=${stockId}&tickerCode=${tickerCode}&periodType=mid_term`,
            displayText: "中期（1-6ヶ月）で分析",
          },
        },
        {
          type: "action",
          action: {
            type: "postback",
            label: "長期（6ヶ月-3年）",
            data: `action=analyze&stockId=${stockId}&tickerCode=${tickerCode}&periodType=long_term`,
            displayText: "長期（6ヶ月-3年）で分析",
          },
        },
        {
          type: "action",
          action: {
            type: "postback",
            label: "キャンセル",
            data: "action=cancel",
            displayText: "キャンセル",
          },
        },
      ],
    },
  };
};

/**
 * 銘柄が見つからないメッセージを生成
 */
export const buildStockNotFoundMessage = (tickerCode: string): LineTextMessage => {
  return {
    type: "text",
    text: `❌ 証券コード「${tickerCode}」に該当する銘柄が見つかりませんでした。\n\n4桁の証券コード（例: 7203）を入力してください。`,
  };
};

/**
 * 無効な入力メッセージを生成
 */
export const buildInvalidInputMessage = (): LineTextMessage => {
  return {
    type: "text",
    text: `📝 銘柄分析をご利用の場合は、4桁の証券コードを入力してください。\n\n例: 7203（トヨタ自動車）`,
  };
};

/**
 * 利用上限到達メッセージを生成
 */
export const buildUsageLimitReachedMessage = (params: {
  plan: SubscriptionPlan;
  usageCount: number;
}): LineTextMessage => {
  const { plan, usageCount } = params;
  const limit = LINE_STOCK_ANALYSIS_LIMITS[plan];
  const planName = PLAN_DISPLAY_NAMES[plan];

  let upgradeMessage = "";
  if (plan === "free") {
    upgradeMessage = "\n\nスタンダードプランやプロプランへのアップグレードもご検討ください。";
  } else if (plan === "standard") {
    upgradeMessage = "\n\nプロプランへのアップグレードもご検討ください。";
  }

  return {
    type: "text",
    text: `⚠️ 今月の分析回数上限（${limit}回）に達しました。\n\n現在のプラン: ${planName}\n利用回数: ${usageCount}/${limit}回${upgradeMessage}\n\n来月1日にリセットされます。`,
  };
};

/**
 * 分析キャンセルメッセージを生成
 */
export const buildAnalysisCancelledMessage = (): LineTextMessage => {
  return {
    type: "text",
    text: "分析をキャンセルしました。\n\n別の銘柄を分析する場合は、証券コードを入力してください。",
  };
};

/**
 * 期間タイプの表示名を取得
 */
const getPeriodLabel = (periodType: PeriodType): string => {
  return periodType === "mid_term" ? "中期（1-6ヶ月）" : "長期（6ヶ月-3年）";
};

/**
 * 分析開始メッセージを生成
 */
export const buildAnalysisStartMessage = (params: {
  tickerCode: string;
  stockName: string;
  periodType: PeriodType;
}): LineTextMessage => {
  const { tickerCode, stockName, periodType } = params;
  const periodLabel = getPeriodLabel(periodType);

  return {
    type: "text",
    text: `🔍 ${tickerCode} ${stockName} の${periodLabel}分析を開始します...\n\n分析完了まで数分掛かることがあります。`,
  };
};

/**
 * 分析結果メッセージを生成
 */
export const buildAnalysisResultMessage = (params: {
  tickerCode: string;
  stockName: string;
  periodType: PeriodType;
  valueStockRating: string | null;
  summary: string | null;
  investmentPoints: string[] | null;
  risks: string[] | null;
  usageCount: number;
  limit: number;
}): LineTextMessage => {
  const {
    tickerCode,
    stockName,
    periodType,
    valueStockRating,
    summary,
    investmentPoints,
    risks,
    usageCount,
    limit,
  } = params;

  // 期間ラベル
  const periodLabel = getPeriodLabel(periodType);

  // 評価ラベルの変換
  const ratingLabel = getRatingLabel(valueStockRating);

  // 投資ポイントの整形
  const pointsText =
    investmentPoints && investmentPoints.length > 0
      ? investmentPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")
      : "データなし";

  // リスクの整形
  const risksText =
    risks && risks.length > 0 ? risks.map((r, i) => `${i + 1}. ${r}`).join("\n") : "データなし";

  const message = `📊 ${tickerCode} ${stockName}【${periodLabel}】
━━━━━━━━━━━━━━━━

🏷️ バリュー投資評価: ${ratingLabel}

📝 総合評価
${summary || "データなし"}

✨ 投資ポイント
${pointsText}

⚠️ 注意点・リスク
${risksText}

━━━━━━━━━━━━━━━━
📈 今月の利用回数: ${usageCount}/${limit}回

※この分析はAIによる参考情報です。投資判断は自己責任でお願いします。`;

  return {
    type: "text",
    text: message,
  };
};

/**
 * 運営連絡先
 */
const SUPPORT_EMAIL = "stocksense.admin@proton.me";

/**
 * 分析エラーメッセージを生成
 */
export const buildAnalysisErrorMessage = (): LineTextMessage => {
  return {
    type: "text",
    text: `分析中にエラーが発生しました。\n\nしばらく時間をおいて再度お試しください。\n\n問題が解決しない場合は、以下までご連絡ください。\n${SUPPORT_EMAIL}`,
  };
};

/**
 * 分析タイムアウトエラーメッセージを生成
 */
export const buildAnalysisTimeoutMessage = (): LineTextMessage => {
  return {
    type: "text",
    text: `分析がタイムアウトしました。\n\nサーバーが混雑している可能性があります。しばらく時間をおいて再度お試しください。\n\n問題が続く場合は、以下までご連絡ください。\n${SUPPORT_EMAIL}`,
  };
};

/**
 * LINE未連携ユーザーへのメッセージを生成
 */
export const buildUnlinkedUserMessage = (): LineTextMessage => {
  const serviceDomain = process.env.SERVICE_DOMAIN;
  const baseUrl = serviceDomain ? `https://${serviceDomain}` : "http://localhost:3000";

  return {
    type: "text",
    text: `📝 銘柄分析機能をご利用いただくには、アカウント連携が必要です。\n\n以下のリンクからログインまたは新規登録をお願いします。\n\n${baseUrl}/login`,
  };
};

/**
 * 評価ラベルを取得
 */
const getRatingLabel = (rating: string | null): string => {
  switch (rating) {
    case "excellent":
      return "⭐ 超おすすめ";
    case "good":
      return "⭕ おすすめ";
    case "fair":
      return "➖ 中立";
    case "poor":
      return "🔺 注意";
    case "very_poor":
      return "❌ 要注意";
    default:
      return "❓ 評価なし";
  }
};
