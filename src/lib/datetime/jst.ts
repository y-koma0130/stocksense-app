/**
 * JST（日本標準時）関連のユーティリティ
 */

import { toZonedTime } from "date-fns-tz";

export const JST_TIMEZONE = "Asia/Tokyo";

/**
 * 現在時刻をJSTで取得
 * DB保存や日時比較に使用
 */
export const nowJST = (): Date => {
  return toZonedTime(new Date(), JST_TIMEZONE);
};

/**
 * 指定した日時をJSTに変換
 */
export const toJST = (date: Date): Date => {
  return toZonedTime(date, JST_TIMEZONE);
};
