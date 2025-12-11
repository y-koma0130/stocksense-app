/**
 * LINE Webhook API
 *
 * TODO: リファクタリング計画
 * このファイルはプレゼンテーション層として、以下の責務のみを持つべき:
 * - LINE署名検証
 * - イベントの種類判定・ルーティング
 * - ユースケース呼び出し → 結果をLINEメッセージに変換して送信
 *
 * 以下のユースケースを作成し、ビジネスロジックを移動する:
 *
 * 1. handleFollowEventUsecase (友だち追加イベント処理)
 *    - lineNotificationフィーチャーに作成
 *    - ユーザー登録/更新ロジックをユースケースに移動
 *    - sendLineMessageはexternalServicesに依頼
 *
 * 2. searchStockForLineUsecase (銘柄検索・確認フロー)
 *    - lineStockAnalysisフィーチャーに作成
 *    - ユーザー連携確認、銘柄検索、使用回数チェック、プラン判定をユースケースに集約
 *    - 確認メッセージ用のデータをDTOで返却
 *
 * 3. analyzeStockForLineUsecase (分析実行) ※既存を拡張
 *    - 使用回数チェック、プラン判定をユースケース内に含める
 *    - 分析履歴保存(saveLineStockAnalysisUsage)をユースケース内で実行
 *    - 結果DTOに使用回数情報も含める
 *
 * 4. sendLineMessageをexternalServicesに統一
 *    - lineStockAnalysis/infrastructure/externalServices/sendLineMessage.ts
 *    - または既存のlineNotificationのものを共用
 *
 * route.tsの最終形:
 * - POST: 署名検証 → イベントルーティング → ユースケース呼び出し → メッセージビルダーでLINEメッセージ生成 → 送信
 * - 直接リポジトリ/クエリサービスを呼び出さない
 */

import crypto from "crypto";
import { NextResponse } from "next/server";
import type { PeriodType } from "@/constants/periodTypes";
import type { SubscriptionPlan } from "@/constants/subscriptionPlans";
import { LINE_STOCK_ANALYSIS_LIMITS } from "@/constants/subscriptionPlans";
import type { AnalyzeStockForLineResultDto } from "@/server/features/lineStockAnalysis/application/dto/analyzeStockForLineResult.dto";
import { analyzeStockForLineUsecase } from "@/server/features/lineStockAnalysis/application/usecases/analyzeStockForLine.usecase";
import { executeStockAnalysis } from "@/server/features/lineStockAnalysis/infrastructure/externalServices/executeStockAnalysis";
import {
  AnalysisTimeoutError,
  executeStockAnalysisWithTimeout,
} from "@/server/features/lineStockAnalysis/infrastructure/externalServices/executeStockAnalysisWithTimeout";
import { getLongTermStockIndicatorByStockId } from "@/server/features/lineStockAnalysis/infrastructure/queryServices/getLongTermStockIndicatorByStockId";
import { getMidTermStockIndicatorByStockId } from "@/server/features/lineStockAnalysis/infrastructure/queryServices/getMidTermStockIndicatorByStockId";
import { getMonthlyUsageCount } from "@/server/features/lineStockAnalysis/infrastructure/queryServices/getMonthlyUsageCount";
import { getStockByTickerCode } from "@/server/features/lineStockAnalysis/infrastructure/queryServices/getStockByTickerCode";
import { saveLineStockAnalysisUsage } from "@/server/features/lineStockAnalysis/infrastructure/repositories/saveLineStockAnalysisUsage";
import { saveStockAnalysis } from "@/server/features/lineStockAnalysis/infrastructure/repositories/saveStockAnalysis";
import {
  buildAnalysisCancelledMessage,
  buildAnalysisErrorMessage,
  buildAnalysisResultMessage,
  buildAnalysisStartMessage,
  buildAnalysisTimeoutMessage,
  buildInvalidInputMessage,
  buildStockConfirmationMessage,
  buildStockNotFoundMessage,
  buildUnlinkedUserMessage,
  buildUsageLimitReachedMessage,
} from "@/server/features/lineStockAnalysis/presentation/lineMessageBuilder";
import { createLineUser } from "@/server/features/lineUsers/domain/entities/lineUser";
import { sendLineMessage } from "@/server/features/lineUsers/infrastructure/externalServices/sendLineMessage";
import { getLineUserByLineUserId } from "@/server/features/lineUsers/infrastructure/queryServices/getLineUserByLineUserId";
import { upsertLineUser } from "@/server/features/lineUsers/infrastructure/repositories/upsertLineUser.repository";
import { getLatestMarketAnalysis } from "@/server/features/marketAnalysis/infrastructure/queryServices/getLatestMarketAnalysis";
import { getStockAnalysesByStockIds } from "@/server/features/stockAnalysis/infrastructure/queryServices/getStockAnalysesByStockIds";
import { getUserSubscriptionByUserId } from "@/server/features/userSubscription/infrastructure/queryServices/getUserSubscriptionByUserId";
import { getTopLongTermValueStocks } from "@/server/features/valueStockScoring/application/usecases/getTopLongTermValueStocks.usecase";
import { getTopMidTermValueStocks } from "@/server/features/valueStockScoring/application/usecases/getTopMidTermValueStocks.usecase";
import { calculateLongTermValueStockScore } from "@/server/features/valueStockScoring/domain/services/calculateLongTermValueStockScore.service";
import { calculateMidTermValueStockScore } from "@/server/features/valueStockScoring/domain/services/calculateMidTermValueStockScore.service";
import { filterProMarket } from "@/server/features/valueStockScoring/domain/services/filterProMarket.service";
import { isTrapStock } from "@/server/features/valueStockScoring/domain/services/isTrapStock.service";
import { rankByScore } from "@/server/features/valueStockScoring/domain/services/rankByScore.service";
import {
  getLatestLongTermIndicators,
  getLatestMidTermIndicators,
} from "@/server/features/valueStockScoring/infrastructure/queryServices/getIndicators";
import {
  buildMarketSummaryMessage,
  buildRankingMessage,
} from "@/server/jobs/utils/lineMessageBuilders";

