/**
 * 中期LINE通知ジョブ
 * 毎週月曜7:00 (JST)に実行（個別株分析の後）
 * 1通目: マーケットサマリ + 注目セクター
 * 2通目: 中期上位10銘柄（上位5銘柄にAI分析コメント付き）
 *
 * ユーザーがフィルターリストを設定している場合は、
 * そのフィルター条件に基づいたランキングを通知
 */

import { inngest } from "../../../inngest/client";
import { sendLineMessage } from "../features/lineUsers/infrastructure/externalServices/sendLineMessage";
import { getNotificationEnabledLineUsersWithFilterList } from "../features/lineUsers/infrastructure/queryServices/getNotificationEnabledLineUsersWithFilterList";
import { getLatestMarketAnalysis } from "../features/marketAnalysis/infrastructure/queryServices/getLatestMarketAnalysis";
import { getStockAnalysesByStockIds } from "../features/stockAnalysis/infrastructure/queryServices/getStockAnalysesByStockIds";
import { getTopMidTermValueStocks } from "../features/valueStockScoring/application/usecases/getTopMidTermValueStocks.usecase";
import { calculateMidTermValueStockScore } from "../features/valueStockScoring/domain/services/calculateMidTermValueStockScore.service";
import { filterProMarket } from "../features/valueStockScoring/domain/services/filterProMarket.service";
import { isTrapStock } from "../features/valueStockScoring/domain/services/isTrapStock.service";
import { rankByScore } from "../features/valueStockScoring/domain/services/rankByScore.service";
import { getLatestMidTermIndicators } from "../features/valueStockScoring/infrastructure/queryServices/getIndicators";
import {
  buildMarketSummaryMessage,
  buildRankingMessage,
  buildRankingMessageWithFilterName,
} from "./utils/lineMessageBuilders";
import { toFilterConditions } from "./utils/toFilterConditions";

const PERIOD_TYPE = "mid_term" as const;
const RANKING_LIMIT = 10;

export const weeklyLineNotification = inngest.createFunction(
  {
    id: "mid-term-line-notification",
    name: "Mid-Term LINE Notification",
    retries: 3,
  },
  { cron: "TZ=Asia/Tokyo 0 7 * * 1" }, // 毎週月曜7:00 JST
  async ({ step }) => {
    // ステップ1: 通知対象ユーザーをフィルターリスト情報付きで取得
    const lineUsers = await step.run("fetch-line-users-with-filters", async () => {
      return await getNotificationEnabledLineUsersWithFilterList();
    });

    if (lineUsers.length === 0) {
      return { message: "No LINE users to notify", sentCount: 0 };
    }

    // ステップ2: マーケット分析を取得（全ユーザー共通）
    const marketAnalysis = await step.run("fetch-market-analysis", async () => {
      return await getLatestMarketAnalysis({ periodType: PERIOD_TYPE });
    });

    // ステップ3: ユニークなフィルター条件を収集（効率化のため同じ条件は1回だけ取得）
    // キー: JSON文字列化したフィルター条件, 値: フィルター名（表示用）
    const filterKeyToName = new Map<string, string | null>();
    // デフォルト（フィルターなし）は空文字キーで管理
    const defaultKey = "";
    let hasDefaultFilter = false;

    for (const user of lineUsers) {
      if (user.filterList) {
        const conditions = toFilterConditions(user.filterList);
        const key = JSON.stringify(conditions);
        if (!filterKeyToName.has(key)) {
          filterKeyToName.set(key, user.filterList.name);
        }
      } else {
        hasDefaultFilter = true;
      }
    }

    // デフォルトフィルターがある場合は追加
    if (hasDefaultFilter) {
      filterKeyToName.set(defaultKey, null);
    }

    // ステップ4: 各フィルター条件で上位銘柄を取得
    type StockWithAnalysis = Awaited<ReturnType<typeof getTopMidTermValueStocks>>;
    type StockAnalysisForLine = { valueStockRating: string | null; summary: string | null };
    const filterKeyToStocks = new Map<string, StockWithAnalysis>();
    const filterKeyToAnalyses = new Map<string, Record<string, StockAnalysisForLine>>();

    for (const [filterKey, filterName] of filterKeyToName.entries()) {
      const filterConditions = filterKey === defaultKey ? undefined : JSON.parse(filterKey);
      const stepName = filterKey === defaultKey ? "default" : `filter-${filterName}`;

      // 上位銘柄を取得
      const topStocks = await step.run(`fetch-top-stocks-${stepName}`, async () => {
        return await getTopMidTermValueStocks(
          {
            getLatestMidTermIndicators,
            getLatestMarketAnalysis,
            calculateMidTermValueStockScore,
            filterProMarket,
            isTrapStock,
            rankByScore,
          },
          { limit: RANKING_LIMIT, filterConditions },
        );
      });

      filterKeyToStocks.set(filterKey, topStocks);

      // 上位5銘柄のAI分析を取得
      const stockAnalyses = await step.run(`fetch-analyses-${stepName}`, async () => {
        const top5StockIds = topStocks.slice(0, 5).map((s) => s.stockId);
        const analysisMap = await getStockAnalysesByStockIds({
          stockIds: top5StockIds,
          periodType: PERIOD_TYPE,
        });
        return Object.fromEntries(analysisMap);
      });

      filterKeyToAnalyses.set(filterKey, stockAnalyses);
    }

    // ステップ5: 各ユーザーに通知送信
    let sentCount = 0;
    let failedCount = 0;

    for (const user of lineUsers) {
      // ユーザーのフィルター条件に対応するキーを取得
      const filterKey = user.filterList
        ? JSON.stringify(toFilterConditions(user.filterList))
        : defaultKey;

      const topStocks = filterKeyToStocks.get(filterKey) ?? [];
      const stockAnalyses = filterKeyToAnalyses.get(filterKey) ?? {};
      const analysisMap = new Map<string, StockAnalysisForLine>(Object.entries(stockAnalyses));

      // メッセージを組み立て
      const messages: Array<{ type: "text"; text: string }> = [];

      // 1通目: マーケットサマリ（マーケット分析がある場合のみ）
      if (marketAnalysis) {
        const marketMessage = buildMarketSummaryMessage(marketAnalysis, PERIOD_TYPE);
        messages.push({ type: "text", text: marketMessage });
      }

      // 2通目: ランキング（フィルター名付きまたはデフォルト）
      const filterName = user.filterList?.name ?? null;
      const rankingMessage = filterName
        ? buildRankingMessageWithFilterName(topStocks, PERIOD_TYPE, analysisMap, filterName)
        : buildRankingMessage(topStocks, PERIOD_TYPE, analysisMap);
      messages.push({ type: "text", text: rankingMessage });

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
      message: "Mid-term LINE notification completed",
      totalUsers: lineUsers.length,
      sentCount,
      failedCount,
      uniqueFilters: filterKeyToName.size,
    };
  },
);
