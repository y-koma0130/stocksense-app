/**
 * Yahoo Financeの銘柄ページURLを生成する
 * @param tickerCode 銘柄コード（例: "3825"）
 * @returns Yahoo FinanceのURL（例: "https://finance.yahoo.co.jp/quote/3825.T"）
 */
export const getYahooFinanceUrl = (tickerCode: string): string => {
  return `https://finance.yahoo.co.jp/quote/${tickerCode}.T`;
};