/**
 * LINE Webhookイベントの型定義
 */
type LineFollowEvent = {
  type: "follow";
  source: { type: "user"; userId: string };
  replyToken: string;
};

type LineMessageEvent = {
  type: "message";
  source: { type: "user"; userId: string };
  replyToken: string;
  message: {
    type: "text";
    text: string;
  };
};

type LinePostbackEvent = {
  type: "postback";
  source: { type: "user"; userId: string };
  replyToken: string;
  postback: {
    data: string;
  };
};

type LineEvent =
  | LineFollowEvent
  | LineMessageEvent
  | LinePostbackEvent
  | { type: string; source: { type: string; userId?: string } };

type LineWebhookBody = {
  events: LineEvent[];
};

/**
 * LINE Webhook署名を検証
 */
const verifySignature = (body: string, signature: string): boolean => {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!channelSecret) {
    return false;
  }

  const hash = crypto.createHmac("SHA256", channelSecret).update(body).digest("base64");

  return hash === signature;
};

/**
 * 現在の年月をYYYY-MM形式で取得
 */
const getCurrentYearMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

/**
 * 4桁の証券コードかどうかを判定
 */
const isValidTickerCode = (text: string): boolean => {
  return /^\d{4}$/.test(text.trim());
};

/**
 * Postbackデータをパース
 */
