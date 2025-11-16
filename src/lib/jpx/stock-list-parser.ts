import * as XLSX from "xlsx";

/**
 * JPX銘柄一覧の行データ型
 */
export interface JPXStockRow {
  tickerCode: string; // 日経コード（4桁）
  companyName: string; // 銘柄名
  market: string; // 市場区分
  sector33Code: string; // 33業種コード
  sector33Name: string; // 33業種名
  sector17Code: string; // 17業種コード
  sector17Name: string; // 17業種名
  scaleCode: string; // 規模コード
  scaleName: string; // 規模区分
}

/**
 * パース結果の型
 */
export interface ParsedStockData {
  tickerCode: string;
  tickerSymbol: string; // Yahoo Finance用（例: "7203.T"）
  name: string;
  sectorCode: string;
  sectorName: string;
  market: string;
}

/**
 * JPX公式Excelファイルから銘柄一覧をパース
 *
 * JPX公式サイト（https://www.jpx.co.jp/markets/statistics-equities/misc/01.html）
 * 「東証上場銘柄一覧」Excelファイルを使用
 *
 * @param filePath - Excelファイルのパス
 * @returns パース済み銘柄データの配列
 */
export function parseJPXStockList(filePath: string): ParsedStockData[] {
  // Excelファイルを読み込み
  const workbook = XLSX.readFile(filePath);

  // 最初のシートを取得
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // JSONに変換（1行目をヘッダーとして使用）
  const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);

  const results: ParsedStockData[] = [];

  for (const row of jsonData) {
    // 必須カラムのチェック
    const tickerCode = row.コード;
    const companyName = row.銘柄名;
    const market = row["市場・商品区分"];
    const sector33Code = row["33業種コード"];
    const sector33Name = row["33業種区分"];

    if (!tickerCode || !companyName) {
      continue; // 必須データがない行はスキップ
    }

    // 個別株以外を除外（sector情報がない銘柄はETF・ETN・REIT等）
    if (!sector33Code || sector33Code === "-" || !sector33Name || sector33Name === "-") {
      continue;
    }

    // 4桁のコードに正規化
    const normalizedCode = tickerCode.toString().padStart(4, "0");

    // Yahoo Finance用のシンボル（東証は.T）
    const tickerSymbol = `${normalizedCode}.T`;

    // 市場区分を正規化
    let normalizedMarket = market;
    if (market.includes("プライム")) {
      normalizedMarket = "プライム";
    } else if (market.includes("スタンダード")) {
      normalizedMarket = "スタンダード";
    } else if (market.includes("グロース")) {
      normalizedMarket = "グロース";
    }

    results.push({
      tickerCode: normalizedCode,
      tickerSymbol,
      name: companyName,
      sectorCode: sector33Code || "",
      sectorName: sector33Name || "",
      market: normalizedMarket,
    });
  }

  return results;
}

/**
 * バッファからJPX銘柄一覧をパース（ダウンロードしたデータ用）
 *
 * @param buffer - ExcelファイルのBuffer
 * @returns パース済み銘柄データの配列
 */
export function parseJPXStockListFromBuffer(buffer: Buffer): ParsedStockData[] {
  // バッファからワークブックを読み込み
  const workbook = XLSX.read(buffer, { type: "buffer" });

  // 最初のシートを取得
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // JSONに変換（1行目をヘッダーとして使用）
  const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);

  const results: ParsedStockData[] = [];

  for (const row of jsonData) {
    // 必須カラムのチェック
    const tickerCode = row.コード;
    const companyName = row.銘柄名;
    const market = row["市場・商品区分"];
    const sector33Code = row["33業種コード"];
    const sector33Name = row["33業種区分"];

    if (!tickerCode || !companyName) {
      continue;
    }

    // 個別株以外を除外（sector情報がない銘柄はETF・ETN・REIT等）
    if (!sector33Code || sector33Code === "-" || !sector33Name || sector33Name === "-") {
      continue;
    }

    // 4桁のコードに正規化
    const normalizedCode = tickerCode.toString().padStart(4, "0");

    // Yahoo Finance用のシンボル
    const tickerSymbol = `${normalizedCode}.T`;

    // 市場区分を正規化
    let normalizedMarket = market;
    if (market.includes("プライム")) {
      normalizedMarket = "プライム";
    } else if (market.includes("スタンダード")) {
      normalizedMarket = "スタンダード";
    } else if (market.includes("グロース")) {
      normalizedMarket = "グロース";
    }

    results.push({
      tickerCode: normalizedCode,
      tickerSymbol,
      name: companyName,
      sectorCode: sector33Code || "",
      sectorName: sector33Name || "",
      market: normalizedMarket,
    });
  }

  return results;
}
