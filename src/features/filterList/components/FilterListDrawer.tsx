"use client";

import { DEFAULT_FILTER_LIST_ID, DEFAULT_FILTER_LIST_NAME } from "@/assets/filterListDefaults";
import { Drawer } from "@/components/ui/Drawer";
import { css } from "../../../../styled-system/css";
import type { FilterList } from "../types/filterList";
import { formatFilterDescription } from "../utils/formatFilterDescription";
import { FilterListItem } from "./FilterListItem";

type FilterListDrawerProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  filterLists: FilterList[];
  notificationTargetId: string | null;
  onSelectList: (listId: string) => void;
  onEditList: (listId: string) => void;
  onCreateList: () => void;
  onSetNotificationTarget: (listId: string) => void;
  maxListCount: number;
}>;

export const FilterListDrawer = ({
  isOpen,
  onClose,
  filterLists,
  notificationTargetId,
  onSelectList,
  onEditList,
  onCreateList,
  onSetNotificationTarget,
  maxListCount,
}: FilterListDrawerProps) => {
  const canCreateMore = filterLists.length < maxListCount;
  const effectiveNotificationTargetId = notificationTargetId ?? DEFAULT_FILTER_LIST_ID;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="マイリスト" width="420px">
      <div className={containerStyle}>
        {/* 説明テキスト */}
        <p className={descriptionStyle}>
          絞り込み条件を設定したリストを作成し、通知対象として選択できます。
        </p>

        {/* デフォルトリスト */}
        <div className={listSectionStyle}>
          <FilterListItem
            id={DEFAULT_FILTER_LIST_ID}
            name={DEFAULT_FILTER_LIST_NAME}
            description="フィルターなし"
            isNotificationTarget={effectiveNotificationTargetId === DEFAULT_FILTER_LIST_ID}
            isDefault
            onSelect={() => onSelectList(DEFAULT_FILTER_LIST_ID)}
            onSetNotificationTarget={() => onSetNotificationTarget(DEFAULT_FILTER_LIST_ID)}
          />
        </div>

        {/* ユーザー作成リスト */}
        {filterLists.length > 0 && (
          <div className={listSectionStyle}>
            <h4 className={sectionTitleStyle}>カスタムリスト</h4>
            {filterLists.map((list) => (
              <FilterListItem
                key={list.id}
                id={list.id}
                name={list.name}
                description={formatFilterDescription(list.filterConditions)}
                isNotificationTarget={effectiveNotificationTargetId === list.id}
                isDefault={false}
                onSelect={() => onSelectList(list.id)}
                onEdit={() => onEditList(list.id)}
                onSetNotificationTarget={() => onSetNotificationTarget(list.id)}
              />
            ))}
          </div>
        )}

        {/* 新規作成ボタン */}
        <div className={createButtonContainerStyle}>
          {canCreateMore ? (
            <button type="button" onClick={onCreateList} className={createButtonStyle}>
              <span className={plusIconStyle}>+</span>
              新しいリストを作成
            </button>
          ) : (
            <div className={limitReachedStyle}>
              <p>リスト数の上限に達しました（{maxListCount}件）</p>
              <p className={upgradeNoteStyle}>有料プランで上限を解除（準備中）</p>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

const containerStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
});

const descriptionStyle = css({
  fontSize: "0.875rem",
  color: "textMuted",
  lineHeight: "1.6",
});

const listSectionStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
});

const sectionTitleStyle = css({
  fontSize: "0.75rem",
  fontWeight: "600",
  color: "textMuted",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "0.25rem",
});

const createButtonContainerStyle = css({
  marginTop: "0.5rem",
});

const createButtonStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  width: "100%",
  padding: "0.875rem",
  backgroundColor: "transparent",
  border: "2px dashed",
  borderColor: "border",
  borderRadius: "8px",
  color: "textMuted",
  fontSize: "0.875rem",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s",
  _hover: {
    borderColor: "accent",
    color: "accent",
  },
});

const plusIconStyle = css({
  fontSize: "1.125rem",
  fontWeight: "300",
});

const limitReachedStyle = css({
  padding: "1rem",
  backgroundColor: "cardBgHover",
  borderRadius: "8px",
  textAlign: "center",
  "& > p:first-child": {
    fontSize: "0.875rem",
    color: "textMuted",
    marginBottom: "0.5rem",
  },
});

const upgradeNoteStyle = css({
  fontSize: "0.75rem",
  color: "textMuted",
});
