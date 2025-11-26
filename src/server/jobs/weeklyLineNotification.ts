import { inngest } from "../../../inngest/client";
import { sendLineMessage } from "../features/lineNotification/infrastructure/externalServices/sendLineMessage";
import { getNotificationEnabledLineUsers } from "../features/lineNotification/infrastructure/queryServices/getNotificationEnabledLineUsers";
import { getTopValueStocks } from "../features/valueStockScoring/application/usecases/getTopValueStocks.usecase";
import { getLatestIndicators } from "../features/valueStockScoring/infrastructure/queryServices/getIndicators";

const getDashboardUrl = () => `https://${process.env.SERVICE_DOMAIN}/dashboard`;

/**
 * 中期LINE通知ジョブ（旧: 週次）
 * 毎週月曜8:00 (JST)に実行
 * 中期上位10銘柄をLINE通知で送信
 */
export const weeklyLineNotification = inngest.createFunction(
  {
    id: "mid-term-line-notification",
    name: "Mid-Term LINE Notification",
    retries: 3,
  },
  { cron: "TZ=Asia/Tokyo 0 8 * * 1" }, // 毎週月曜8:00 JST
  async ({ step }) => {
    // ステップ1: 通知対象ユーザーを取得
    const lineUsers = await step.run("fetch-line-users", async () => {
      return await getNotificationEnabledLineUsers();
    });

    if (lineUsers.length === 0) {
      return { message: "No LINE users to notify", sentCount: 0 };
    }

    // ステップ2: 上位10銘柄を取得
    const topStocks = await step.run("fetch-top-stocks", async () => {
      return await getTopValueStocks(
        { getLatestIndicators },
        { periodType: "mid_term", limit: 10 },
      );
    });

    // ステップ3: メッセージを組み立て
    const message = buildNotificationMessage(topStocks);

    // ステップ4: 各ユーザーに通知送信
    let sentCount = 0;
    let failedCount = 0;

    for (const user of lineUsers) {
      const result = await step.run(`send-to-${user.lineUserId}`, async () => {
        return await sendLineMessage(user.lineUserId, [{ type: "text", text: message }]);
      });

      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
        console.error(`Failed to send to ${user.lineUserId}:`, result.error);
      }
    }

    return {
      message: "Mid-term LINE notification completed",
      totalUsers: lineUsers.length,
      sentCount,
      failedCount,
    };
  },
);

type TopStock = {
  tickerCode: string;
  name: string;
  valueScore: { totalScore: number };
};

const buildNotificationMessage = (stocks: TopStock[]): string => {
  const stockLines = stocks
    .map(
      (stock, index) =>
        `${index + 1}. ${stock.tickerCode} ${stock.name} (${(stock.valueScore.totalScore * 100).toFixed(1)}点)`,
    )
    .join("\n");

  return `📊 中期バリュー株ランキング

${stockLines}

▼ 詳細はこちら
${getDashboardUrl()}`;
};
