"use client";

import { css } from "../../../../styled-system/css";

type FilterListItemProps = Readonly<{
  id: string;
  name: string;
  description: string;
  isNotificationTarget: boolean;
  isDefault: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onSetNotificationTarget: () => void;
}>;

export const FilterListItem = ({
  name,
  description,
  isNotificationTarget,
  isDefault,
  onSelect,
  onEdit,
  onSetNotificationTarget,
}: FilterListItemProps) => {
  return (
    <div className={listItemStyle} data-notification={isNotificationTarget}>
      <button type="button" onClick={onSelect} className={listItemContentStyle}>
        <div className={listItemHeaderStyle}>
          <span className={listItemNameStyle}>{name}</span>
          {isNotificationTarget && <span className={notificationBadgeStyle}>通知中</span>}
        </div>
        <p className={listItemDescriptionStyle}>{description}</p>
      </button>
      <div className={listItemActionsStyle}>
        {!isDefault && onEdit && (
          <button type="button" onClick={onEdit} className={actionButtonStyle} title="編集">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
        {!isNotificationTarget && (
          <button
            type="button"
            onClick={onSetNotificationTarget}
            className={setNotificationButtonStyle}
            title="通知に設定"
          >
            通知に設定
          </button>
        )}
      </div>
    </div>
  );
};

const listItemStyle = css({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  padding: "0.875rem 1rem",
  backgroundColor: "cardBgHover",
  borderRadius: "8px",
  border: "1px solid transparent",
  transition: "all 0.2s",
  '&[data-notification="true"]': {
    borderColor: "accent",
    backgroundColor: "cardBg",
  },
  _hover: {
    backgroundColor: "cardBg",
  },
});

const listItemContentStyle = css({
  flex: 1,
  background: "none",
  border: "none",
  padding: 0,
  textAlign: "left",
  cursor: "pointer",
  minWidth: 0,
});

const listItemHeaderStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginBottom: "0.25rem",
});

const listItemNameStyle = css({
  fontSize: "0.9375rem",
  fontWeight: "600",
  color: "text",
});

const notificationBadgeStyle = css({
  display: "inline-flex",
  alignItems: "center",
  padding: "0.125rem 0.5rem",
  backgroundColor: "accent",
  color: "background",
  fontSize: "0.625rem",
  fontWeight: "700",
  borderRadius: "4px",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
});

const listItemDescriptionStyle = css({
  fontSize: "0.75rem",
  color: "textMuted",
  lineHeight: "1.4",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const listItemActionsStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginLeft: "0.75rem",
  flexShrink: 0,
});

const actionButtonStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px",
  background: "none",
  border: "1px solid",
  borderColor: "border",
  borderRadius: "4px",
  color: "textMuted",
  cursor: "pointer",
  transition: "all 0.2s",
  _hover: {
    borderColor: "accent",
    color: "accent",
  },
});

const setNotificationButtonStyle = css({
  padding: "0.375rem 0.625rem",
  backgroundColor: "transparent",
  border: "1px solid",
  borderColor: "border",
  borderRadius: "4px",
  color: "textMuted",
  fontSize: "0.6875rem",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s",
  whiteSpace: "nowrap",
  _hover: {
    borderColor: "accent",
    color: "accent",
  },
});
