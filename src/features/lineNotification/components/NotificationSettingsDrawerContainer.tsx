"use client";

import { useNotificationTargetList } from "@/features/filterList/stores/notificationTargetList";
import { trpc } from "../../../../trpc/client";
import {
  useNotificationDrawerOpen,
  useSetNotificationDrawerOpen,
} from "../stores/notificationDrawer";
import { NotificationSettingsDrawer } from "./NotificationSettingsDrawer";

const LINE_ADD_FRIEND_URL =
  process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL ?? "https://line.me/R/ti/p/";

export const NotificationSettingsDrawerContainer = () => {
  const isOpen = useNotificationDrawerOpen();
  const setIsOpen = useSetNotificationDrawerOpen();
  const notificationTargetList = useNotificationTargetList();
  const utils = trpc.useUtils();

  const { data: settings, isLoading } = trpc.lineNotification.getSettings.useQuery(undefined, {
    enabled: isOpen,
  });

  const updateMutation = trpc.lineNotification.updateNotificationEnabled.useMutation({
    onMutate: async (variables) => {
      // 進行中のrefetchをキャンセル
      await utils.lineNotification.getSettings.cancel();

      // 現在のデータを取得してバックアップ
      const previousSettings = utils.lineNotification.getSettings.getData();

      // 楽観的更新: UIを即座に更新
      if (previousSettings) {
        utils.lineNotification.getSettings.setData(undefined, {
          ...previousSettings,
          notificationEnabled: variables.enabled,
        });
      }

      return { previousSettings };
    },
    onError: (_err, _variables, context) => {
      // エラー時はロールバック
      if (context?.previousSettings) {
        utils.lineNotification.getSettings.setData(undefined, context.previousSettings);
      }
    },
    onSettled: () => {
      // mutation完了後にキャッシュを無効化して最新データを取得
      utils.lineNotification.getSettings.invalidate();
    },
  });

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleToggleNotification = () => {
    if (settings) {
      updateMutation.mutate({ enabled: !settings.notificationEnabled });
    }
  };

  return (
    <NotificationSettingsDrawer
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isLoading}
      isLinked={!!settings}
      notificationEnabled={settings?.notificationEnabled ?? false}
      onToggleNotification={handleToggleNotification}
      lineAddFriendUrl={LINE_ADD_FRIEND_URL}
      notificationTargetListName={notificationTargetList?.name}
    />
  );
};
