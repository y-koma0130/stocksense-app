"use client";

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

  const {
    data: settings,
    refetch,
    isLoading,
  } = trpc.lineNotification.getSettings.useQuery(undefined, {
    enabled: isOpen,
  });

  const updateMutation = trpc.lineNotification.updateNotificationEnabled.useMutation({
    onSuccess: () => {
      refetch();
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
    />
  );
};