const parsePostbackData = (data: string): Record<string, string> => {
  const params = new URLSearchParams(data);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

/**
 * Webhook URLの疎通確認用
 */
export async function GET() {
  return NextResponse.json({ status: "ok", message: "LINE Webhook endpoint is ready" });
}

/**
 * 友だち追加イベントを処理
 */
const handleFollowEvent = async (event: LineFollowEvent): Promise<void> => {
  const lineUserId = event.source.userId;

  // 既存ユーザーかどうかを確認
  const existingUser = await getLineUserByLineUserId(lineUserId);

  // DBにLINEユーザーを登録または更新
  const entity = createLineUser({
    lineUserId,
    userId: existingUser?.userId ?? null,
    displayName: existingUser?.displayName ?? null,
    notificationEnabled: existingUser?.notificationEnabled ?? true,
  });
  await upsertLineUser(entity);

  // メッセージを送信
  const serviceDomain = process.env.SERVICE_DOMAIN;
  const baseUrl = serviceDomain ? `https://${serviceDomain}` : "http://localhost:3000";
  const authUrl = `${baseUrl}/login?lineUserId=${lineUserId}`;

  let welcomeMessage: string;

  if (existingUser?.userId) {
    welcomeMessage = `StockSenseへようこそ！

すでにアカウントをお持ちですね。以下のリンクからログインしてLINE通知を有効にできます。

${authUrl}`;
  } else {
    welcomeMessage = `StockSenseへようこそ！

割安株の通知を受け取るには、以下のリンクからログインまたは新規登録をお願いします。

${authUrl}

※LINE通知が自動的に有効になります。`;
  }

  await sendLineMessage(lineUserId, [
    {
      type: "text",
      text: welcomeMessage,
    },
  ]);
};

/**
 * テキストメッセージイベントを処理（証券コード検索）
 */
const handleMessageEvent = async (event: LineMessageEvent): Promise<void> => {
  const lineUserId = event.source.userId;
  const text = event.message.text.trim();

  // 4桁の証券コードかどうかをチェック
  if (!isValidTickerCode(text)) {
    await sendLineMessage(lineUserId, [buildInvalidInputMessage()]);
    return;
  }

  // ユーザーの連携状態を確認
  const lineUser = await getLineUserByLineUserId(lineUserId);

  if (!lineUser?.userId) {
    await sendLineMessage(lineUserId, [buildUnlinkedUserMessage()]);
    return;
  }

  // 銘柄を検索
  const stock = await getStockByTickerCode(text);

  if (!stock) {
    await sendLineMessage(lineUserId, [buildStockNotFoundMessage(text)]);
    return;
  }

  // 使用回数チェック
  const yearMonth = getCurrentYearMonth();
  const usageCount = await getMonthlyUsageCount({ lineUserId, yearMonth });

  // ユーザーのプランを取得
  const subscription = await getUserSubscriptionByUserId(lineUser.userId);
  const plan: SubscriptionPlan = subscription?.plan ?? "free";
  const limit = LINE_STOCK_ANALYSIS_LIMITS[plan];

  if (usageCount >= limit) {
    await sendLineMessage(lineUserId, [buildUsageLimitReachedMessage({ plan, usageCount })]);
    return;
  }

  // Quick Replyで確認メッセージを送信
  await sendLineMessage(lineUserId, [
    buildStockConfirmationMessage({
      tickerCode: stock.tickerCode,
      stockName: stock.name,
      stockId: stock.id,
    }),
  ]);
};

/**
 * 銘柄分析の使い方ガイドメッセージを生成
 */
const buildAnalysisGuideMessage = (): { type: "text"; text: string } => {
  return {
    type: "text",
    text: `🔍 銘柄分析の使い方

4桁の銘柄コードを送信してください。

【例】
・7203（トヨタ自動車）
・6758（ソニーグループ）
・9984（ソフトバンクグループ）

銘柄コードを送信すると、AIが割安度を分析してレポートをお届けします。

※銘柄コードは証券会社のサイトやYahoo!ファイナンスで確認できます。`,
  };
};

/**
 * ダッシュボードURLメッセージを生成
 */
const buildDashboardMessage = (lineUserId: string): { type: "text"; text: string } => {
  const serviceDomain = process.env.SERVICE_DOMAIN;
  const baseUrl = serviceDomain ? `https://${serviceDomain}` : "http://localhost:3000";
  const authUrl = `${baseUrl}/login?lineUserId=${lineUserId}`;

  return {
    type: "text",
    text: `🌐 ダッシュボード

以下のリンクからStockSenseにアクセスできます。

${authUrl}

ウェブ版では、より詳細なランキングや分析結果を確認できます。`,
  };
};

/**
 * レポート選択メッセージを生成（Quick Reply付き）
 */
const buildReportSelectMessage = (): {
  type: "text";
  text: string;
  quickReply: {
    items: Array<{
      type: "action";
      action: { type: "postback"; label: string; data: string };
    }>;
  };
} => {
  return {
    type: "text",
    text: `📊 レポートを再送

どちらのレポートを受け取りますか？

・中期レポート: 週次で更新される中期投資向けランキング
・長期レポート: 月次で更新される長期投資向けランキング`,
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "postback",
            label: "📈 中期レポート",
            data: "action=weekly_report",
          },
        },
        {
          type: "action",
          action: {
            type: "postback",
            label: "📊 長期レポート",
            data: "action=monthly_report",
          },
        },
      ],
    },
  };
};

