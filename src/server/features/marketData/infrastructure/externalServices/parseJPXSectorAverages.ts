import * as XLSX from "xlsx";
import {
  type SectorAverageDataDto,
  sectorAverageDataDtoSchema,
} from "../../application/dto/sectorAverage.dto";

/**
 * 業種コードマッピング（業種名から業種コードを生成）
 * JPXの33業種分類に基づく
 */
const SECTOR_CODE_MAP: Record<string, string> = {
  "水産・農林業": "0050",
  鉱業: "1050",
  建設業: "2050",
  食料品: "3050",
  繊維製品: "3100",
  "パルプ・紙": "3150",
  化学: "3200",
  医薬品: "3250",
  "石油・石炭製品": "3300",
  ゴム製品: "3350",
  "ガラス・土石製品": "3400",
  鉄鋼: "3450",
  非鉄金属: "3500",
  金属製品: "3550",
  機械: "3600",
  電気機器: "3650",
  輸送用機器: "3700",
  精密機器: "3750",
  その他製品: "3800",
  "電気・ガス業": "4050",
  陸運業: "5050",
  海運業: "5100",
  空運業: "5150",
  "倉庫・運輸関連業": "5200",
  "情報・通信業": "5250",
  卸売業: "6050",
  小売業: "6100",
  銀行業: "7050",
  "証券、商品先物取引業": "7100",
  保険業: "7150",
  その他金融業: "7200",
  不動産業: "8050",
  サービス業: "9050",
};

/**
 * 行データをパース
 */
const parseRow = (row: Record<string, unknown>): SectorAverageDataDto | null => {
  // JPX公式Excelの実際の列名に対応
  const marketSection = row["__EMPTY"]; // 市場区分名
  const rawSectorName = row["__EMPTY_2"]; // 種別（業種名）例: "3 建設業"
  const stockCount = row["(注)1.集計対象は、連結財務諸表を作成している会社は連結、作成していない会社は単体の数値。\n    2.「－」は該当数値なし、または、PER・PBRがマイナス値の場合。PER1000倍以上の場合は「＊」を表示"]; // 会社数
  const avgPer = row["__EMPTY_4"]; // 単純PER
  const avgPbr = row["__EMPTY_5"]; // 単純PBR

  // プライム市場のデータのみを対象とする
  if (marketSection !== "プライム市場") {
    return null;
  }

  // 必須データチェック（業種名と会社数が存在するか）
  if (!rawSectorName || typeof rawSectorName !== "string" || !stockCount) {
    return null;
  }

  // 業種名から番号を除去（例: "3 建設業" -> "建設業"）
  const sectorName = rawSectorName.replace(/^\d+\s+/, "");

  // 業種名から業種コードを取得
  const sectorCode = SECTOR_CODE_MAP[sectorName];
  if (!sectorCode) {
    return null;
  }

  const rawData = {
    sectorCode,
    sectorName,
    avgPer: avgPer && typeof avgPer === "number" ? avgPer : null,
    avgPbr: avgPbr && typeof avgPbr === "number" ? avgPbr : null,
    medianPer: null, // JPXの公式データには中央値が含まれていないためnull
    medianPbr: null,
    stockCount: stockCount && typeof stockCount === "number" ? Math.floor(stockCount) : 0,
  };

  return sectorAverageDataDtoSchema.parse(rawData);
};

/**
 * JPX公式Excelファイルから業種平均PER/PBRをパースする型定義
 */
export type ParseJPXSectorAverages = (filePath: string) => SectorAverageDataDto[];

/**
 * JPX公式Excelファイルから業種平均PER/PBRをパース
 *
 * JPX公式サイト（https://www.jpx.co.jp/markets/statistics-equities/misc/04.html）
 * 「規模別・業種別PER・PBR（連結・単体）」Excelファイルを使用
 */
export const parseJPXSectorAverages: ParseJPXSectorAverages = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

  const results: SectorAverageDataDto[] = [];

  for (const row of jsonData) {
    const parsed = parseRow(row);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
};

/**
 * バッファからJPX業種平均をパースする型定義
 */
export type ParseJPXSectorAveragesFromBuffer = (buffer: Buffer) => SectorAverageDataDto[];

/**
 * バッファからJPX業種平均をパース（ダウンロードしたデータ用）
 */
export const parseJPXSectorAveragesFromBuffer: ParseJPXSectorAveragesFromBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

  const results: SectorAverageDataDto[] = [];

  for (const row of jsonData) {
    const parsed = parseRow(row);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
};
