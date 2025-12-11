"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_FILTER_LIST_ID, DEFAULT_FILTER_LIST_NAME } from "@/assets/filterListDefaults";
import { trpc } from "../../../../trpc/client";
import { useFilterListDrawerOpen, useSetFilterListDrawerOpen } from "../stores/filterListDrawer";
import { useSetNotificationTargetList } from "../stores/notificationTargetList";
import type { FilterList } from "../types/filterList";
import { FilterListDrawer } from "./FilterListDrawer";
import { FilterListEditDrawer } from "./FilterListEditDrawer";

export const FilterListDrawerContainer = () => {
  const isOpen = useFilterListDrawerOpen();
  const setDrawerOpen = useSetFilterListDrawerOpen();
  const setNotificationTargetList = useSetNotificationTargetList();
  const utils = trpc.useUtils();

  // 編集中のリストID（nullなら新規作成、undefinedなら編集画面を表示しない）
  const [editingListId, setEditingListId] = useState<string | null | undefined>(undefined);

  // フィルターリスト一覧を取得
  const { data: filterListsData, isLoading: isLoadingLists } = trpc.filterList.list.useQuery(
    undefined,
    {
      enabled: isOpen,
    },
  );

  // 通知設定を取得
  const { data: notificationSettings, isLoading: isLoadingSettings } =
    trpc.filterList.getNotificationTarget.useQuery(undefined, {
      enabled: isOpen,
    });

  // DTOをフロントエンド型に変換
  const filterLists: FilterList[] =
    filterListsData?.map((item) => ({
      id: item.id,
      name: item.name,
      filterConditions: item.filterConditions,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })) ?? [];

  // 通知対象リストID（nullの場合はデフォルト）
  const notificationTargetId =
    notificationSettings?.notificationTargetListId ?? DEFAULT_FILTER_LIST_ID;

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

  // ミューテーション
  const createMutation = trpc.filterList.create.useMutation({
    onSuccess: () => {
      utils.filterList.list.invalidate();
      setEditingListId(undefined);
    },
  });

  const updateMutation = trpc.filterList.update.useMutation({
    onSuccess: () => {
      utils.filterList.list.invalidate();
      setEditingListId(undefined);
    },
  });

  const deleteMutation = trpc.filterList.delete.useMutation({
    onSuccess: () => {
      utils.filterList.list.invalidate();
      utils.filterList.getNotificationTarget.invalidate();
      setEditingListId(undefined);
    },
  });

  const setNotificationTargetMutation = trpc.filterList.setNotificationTarget.useMutation({
    onSuccess: () => {
      utils.filterList.getNotificationTarget.invalidate();
    },
  });

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

  const handleSetNotificationTarget = useCallback(
    (listId: string) => {
      // DEFAULT_FILTER_LIST_IDの場合はnullを送信（デフォルト＝全銘柄）
      const targetListId = listId === DEFAULT_FILTER_LIST_ID ? null : listId;
      setNotificationTargetMutation.mutate({ listId: targetListId });
    },
    [setNotificationTargetMutation],
  );

  const handleEditClose = useCallback(() => {
    setEditingListId(undefined);
  }, []);

  const handleSave = useCallback(
    (list: Omit<FilterList, "id" | "createdAt" | "updatedAt">) => {
      const { filterConditions } = list;

      if (editingListId === null) {
        // 新規作成
        createMutation.mutate({
          name: list.name,
          markets: filterConditions.markets,
          sectorCodes: filterConditions.sectorCodes,
          priceMin: filterConditions.priceRange?.min,
          priceMax: filterConditions.priceRange?.max,
        });
      } else if (editingListId) {
        // 更新
        updateMutation.mutate({
          id: editingListId,
          name: list.name,
          markets: filterConditions.markets,
          sectorCodes: filterConditions.sectorCodes,
          priceMin: filterConditions.priceRange?.min,
          priceMax: filterConditions.priceRange?.max,
        });
      }
    },
    [editingListId, createMutation, updateMutation],
  );

  const handleDelete = useCallback(
    (listId: string) => {
      deleteMutation.mutate({ id: listId });
    },
    [deleteMutation],
  );

  const editingList =
    editingListId === null
      ? null // 新規作成
      : filterLists.find((l) => l.id === editingListId);

  const isLoading = isLoadingLists || isLoadingSettings;

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
        isLoading={isLoading}
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