/**
 * 週次レポート（中期）を送信
 */
const sendWeeklyReport = async (lineUserId: string): Promise<void> => {
  // マーケット分析を取得
  const marketAnalysis = await getLatestMarketAnalysis({ periodType: "mid_term" });

  // 上位10銘柄を取得
  const topStocks = await getTopMidTermValueStocks(
    {
      getLatestMidTermIndicators,
      getLatestMarketAnalysis,
      calculateMidTermValueStockScore,
      filterProMarket,
      isTrapStock,
      rankByScore,
    },
    { limit: 10 },
  );

  // 上位5銘柄のAI分析を取得
  const top5StockIds = topStocks.slice(0, 5).map((s) => s.stockId);
  const analysisMap = await getStockAnalysesByStockIds({
    stockIds: top5StockIds,
    periodType: "mid_term",
  });

  // メッセージを組み立て
  const messages: Array<{ type: "text"; text: string }> = [];

  if (marketAnalysis) {
    const marketMessage = buildMarketSummaryMessage(marketAnalysis, "mid_term");
    messages.push({ type: "text", text: marketMessage });
  }

  const rankingMessage = buildRankingMessage(topStocks, "mid_term", analysisMap);
  messages.push({ type: "text", text: rankingMessage });

  await sendLineMessage(lineUserId, messages);
};

/**
 * 月次レポート（長期）を送信
 */
const sendMonthlyReport = async (lineUserId: string): Promise<void> => {
  // マーケット分析を取得
  const marketAnalysis = await getLatestMarketAnalysis({ periodType: "long_term" });

  // 上位10銘柄を取得
  const topStocks = await getTopLongTermValueStocks(
    {
      getLatestLongTermIndicators,
      getLatestMarketAnalysis,
      calculateLongTermValueStockScore,
      filterProMarket,
      isTrapStock,
      rankByScore,
    },
    { limit: 10 },
  );

  // 上位5銘柄のAI分析を取得
  const top5StockIds = topStocks.slice(0, 5).map((s) => s.stockId);
  const analysisMap = await getStockAnalysesByStockIds({
    stockIds: top5StockIds,
    periodType: "long_term",
  });

  // メッセージを組み立て
  const messages: Array<{ type: "text"; text: string }> = [];

  if (marketAnalysis) {
    const marketMessage = buildMarketSummaryMessage(marketAnalysis, "long_term");
    messages.push({ type: "text", text: marketMessage });
  }

  const rankingMessage = buildRankingMessage(topStocks, "long_term", analysisMap);
  messages.push({ type: "text", text: rankingMessage });

  await sendLineMessage(lineUserId, messages);
};

/**
 * Postbackイベントを処理（分析実行、キャンセル、リッチメニューアクション）
 */
