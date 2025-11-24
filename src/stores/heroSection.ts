import { atom, useAtomValue, useSetAtom } from "jotai";

const STORAGE_KEY = "stocksense_hero_dismissed";

/**
 * ヒーローセクションの表示状態を管理するatom
 * true = 非表示、false = 表示
 */
const heroDismissedAtom = atom<boolean>(true);

/**
 * 初期化済みフラグ（LocalStorageから読み込んだかどうか）
 */
const heroInitializedAtom = atom<boolean>(false);

/**
 * ヒーローセクションの非表示状態を取得
 */
export const useHeroDismissed = () => useAtomValue(heroDismissedAtom);

/**
 * ヒーローセクションの初期化済みフラグを取得
 */
export const useHeroInitialized = () => useAtomValue(heroInitializedAtom);

/**
 * ヒーローセクションの状態を更新
 */
export const useSetHeroDismissed = () => useSetAtom(heroDismissedAtom);

/**
 * ヒーローセクションの初期化済みフラグを更新
 */
export const useSetHeroInitialized = () => useSetAtom(heroInitializedAtom);

/**
 * LocalStorageから状態を読み込む
 */
export const loadHeroDismissedFromStorage = (): boolean => {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) === "true";
};

/**
 * LocalStorageに状態を保存
 */
export const saveHeroDismissedToStorage = (dismissed: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(dismissed));
};
