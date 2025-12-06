import { getMacroTagById } from "@/assets/macroTags";
import { getThemeTagById } from "@/assets/themeTags";
import { Tooltip } from "@/components/ui/Tooltip";
import { css } from "../../../../../styled-system/css";

type StockTagBadgesProps = Readonly<{
  macroTagIds: readonly string[];
  themeTagIds: readonly string[];
}>;

export const StockTagBadges = ({ macroTagIds, themeTagIds }: StockTagBadgesProps) => {
  if (macroTagIds.length === 0 && themeTagIds.length === 0) {
    return null;
  }

  return (
    <div className={containerStyle}>
      {macroTagIds.length > 0 && (
        <div className={tagGroupStyle}>
          <span className={tagGroupLabelStyle}>マクロ</span>
          <div className={tagBadgeContainerStyle}>
            {macroTagIds.map((tagId) => {
              const tag = getMacroTagById(tagId);
              return tag ? (
                <Tooltip key={tagId} content={tag.description}>
                  <span className={macroBadgeStyle}>{tag.name}</span>
                </Tooltip>
              ) : null;
            })}
          </div>
        </div>
      )}
      {themeTagIds.length > 0 && (
        <div className={tagGroupStyle}>
          <span className={tagGroupLabelStyle}>テーマ</span>
          <div className={tagBadgeContainerStyle}>
            {themeTagIds.map((tagId) => {
              const tag = getThemeTagById(tagId);
              return tag ? (
                <Tooltip key={tagId} content={tag.description}>
                  <span className={themeBadgeStyle}>{tag.name}</span>
                </Tooltip>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const containerStyle = css({
  marginBottom: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

const tagGroupStyle = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "0.5rem",
});

const tagGroupLabelStyle = css({
  fontSize: "0.75rem",
  color: "textMuted",
  minWidth: "3rem",
  paddingTop: "0.25rem",
});

const tagBadgeContainerStyle = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.375rem",
});

const macroBadgeStyle = css({
  display: "inline-block",
  padding: "0.25rem 0.5rem",
  fontSize: "0.75rem",
  fontWeight: "500",
  borderRadius: "4px",
  backgroundColor: "rgba(59, 130, 246, 0.15)",
  color: "#60a5fa",
  cursor: "help",
  transition: "background-color 0.2s ease",
  _hover: {
    backgroundColor: "rgba(59, 130, 246, 0.25)",
  },
});

const themeBadgeStyle = css({
  display: "inline-block",
  padding: "0.25rem 0.5rem",
  fontSize: "0.75rem",
  fontWeight: "500",
  borderRadius: "4px",
  backgroundColor: "rgba(168, 85, 247, 0.15)",
  color: "#c084fc",
  cursor: "help",
  transition: "background-color 0.2s ease",
  _hover: {
    backgroundColor: "rgba(168, 85, 247, 0.25)",
  },
});
