import { inngest } from "../../../inngest/client";
import { sendLineMessage } from "../features/lineNotification/infrastructure/externalServices/sendLineMessage";
import { getNotificationEnabledLineUsers } from "../features/lineNotification/infrastructure/queryServices/getNotificationEnabledLineUsers";
import { getTopValueStocks } from "../features/valueStockScoring/application/usecases/getTopValueStocks.usecase";
import { getLatestStockIndicators } from "../features/valueStockScoring/infrastructure/queryServices/getStockIndicators";

const getDashboardUrl = () => `https://${process.env.SERVICE_DOMAIN}/dashboard`;

/**
 * 月の最初の平日かどうかを判定
 * 祝日は考慮しない
 */
const isFirstWeekdayOfMonth = (): boolean => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();

  let firstWeekday: number;
  if (dayOfWeek === 0) {
    // 1日が日曜 → 2日（月曜）が最初の平日
    firstWeekday = 2;
  } else if (dayOfWeek === 6) {
    // 1日が土曜 → 3日（月曜）が最初の平日
    firstWeekday = 3;
  } else {
    // 1日が平日 → 1日が最初の平日
    firstWeekday = 1;
  }

  return today === firstWeekday;
};

/**
 * 月次LINE通知ジョブ
 * 毎月1日〜3日の8:00 (JST)に実行
 * 最初の平日のみ月次上位10銘柄をLINE通知で送信
 */
export const monthlyLineNotification = inngest.createFunction(
  {
    id: "monthly-line-notification",
    name: "Monthly LINE Notification",
    retries: 3,
  },
  { cron: "TZ=Asia/Tokyo 0 8 1-3 * *" }, // 毎月1日〜3日の8:00 JST
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

    // ステップ3: 上位10銘柄を取得
    const topStocks = await step.run("fetch-top-stocks", async () => {
      return await getTopValueStocks(
        { getLatestStockIndicators },
        { periodType: "monthly", limit: 10 },
      );
    });

    // ステップ4: メッセージを組み立て
    const message = buildNotificationMessage(topStocks);

    // ステップ5: 各ユーザーに通知送信
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
      message: "Monthly LINE notification completed",
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
        `${index + 1}. ${stock.tickerCode} ${stock.name} (${stock.valueScore.totalScore.toFixed(1)}点)`,
    )
    .join("\n");

  return `📊 月次バリュー株ランキング

${stockLines}

▼ 詳細はこちら
${getDashboardUrl()}`;
};
