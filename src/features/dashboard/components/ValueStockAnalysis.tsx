"use client";

import { useState } from "react";
import { css } from "../../../../styled-system/css";
import { useValueStockScoring } from "../hooks/useValueStockScoring";
import { PeriodTypeToggle } from "./PeriodTypeToggle";
import { ValueStockTable } from "./ValueStockTable";

export const ValueStockAnalysis = () => {
  const [periodType, setPeriodType] = useState<"weekly" | "monthly">("monthly");
  const { data, loading, error } = useValueStockScoring({ periodType, limit: 20 });

  return (
    <section>
      <div className={headerStyle}>
        <h2 className={sectionTitleStyle}>割安株スコア上位</h2>
        <PeriodTypeToggle periodType={periodType} onToggle={setPeriodType} />
      </div>

      {loading ? (
        <div className={messageContainerStyle}>
          <p className={loadingStyle}>読み込み中...</p>
        </div>
      ) : error ? (
        <div className={messageContainerStyle}>
          <p className={errorStyle}>データの取得に失敗しました: {error.message}</p>
        </div>
      ) : data.length === 0 ? (
        <div className={messageContainerStyle}>
          <p className={loadingStyle}>指標データがありません</p>
        </div>
      ) : (
        <ValueStockTable data={data} />
      )}
    </section>
  );
};

const headerStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
});

const sectionTitleStyle = css({
  fontSize: "1.25rem",
  fontWeight: "600",
  color: "text",
});

const messageContainerStyle = css({
  backgroundColor: "cardBg",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
});

const loadingStyle = css({
  color: "textMuted",
  fontSize: "0.875rem",
  padding: "2rem",
  textAlign: "center",
});

const errorStyle = css({
  color: "error",
  fontSize: "0.875rem",
  padding: "2rem",
  textAlign: "center",
});
