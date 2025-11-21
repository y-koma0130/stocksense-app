"use client";

import { useState } from "react";
import { css } from "../../../../styled-system/css";
import { useTopStockScores } from "../hooks/useTopStockScores";
import { ScoreTypeToggle } from "./ScoreTypeToggle";
import { StockScoresTable } from "./StockScoresTable";

export const TopStockScores = () => {
  const [scoreType, setScoreType] = useState<"mid_term" | "long_term">("long_term");
  const { data, loading, error } = useTopStockScores({ limit: 20, scoreType });

  return (
    <section>
      <div className={headerStyle}>
        <h2 className={sectionTitleStyle}>割安株スコア上位</h2>
        <ScoreTypeToggle scoreType={scoreType} onToggle={setScoreType} />
      </div>

      {loading ? (
        <div className={messageContainerStyle}>
          <p className={loadingStyle}>読み込み中...</p>
        </div>
      ) : error ? (
        <div className={messageContainerStyle}>
          <p className={errorStyle}>データの取得に失敗しました: {error}</p>
        </div>
      ) : data.length === 0 ? (
        <div className={messageContainerStyle}>
          <p className={loadingStyle}>スコアデータがありません</p>
        </div>
      ) : (
        <StockScoresTable data={data} />
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
