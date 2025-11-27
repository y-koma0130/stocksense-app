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

  return `📊 【中期】バリュー株ランキング
更新日: ${today}

${topThree}

--- 4位〜10位 ---
${restLines}

▼ 全ランキング・詳細分析
${getDashboardUrl()}`;
};
