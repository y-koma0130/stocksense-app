import * as XLSX from "xlsx";
import { type ParsedStockDataDto, parsedStockDataDtoSchema } from "../../application/dto/jpx.dto";

/**
 * 市場区分を正規化
 */
const normalizeMarket = (market: string): string => {
  if (market.includes("プライム")) {
    return "プライム";
  }
  if (market.includes("スタンダード")) {
    return "スタンダード";
  }
  if (market.includes("グロース")) {
    return "グロース";
  }
  return market;
};

/**
 * 行データをパース
 */
const parseRow = (row: Record<string, string>): ParsedStockDataDto | null => {
  const tickerCode = row.コード;
  const companyName = row.銘柄名;
  const market = row["市場・商品区分"];
  const sector33Code = row["33業種コード"];
  const sector33Name = row["33業種区分"];

  // 必須データチェック
  if (!tickerCode || !companyName) {
    return null;
  }

  // 個別株以外を除外（sector情報がない銘柄はETF・ETN・REIT等）
  if (!sector33Code || sector33Code === "-" || !sector33Name || sector33Name === "-") {
    return null;
  }

  // 4桁のコードに正規化
  const normalizedCode = tickerCode.toString().padStart(4, "0");

  // Yahoo Finance用のシンボル（東証は.T）
  const tickerSymbol = `${normalizedCode}.T`;

  return parsedStockDataDtoSchema.parse({
    tickerCode: normalizedCode,
    tickerSymbol,
    name: companyName,
    sectorCode: sector33Code || "",
    sectorName: sector33Name || "",
    market: normalizeMarket(market),
  });
};

/**
 * JPX公式Excelファイルから銘柄一覧をパース
 *
 * JPX公式サイト（https://www.jpx.co.jp/markets/statistics-equities/misc/01.html）
 * 「東証上場銘柄一覧」Excelファイルを使用
 */
export const parseJPXStockList = (filePath: string): ParsedStockDataDto[] => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);

  const results: ParsedStockDataDto[] = [];

  for (const row of jsonData) {
    const parsed = parseRow(row);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
};

/**
 * バッファからJPX銘柄一覧をパース（ダウンロードしたデータ用）
 */
export const parseJPXStockListFromBuffer = (buffer: Buffer): ParsedStockDataDto[] => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);

  const results: ParsedStockDataDto[] = [];

  for (const row of jsonData) {
    const parsed = parseRow(row);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
};
