import { atom, useAtomValue, useSetAtom } from "jotai";

const notificationDrawerOpenAtom = atom<boolean>(false);

export const useNotificationDrawerOpen = () => useAtomValue(notificationDrawerOpenAtom);
export const useSetNotificationDrawerOpen = () => useSetAtom(notificationDrawerOpenAtom);
