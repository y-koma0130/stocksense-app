"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_FILTER_LIST_ID, DEFAULT_FILTER_LIST_NAME } from "@/assets/filterListDefaults";
import { useFilterListDrawerOpen, useSetFilterListDrawerOpen } from "../stores/filterListDrawer";
import { useSetNotificationTargetList } from "../stores/notificationTargetList";
import type { FilterList } from "../types/filterList";
import { FilterListDrawer } from "./FilterListDrawer";
import { FilterListEditDrawer } from "./FilterListEditDrawer";

// TODO: 実際のデータ取得に置き換え
const mockFilterLists: FilterList[] = [
  {
    id: "1",
    name: "プライム高配当",
    filterConditions: {
      markets: ["プライム"],
      priceRange: { min: 1000, max: 5000 },
    },
    isNotificationTarget: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const FilterListDrawerContainer = () => {
  const isOpen = useFilterListDrawerOpen();
  const setDrawerOpen = useSetFilterListDrawerOpen();
  const setNotificationTargetList = useSetNotificationTargetList();

  // 編集中のリストID（nullなら新規作成、undefinedなら編集画面を表示しない）
  const [editingListId, setEditingListId] = useState<string | null | undefined>(undefined);

  // TODO: 実際のデータに置き換え
  const [filterLists] = useState<FilterList[]>(mockFilterLists);
  const [notificationTargetId, setNotificationTargetId] = useState<string | null>(
    DEFAULT_FILTER_LIST_ID,
  );

  // TODO: プラン情報から取得
  const maxListCount = 1; // Freeプランは1件まで

  // 通知対象リストが変更されたらグローバルstoreを更新
  useEffect(() => {
    if (notificationTargetId === DEFAULT_FILTER_LIST_ID) {
      setNotificationTargetList({ id: DEFAULT_FILTER_LIST_ID, name: DEFAULT_FILTER_LIST_NAME });
    } else {
      const targetList = filterLists.find((l) => l.id === notificationTargetId);
      if (targetList) {
        setNotificationTargetList({ id: targetList.id, name: targetList.name });
      }
    }
  }, [notificationTargetId, filterLists, setNotificationTargetList]);

  const handleClose = useCallback(() => {
    setDrawerOpen(false);
  }, [setDrawerOpen]);

  const handleSelectList = useCallback((listId: string) => {
    // TODO: ダッシュボードの表示をこのリストでフィルタリング
    console.log("Select list:", listId);
  }, []);

  const handleEditList = useCallback((listId: string) => {
    setEditingListId(listId);
  }, []);

  const handleCreateList = useCallback(() => {
    setEditingListId(null); // nullは新規作成
  }, []);

  const handleSetNotificationTarget = useCallback((listId: string) => {
    setNotificationTargetId(listId);
    // TODO: APIでの保存
  }, []);

  const handleEditClose = useCallback(() => {
    setEditingListId(undefined);
  }, []);

  const handleSave = useCallback((list: Omit<FilterList, "id" | "createdAt" | "updatedAt">) => {
    // TODO: APIでの保存
    console.log("Save list:", list);
    setEditingListId(undefined);
  }, []);

  const handleDelete = useCallback((listId: string) => {
    // TODO: APIでの削除
    console.log("Delete list:", listId);
    setEditingListId(undefined);
  }, []);

  const editingList =
    editingListId === null
      ? null // 新規作成
      : filterLists.find((l) => l.id === editingListId);

  return (
    <>
      <FilterListDrawer
        isOpen={isOpen}
        onClose={handleClose}
        filterLists={filterLists}
        notificationTargetId={notificationTargetId}
        onSelectList={handleSelectList}
        onEditList={handleEditList}
        onCreateList={handleCreateList}
        onSetNotificationTarget={handleSetNotificationTarget}
        maxListCount={maxListCount}
      />
      {editingListId !== undefined && (
        <FilterListEditDrawer
          isOpen={editingListId !== undefined}
          onClose={handleEditClose}
          editingList={editingList ?? undefined}
          onSave={handleSave}
          onDelete={editingList ? () => handleDelete(editingList.id) : undefined}
        />
      )}
    </>
  );
};
