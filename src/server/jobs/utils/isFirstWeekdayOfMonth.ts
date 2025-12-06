/**
 * 月の最初の平日かどうかを判定（JST基準）
 * 祝日は考慮しない
 */

import { getDate, getDay, startOfMonth } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const JST_TIMEZONE = "Asia/Tokyo";

export const isFirstWeekdayOfMonth = (): boolean => {
  const nowJST = toZonedTime(new Date(), JST_TIMEZONE);
  const today = getDate(nowJST);

  // 月の1日の曜日を取得（JSTで計算）
  const firstDayOfMonth = startOfMonth(nowJST);
  const dayOfWeek = getDay(firstDayOfMonth);

  let firstWeekday: number;
  if (dayOfWeek === 0) {
    // 1日が日曜 → 2日（月曜）が最初の平日
    firstWeekday = 2;
  } else if (dayOfWeek === 6) {
    // 1日が土曜 → 3日（月曜）が最初の平日
    firstWeekday = 3;
  } else {
    // 1日が平日 → 1日が最初の平日
    firstWeekday = 1;
  }

  return today === firstWeekday;
};
