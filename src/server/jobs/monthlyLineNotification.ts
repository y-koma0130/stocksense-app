/**
 * 長期LINE通知ジョブ
 * 毎月1日〜3日の7:00 (JST)に実行
 * 最初の平日のみ通知
 * 1通目: マーケットサマリ + 注目セクター
 * 2通目: 長期上位10銘柄（上位5銘柄にAI分析コメント付き）
 */

import { inngest } from "../../../inngest/client";
import { sendLineMessage } from "../features/lineUsers/infrastructure/externalServices/sendLineMessage";
import { getNotificationEnabledLineUsers } from "../features/lineUsers/infrastructure/queryServices/getNotificationEnabledLineUsers";
import { getLatestMarketAnalysis } from "../features/marketAnalysis/infrastructure/queryServices/getLatestMarketAnalysis";
import { getStockAnalysesByStockIds } from "../features/stockAnalysis/infrastructure/queryServices/getStockAnalysesByStockIds";
import { getTopLongTermValueStocks } from "../features/valueStockScoring/application/usecases/getTopLongTermValueStocks.usecase";
import { getLatestLongTermIndicators } from "../features/valueStockScoring/infrastructure/queryServices/getIndicators";
import { isFirstWeekdayOfMonth } from "./utils/isFirstWeekdayOfMonth";
import { buildMarketSummaryMessage, buildRankingMessage } from "../utils/lineMessageBuilders";

const PERIOD_TYPE = "long_term" as const;

export const monthlyLineNotification = inngest.createFunction(
  {
    id: "long-term-line-notification",
    name: "Long-Term LINE Notification",
    retries: 3,
  },
  { cron: "TZ=Asia/Tokyo 0 7 1-3 * *" }, // 毎月1日〜3日の7:00 JST
  async ({ step }) => {
    // ステップ1: 最初の平日かどうかを確認
    const shouldRun = await step.run("check-first-weekday", async () => {
      return isFirstWeekdayOfMonth();
      // For testing purposes, you can force it to run every time by uncommenting the line below
      // return true;
    });

    if (!shouldRun) {
      return { message: "Skipped: Not the first weekday of month", sentCount: 0 };
    }

    // ステップ2: 通知対象ユーザーを取得
    const lineUsers = await step.run("fetch-line-users", async () => {
      return await getNotificationEnabledLineUsers();
    });

    if (lineUsers.length === 0) {
      return { message: "No LINE users to notify", sentCount: 0 };
    }

    // ステップ3: マーケット分析を取得
    const marketAnalysis = await step.run("fetch-market-analysis", async () => {
      return await getLatestMarketAnalysis({ periodType: PERIOD_TYPE });
    });

    // ステップ4: 上位10銘柄を取得
    const topStocks = await step.run("fetch-top-stocks", async () => {
      return await getTopLongTermValueStocks({ getLatestLongTermIndicators }, { limit: 10 });
    });

    // ステップ5: 上位5銘柄のAI分析を取得
    const stockAnalyses = await step.run("fetch-stock-analyses", async () => {
      const top5StockIds = topStocks.slice(0, 5).map((s) => s.stockId);
      const analysisMap = await getStockAnalysesByStockIds({
        stockIds: top5StockIds,
        periodType: PERIOD_TYPE,
      });
      // MapをシリアライズするためにオブジェクトIDとデータのペアに変換
      return Object.fromEntries(analysisMap);
    });

    // Mapに戻す
    const analysisMap = new Map(Object.entries(stockAnalyses));

    // ステップ6: メッセージを組み立て
    const messages: Array<{ type: "text"; text: string }> = [];

    // 1通目: マーケットサマリ（マーケット分析がある場合のみ）
    if (marketAnalysis) {
      const marketMessage = buildMarketSummaryMessage(marketAnalysis, PERIOD_TYPE);
      messages.push({ type: "text", text: marketMessage });
    }

    // 2通目: ランキング
    const rankingMessage = buildRankingMessage(topStocks, PERIOD_TYPE, analysisMap);
    messages.push({ type: "text", text: rankingMessage });

    // ステップ7: 各ユーザーに通知送信
    let sentCount = 0;
    let failedCount = 0;

    for (const user of lineUsers) {
      const result = await step.run(`send-to-${user.lineUserId}`, async () => {
        return await sendLineMessage(user.lineUserId, messages);
      });

      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
        console.error(`Failed to send to ${user.lineUserId}:`, result.error);
      }
    }

    return {
      message: "Long-term LINE notification completed",
      totalUsers: lineUsers.length,
      sentCount,
      failedCount,
      messagesPerUser: messages.length,
    };
  },
);
