import { atom, useAtomValue, useSetAtom } from "jotai";

/**
 * 通知対象リスト情報
 */
type NotificationTargetList = Readonly<{
  id: string;
  name: string;
}>;

const notificationTargetListAtom = atom<NotificationTargetList | null>(null);

export const useNotificationTargetList = () => useAtomValue(notificationTargetListAtom);
export const useSetNotificationTargetList = () => useSetAtom(notificationTargetListAtom);
