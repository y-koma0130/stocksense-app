import type { PeriodType } from "@/constants/periodTypes";
import {
  VALUE_STOCK_RATING_LABELS,
  VALUE_STOCK_RATING_COLORS,
} from "@/constants/valueStockRatings";
import { getRatingColorFromKey } from "@/constants/colors";
import type { StockAnalysisDto } from "@/server/features/stockAnalysis/application/dto/stockAnalysis.dto";
import { css } from "../../../../styled-system/css";

type StockAnalysisSectionProps = Readonly<{
  analysis: StockAnalysisDto | null;
  loading: boolean;
  periodType: PeriodType;
}>;

/**
 * 評価レーティングに応じた色を返す
 */
const getRatingColor = (rating: string | null): string => {
  if (!rating) return getRatingColorFromKey("fair");
  const colorKey = VALUE_STOCK_RATING_COLORS[rating as keyof typeof VALUE_STOCK_RATING_COLORS];
  return getRatingColorFromKey(colorKey);
};

export const StockAnalysisSection = ({ analysis, loading }: StockAnalysisSectionProps) => {
  if (loading) {
    return (
      <div className={sectionStyle}>
        <h4 className={sectionTitleStyle}>AI分析レポート</h4>
        <div className={loadingContainerStyle}>
          <p className={loadingTextStyle}>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={sectionStyle}>
        <h4 className={sectionTitleStyle}>AI分析レポート</h4>
        <div className={noDataContainerStyle}>
          <p className={noDataTextStyle}>まだ分析が実行されていません</p>
        </div>
      </div>
    );
  }

  const ratingLabel = analysis.valueStockRating
    ? VALUE_STOCK_RATING_LABELS[analysis.valueStockRating]
    : "評価なし";
  const ratingColor = getRatingColor(analysis.valueStockRating);

  const analyzedDate = new Date(analysis.analyzedAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={sectionStyle}>
      <div className={headerContainerStyle}>
        <h4 className={sectionTitleStyle}>AI分析レポート</h4>
        <span className={analyzedDateStyle}>{analyzedDate}時点</span>
      </div>

      {/* AI生成免責事項 */}
      <div className={disclaimerStyle}>
        ⓘ この分析はAIによって自動生成されたものです。投資判断の参考情報としてご利用ください。
      </div>

      {/* バリュー株評価と総合評価 */}
      <div className={ratingAndSummaryContainerStyle}>
        <div className={ratingContainerStyle}>
          <div className={ratingLabelStyle}>バリュー株評価</div>
          <div className={ratingBadgeStyle} style={{ backgroundColor: ratingColor }}>
            {ratingLabel}
          </div>
        </div>

        {/* 総合評価 */}
        {analysis.summary && <p className={summaryTextStyle}>{analysis.summary}</p>}
      </div>

      {/* 投資魅力とリスクを並べて表示 */}
      <div className={twoColumnContainerStyle}>
        {/* 投資する場合の魅力ポイント */}
        {analysis.investmentPoints.length > 0 && (
          <div className={subsectionStyle}>
            <h5 className={subsectionTitleStyle}>投資魅力ポイント</h5>
            <ul className={listStyle}>
              {analysis.investmentPoints.map((point, index) => (
                <li key={index} className={listItemStyle}>
                  <span className={bulletPositiveStyle}>✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 注意すべきリスク */}
        {analysis.risks.length > 0 && (
          <div className={subsectionStyle}>
            <h5 className={subsectionTitleStyle}>注意すべきリスク</h5>
            <ul className={listStyle}>
              {analysis.risks.map((risk, index) => (
                <li key={index} className={listItemStyle}>
                  <span className={bulletNegativeStyle}>⚠</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const sectionStyle = css({
  marginBottom: "1rem",
  paddingTop: "0.5rem",
  borderTop: "1px solid",
  borderColor: "border",
});

const headerContainerStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const sectionTitleStyle = css({
  fontSize: "0.875rem",
  fontWeight: "600",
  color: "textMuted",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
});

const analyzedDateStyle = css({
  fontSize: "0.75rem",
  color: "textMuted",
});

const disclaimerStyle = css({
  fontSize: "0.75rem",
  color: "textMuted",
  backgroundColor: "surfaceHover",
  padding: "0.5rem 0.75rem",
  borderRadius: "6px",
  lineHeight: "1.4",
});

const loadingContainerStyle = css({
  backgroundColor: "surfaceHover",
  padding: "2rem",
  borderRadius: "8px",
  textAlign: "center",
});

const loadingTextStyle = css({
  fontSize: "0.875rem",
  color: "textMuted",
});

const noDataContainerStyle = css({
  backgroundColor: "surfaceHover",
  padding: "2rem",
  borderRadius: "8px",
  textAlign: "center",
});

const noDataTextStyle = css({
  fontSize: "0.875rem",
  color: "textMuted",
});

const ratingAndSummaryContainerStyle = css({
  backgroundColor: "surfaceHover",
  padding: "1rem",
  borderRadius: "8px",
  marginBottom: "1rem",
});

const ratingContainerStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
});

const ratingLabelStyle = css({
  fontSize: "0.875rem",
  fontWeight: "500",
  color: "text",
});

const ratingBadgeStyle = css({
  fontSize: "0.8125rem",
  fontWeight: "600",
  color: "white",
  padding: "0.25rem 0.75rem",
  borderRadius: "4px",
});

const summaryTextStyle = css({
  fontSize: "0.875rem",
  lineHeight: "1.6",
  color: "text",
});

const twoColumnContainerStyle = css({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.5rem",
  marginBottom: "1rem",
});

const subsectionStyle = css({
  marginBottom: "1rem",
});

const subsectionTitleStyle = css({
  fontSize: "0.8125rem",
  fontWeight: "600",
  color: "text",
  marginBottom: "0.5rem",
});

const listStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

const listItemStyle = css({
  display: "flex",
  gap: "0.5rem",
  fontSize: "0.875rem",
  lineHeight: "1.6",
  color: "text",
  backgroundColor: "surfaceHover",
  padding: "0.75rem 1rem",
  borderRadius: "6px",
});

const bulletPositiveStyle = css({
  color: "#22c55e",
  fontWeight: "700",
  fontSize: "1rem",
  flexShrink: 0,
});

const bulletNegativeStyle = css({
  color: "#f97316",
  fontWeight: "700",
  fontSize: "1rem",
  flexShrink: 0,
});
