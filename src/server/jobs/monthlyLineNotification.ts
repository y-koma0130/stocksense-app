import { inngest } from "../../../inngest/client";
import { sendLineMessage } from "../features/lineNotification/infrastructure/externalServices/sendLineMessage";
import { getNotificationEnabledLineUsers } from "../features/lineNotification/infrastructure/queryServices/getNotificationEnabledLineUsers";
import { getTopValueStocks } from "../features/valueStockScoring/application/usecases/getTopValueStocks.usecase";
import { getLatestIndicators } from "../features/valueStockScoring/infrastructure/queryServices/getIndicators";

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
 * 長期LINE通知ジョブ（旧: 月次）
 * 毎月1日〜3日の7:00 (JST)に実行
 * 最初の平日のみ長期上位10銘柄をLINE通知で送信
 */
export const monthlyLineNotification = inngest.createFunction(
  {
    id: "long-term-line-notification",
    name: "Long-Term LINE Notification",
    retries: 3,
  },
  { cron: "TZ=Asia/Tokyo 0 7 1-3 * *" }, // 毎月1日〜3日の7:00 JST（個別株分析の後）
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
        { getLatestIndicators },
        { periodType: "long_term", limit: 10 },
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
      message: "Long-term LINE notification completed",
      totalUsers: lineUsers.length,
      sentCount,
      failedCount,
    };
  },
);

type TopStock = {
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

  if (position <= 20) return "📍 底値圏";
  if (position <= 40) return "📉 安値圏";
  if (position <= 60) return "➖ 中間";
  if (position <= 80) return "📈 高値圏";
  return "⚠️ 天井圏";
};

/**
 * RSI状態を判定
 */
const getRSIStatus = (rsi: number | null): string => {
  if (!rsi) return "";
  if (rsi <= 30) return "🔵 売られすぎ";
  if (rsi <= 50) return "🟢 やや売られ気味";
  if (rsi <= 70) return "🟡 やや過熱";
  return "🔴 買われすぎ";
};

/**
 * 業種平均比を計算してフォーマット
 */
const formatRatio = (value: number | null, average: number | null, label: string): string => {
  if (!value || !average || average <= 0) return "";

  const ratio = Math.round((value / average) * 100);
  const arrow = ratio < 100 ? "⬇️" : "⬆️";
  return `${label} ${value.toFixed(1)} (業種比${ratio}%) ${arrow}`;
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

const buildNotificationMessage = (stocks: TopStock[]): string => {
  // 上位3銘柄は詳細表示
  const topThree = stocks
    .slice(0, 3)
    .map((stock, index) => {
      const rank = index + 1;
      const score = Math.round(stock.valueScore.totalScore * 100);
      const medal = getMedalEmoji(rank);

      const lines = [
        `${medal} ${stock.tickerCode} ${stock.name} (${score}点)`,
        stock.currentPrice ? `💰 ${stock.currentPrice.toLocaleString()}円` : "",
        formatRatio(stock.per, stock.sectorAvgPer, "PER"),
        formatRatio(stock.pbr, stock.sectorAvgPbr, "PBR"),
        getRSIStatus(stock.rsi),
        getPricePosition(stock.currentPrice, stock.priceHigh, stock.priceLow),
      ];

      return lines.filter((line) => line !== "").join(" | ");
    })
    .join("\n\n");

  // 4位以降は簡略表示
  const restLines = stocks
    .slice(3)
    .map((stock, index) => {
      const rank = index + 4;
      const score = Math.round(stock.valueScore.totalScore * 100);
      const price = stock.currentPrice ? `${stock.currentPrice.toLocaleString()}円` : "-";
      return `${rank}. ${stock.tickerCode} ${stock.name} (${score}点) ${price}`;
    })
    .join("\n");

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return `📊 【長期】バリュー株ランキング
更新日: ${today}

${topThree}

--- 4位〜10位 ---
${restLines}

▼ 全ランキング・詳細分析
${getDashboardUrl()}`;
};