const handlePostbackEvent = async (event: LinePostbackEvent): Promise<void> => {
  const lineUserId = event.source.userId;
  const postbackData = parsePostbackData(event.postback.data);

  // リッチメニュー: 銘柄分析の使い方
  if (postbackData.action === "guide") {
    await sendLineMessage(lineUserId, [buildAnalysisGuideMessage()]);
    return;
  }

  // リッチメニュー: レポート選択（Quick Reply表示）
  if (postbackData.action === "report_select") {
    await sendLineMessage(lineUserId, [buildReportSelectMessage()]);
    return;
  }

  // レポート再送: 中期（週次）
  if (postbackData.action === "weekly_report") {
    await sendWeeklyReport(lineUserId);
    return;
  }

  // レポート再送: 長期（月次）
  if (postbackData.action === "monthly_report") {
    await sendMonthlyReport(lineUserId);
    return;
  }

  // リッチメニュー: ダッシュボード
  if (postbackData.action === "dashboard") {
    await sendLineMessage(lineUserId, [buildDashboardMessage(lineUserId)]);
    return;
  }

  // 銘柄分析: キャンセル
  if (postbackData.action === "cancel") {
    await sendLineMessage(lineUserId, [buildAnalysisCancelledMessage()]);
    return;
  }

  // 銘柄分析: 実行
  if (postbackData.action === "analyze") {
    const stockId = postbackData.stockId;
    const tickerCode = postbackData.tickerCode;
    const periodType = postbackData.periodType as PeriodType;

    if (!stockId || !tickerCode || !periodType) {
      await sendLineMessage(lineUserId, [buildAnalysisErrorMessage()]);
      return;
    }

    // ユーザーの連携状態を再確認
    const lineUser = await getLineUserByLineUserId(lineUserId);

    if (!lineUser?.userId) {
      await sendLineMessage(lineUserId, [buildUnlinkedUserMessage()]);
      return;
    }

    // 使用回数チェック（再確認）
    const yearMonth = getCurrentYearMonth();
    const usageCount = await getMonthlyUsageCount({ lineUserId, yearMonth });

    const subscription = await getUserSubscriptionByUserId(lineUser.userId);
    const plan: SubscriptionPlan = subscription?.plan ?? "free";
    const limit = LINE_STOCK_ANALYSIS_LIMITS[plan];

    if (usageCount >= limit) {
      await sendLineMessage(lineUserId, [buildUsageLimitReachedMessage({ plan, usageCount })]);
      return;
    }

    // 銘柄情報を再取得
    const stock = await getStockByTickerCode(tickerCode);
    if (!stock) {
      await sendLineMessage(lineUserId, [buildStockNotFoundMessage(tickerCode)]);
      return;
    }

    // 分析開始メッセージを送信
    await sendLineMessage(lineUserId, [
      buildAnalysisStartMessage({ tickerCode, stockName: stock.name, periodType }),
    ]);

    // タイムアウト付き分析実行関数を作成（10分 = 600000ms）
    const ANALYSIS_TIMEOUT_MS = 600000;
    const executeWithTimeout = (params: { instructions: string; input: string }) =>
      executeStockAnalysisWithTimeout(executeStockAnalysis, params, ANALYSIS_TIMEOUT_MS);

    // 分析を実行（DI形式でユースケースを呼び出し）
    let result: AnalyzeStockForLineResultDto | undefined;
    let isTimeout = false;
    try {
      result = await analyzeStockForLineUsecase(
        {
          getMidTermStockIndicatorByStockId,
          getLongTermStockIndicatorByStockId,
          getLatestMarketAnalysis,
          executeStockAnalysis: executeWithTimeout,
          saveStockAnalysis,
        },
        { stockId, tickerCode, periodType },
      );
    } catch (error) {
      if (error instanceof AnalysisTimeoutError) {
        isTimeout = true;
      }
      console.error("[handlePostbackEvent] Analysis error:", error);
    }

    // タイムアウトの場合
    if (isTimeout) {
      await sendLineMessage(lineUserId, [buildAnalysisTimeoutMessage()]);
      return;
    }

    // エラーの場合（resultがundefinedまたはsuccess=false）
    if (!result?.success) {
      await sendLineMessage(lineUserId, [buildAnalysisErrorMessage()]);
      return;
    }

    // 分析履歴を保存
    await saveLineStockAnalysisUsage({
      lineUserId,
      stockId,
      tickerCode,
      periodType,
    });

    // 新しい使用回数を取得
    const newUsageCount = await getMonthlyUsageCount({ lineUserId, yearMonth });

    // 分析結果を送信
    await sendLineMessage(lineUserId, [
      buildAnalysisResultMessage({
        tickerCode: result.tickerCode,
        stockName: result.stockName,
        periodType,
        valueStockRating: result.valueStockRating,
        summary: result.summary,
        investmentPoints: result.investmentPoints,
        risks: result.risks,
        usageCount: newUsageCount,
        limit,
      }),
    ]);
  }
};

/**
 * LINE Webhookエンドポイント
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    if (!signature || !verifySignature(body, signature)) {
      console.error("[LINE Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const webhookBody: LineWebhookBody = JSON.parse(body);

    for (const event of webhookBody.events) {
      try {
        if (event.type === "follow" && event.source.type === "user") {
          await handleFollowEvent(event as LineFollowEvent);
        } else if (
          event.type === "message" &&
          event.source.type === "user" &&
          "message" in event &&
          (event as LineMessageEvent).message.type === "text"
        ) {
          await handleMessageEvent(event as LineMessageEvent);
        } else if (event.type === "postback" && event.source.type === "user") {
          await handlePostbackEvent(event as LinePostbackEvent);
        }
      } catch (eventError) {
        console.error("[LINE Webhook] Event processing error:", eventError);
        // 個別イベントのエラーは続行
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[LINE Webhook] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
