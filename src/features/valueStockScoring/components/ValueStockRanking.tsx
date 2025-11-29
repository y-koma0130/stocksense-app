"use client";

import { useMemo, useState } from "react";
import type { ValueStockDto } from "@/server/features/valueStockScoring/application/dto/valueStock.dto";
import { css } from "../../../../styled-system/css";
import { trpc } from "../../../../trpc/client";
import { useValueStockScoring } from "../hooks/useValueStockScoring";
import { PeriodTypeToggle } from "./PeriodTypeToggle";
import { ScoringInfoBanner } from "./ScoringInfoBanner";
import { ValueStockDrawer } from "./ValueStockDrawer";
import { ValueStockTable } from "./ValueStockTable";
import { ValueStockTableSkeleton } from "./ValueStockTableSkeleton";

export const ValueStockRanking = () => {
  const [periodType, setPeriodType] = useState<"mid_term" | "long_term">("mid_term");
  const [selectedStock, setSelectedStock] = useState<ValueStockDto | null>(null);
  const { data, loading, error } = useValueStockScoring({ periodType, limit: 20 });

  // 表示中の銘柄IDリストを取得
  const stockIds = useMemo(() => data.map((stock) => stock.stockId), [data]);

  // 複数銘柄の解析状況を一括取得
  const { data: analysisStatuses } = trpc.stockAnalysis.getBulkAnalysisStatus.useQuery(
    {
      stockIds,
      periodType,
    },
    {
      enabled: stockIds.length > 0,
    },
  );

  // 解析済みstockIdのSetを作成
  const analyzedStockIds = useMemo(() => {
    if (!analysisStatuses) return new Set<string>();
    return new Set(
      analysisStatuses.filter((status) => status.hasAnalysis).map((status) => status.stockId),
    );
  }, [analysisStatuses]);

  // 収集日をフォーマット
  const collectedAt = data[0]?.collectedAt;
  const formattedDate = collectedAt
    ? new Date(collectedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <section>
      <div className={headerStyle}>
        <div className={titleContainerStyle}>
          <h2 className={sectionTitleStyle}>割安株スコア上位</h2>
          {formattedDate && <span className={dateStyle}>{formattedDate}時点</span>}
        </div>
        <PeriodTypeToggle periodType={periodType} onToggle={setPeriodType} />
      </div>

      <ScoringInfoBanner />

      {loading ? (
        <ValueStockTableSkeleton rowCount={10} />
      ) : error ? (
        <div className={errorContainerStyle}>
          <p className={errorStyle}>データの取得に失敗しました: {error.message}</p>
        </div>
      ) : data.length === 0 ? (
        <div className={emptyContainerStyle}>
          <p className={emptyStyle}>指標データがありません</p>
        </div>
      ) : (
        <ValueStockTable
          data={data}
          onRowClick={setSelectedStock}
          analyzedStockIds={analyzedStockIds}
        />
      )}

      <ValueStockDrawer
        stock={selectedStock}
        isOpen={selectedStock !== null}
        onClose={() => setSelectedStock(null)}
        periodType={periodType}
      />
    </section>
  );
};

const headerStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
});

const titleContainerStyle = css({
  display: "flex",
  alignItems: "baseline",
  gap: "0.75rem",
});

const sectionTitleStyle = css({
  fontSize: "1.25rem",
  fontWeight: "600",
  color: "text",
});

const dateStyle = css({
  fontSize: "0.875rem",
  color: "textMuted",
  fontWeight: "400",
});

const errorContainerStyle = css({
  backgroundColor: "cardBg",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
});

const emptyContainerStyle = css({
  backgroundColor: "cardBg",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
});

const errorStyle = css({
  color: "error",
  fontSize: "0.875rem",
  padding: "2rem",
  textAlign: "center",
});

const emptyStyle = css({
  color: "textMuted",
  fontSize: "0.875rem",
  padding: "2rem",
  textAlign: "center",
});
