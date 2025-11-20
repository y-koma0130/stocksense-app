/**
 * 52週高値・安値からの現在価格の位置を計算
 */
export const calculatePricePosition = (
  currentPrice: number,
  fiftyTwoWeekHigh: number,
  fiftyTwoWeekLow: number,
): number => {
  if (fiftyTwoWeekHigh === fiftyTwoWeekLow) {
    return 0.5;
  }

  const position = (currentPrice - fiftyTwoWeekLow) / (fiftyTwoWeekHigh - fiftyTwoWeekLow);
  return Math.max(0, Math.min(1, position));
};
