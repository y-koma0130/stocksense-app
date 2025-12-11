import { atom, useAtomValue, useSetAtom } from "jotai";

const filterListDrawerOpenAtom = atom<boolean>(false);

export const useFilterListDrawerOpen = () => useAtomValue(filterListDrawerOpenAtom);
export const useSetFilterListDrawerOpen = () => useSetAtom(filterListDrawerOpenAtom);
