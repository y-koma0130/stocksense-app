/**
 * LINE リッチメニュー セットアップスクリプト
 *
 * リッチメニューをMessaging APIで作成・設定します。
 * 画像ファイルを指定してリッチメニューを作成し、デフォルトメニューとして設定します。
 *
 * 使い方:
 * 1. リッチメニュー画像を用意（1200x405px）
 * 2. pnpm tsx scripts/setup-line-richmenu.ts --image ./path/to/image.png
 *
 * リッチメニュー構成（3ボタン横並び）:
 * ┌───────────────┬───────────────┬───────────────┐
 * │  🔍 AIで      │  📊 レポート  │  🌐 ダッシュ  │
 * │  銘柄分析     │  を再送       │    ボード     │
 * └───────────────┴───────────────┴───────────────┘
 *      400px          400px           400px
 *
 * アクション:
 * - 左: action=guide（銘柄分析の使い方ガイド）
 * - 中: action=report_select（中期/長期レポート選択）
 * - 右: action=dashboard（ダッシュボードURL）
 */

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// .env.local を読み込む
dotenv.config({ path: ".env.local" });

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

type RichMenuArea = {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: {
    type: "postback" | "uri" | "message";
    data?: string;
    text?: string;
    uri?: string;
    label?: string;
  };
};

type RichMenuRequest = {
  size: {
    width: 1200;
    height: 405;
  };
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: RichMenuArea[];
};

/**
 * リッチメニューの定義（1200x405の小型サイズ）
 * 3ボタン横並び
 *
 * ┌───────────────┬───────────────┬───────────────┐
 * │  🔍 AIで      │  📊 レポート  │  🌐 ダッシュ  │
 * │  銘柄分析     │  を再送       │    ボード     │
 * └───────────────┴───────────────┴───────────────┘
 *      400px          400px           400px
 *
 * 画像仕様:
 * - サイズ: 1200x405px
 * - 左右padding: 32px、上padding: 32px、下padding: 31px
 * - ボタン間: 33px
 * - ボタンサイズ: 左357x342、中356x342、右357x342
 */
const createRichMenuDefinition = (): RichMenuRequest => {
  const width = 1200;
  const height = 405;
  const columnWidth = 400; // 3等分

  return {
    size: {
      width: 1200,
      height: 405,
    },
    selected: true, // デフォルトで表示
    name: "StockSense メインメニュー",
    chatBarText: "メニュー",
    areas: [
      // 左: AIで銘柄分析
      {
        bounds: {
          x: 0,
          y: 0,
          width: columnWidth,
          height: height,
        },
        action: {
          type: "postback",
          data: "action=guide",
          label: "AIで銘柄分析",
        },
      },
      // 中央: レポートを再送
      {
        bounds: {
          x: columnWidth,
          y: 0,
          width: columnWidth,
          height: height,
        },
        action: {
          type: "postback",
          data: "action=report_select",
          label: "レポートを再送",
        },
      },
      // 右: ダッシュボード
      {
        bounds: {
          x: columnWidth * 2,
          y: 0,
          width: width - columnWidth * 2,
          height: height,
        },
        action: {
          type: "postback",
          data: "action=dashboard",
          label: "ダッシュボード",
        },
      },
    ],
  };
};

/**
 * リッチメニューを作成
 */
const createRichMenu = async (definition: RichMenuRequest): Promise<string> => {
  const response = await fetch("https://api.line.me/v2/bot/richmenu", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(definition),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create rich menu: ${response.status} ${error}`);
  }

  const result = (await response.json()) as { richMenuId: string };
  return result.richMenuId;
};

/**
 * リッチメニューに画像をアップロード
 */
const uploadRichMenuImage = async (richMenuId: string, imagePath: string): Promise<void> => {
  const imageBuffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : "image/jpeg";

  const response = await fetch(
    `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`,
    {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: imageBuffer,
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload rich menu image: ${response.status} ${error}`);
  }
};

/**
 * リッチメニューをデフォルトに設定
 */
const setDefaultRichMenu = async (richMenuId: string): Promise<void> => {
  const response = await fetch(
    `https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to set default rich menu: ${response.status} ${error}`);
  }
};

/**
 * 既存のリッチメニュー一覧を取得
 */
const listRichMenus = async (): Promise<Array<{ richMenuId: string; name: string }>> => {
  const response = await fetch("https://api.line.me/v2/bot/richmenu/list", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list rich menus: ${response.status} ${error}`);
  }

  const result = (await response.json()) as {
    richmenus: Array<{ richMenuId: string; name: string }>;
  };
  return result.richmenus;
};

/**
 * リッチメニューを削除
 */
const deleteRichMenu = async (richMenuId: string): Promise<void> => {
  const response = await fetch(`https://api.line.me/v2/bot/richmenu/${richMenuId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete rich menu: ${response.status} ${error}`);
  }
};

/**
 * メイン処理
 */
const main = async (): Promise<void> => {
  // 引数をパース
  const args = process.argv.slice(2);
  const imageIndex = args.indexOf("--image");
  const listMode = args.includes("--list");
  const deleteMode = args.includes("--delete");
  const deleteId = deleteMode ? args[args.indexOf("--delete") + 1] : null;

  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    console.error("Error: LINE_CHANNEL_ACCESS_TOKEN is not set");
    process.exit(1);
  }

  // リスト表示モード
  if (listMode) {
    console.log("📋 既存のリッチメニュー一覧を取得中...");
    const menus = await listRichMenus();
    if (menus.length === 0) {
      console.log("リッチメニューがありません。");
    } else {
      console.log("\n=== リッチメニュー一覧 ===");
      for (const menu of menus) {
        console.log(`  ID: ${menu.richMenuId}`);
        console.log(`  名前: ${menu.name}`);
        console.log("---");
      }
    }
    return;
  }

  // 削除モード
  if (deleteMode && deleteId) {
    console.log(`🗑️ リッチメニューを削除中: ${deleteId}`);
    await deleteRichMenu(deleteId);
    console.log("✅ 削除完了");
    return;
  }

  // 作成モード（画像必須）
  if (imageIndex === -1 || !args[imageIndex + 1]) {
    console.log(`
LINE リッチメニュー セットアップスクリプト

使い方:
  pnpm tsx scripts/setup-line-richmenu.ts --image ./path/to/image.png
  pnpm tsx scripts/setup-line-richmenu.ts --list
  pnpm tsx scripts/setup-line-richmenu.ts --delete <richMenuId>

オプション:
  --image <path>  リッチメニュー画像のパス（1200x405px、PNGまたはJPEG）
  --list          既存のリッチメニュー一覧を表示
  --delete <id>   指定したリッチメニューを削除

リッチメニュー画像の仕様:
  - サイズ: 1200x405px
  - 形式: PNG または JPEG
  - 最大ファイルサイズ: 1MB

レイアウト（3ボタン横並び）:
  ┌───────────────┬───────────────┬───────────────┐
  │  🔍 AIで      │  📊 レポート  │  🌐 ダッシュ  │
  │  銘柄分析     │  を再送       │    ボード     │
  └───────────────┴───────────────┴───────────────┘
       400px           400px           400px
`);
    process.exit(1);
  }

  const imagePath = args[imageIndex + 1];

  // 画像ファイルの存在確認
  if (!fs.existsSync(imagePath)) {
    console.error(`Error: Image file not found: ${imagePath}`);
    process.exit(1);
  }

  console.log("🚀 リッチメニューのセットアップを開始します...\n");

  // Step 1: リッチメニューを作成
  console.log("1️⃣ リッチメニューを作成中...");
  const definition = createRichMenuDefinition();
  const richMenuId = await createRichMenu(definition);
  console.log(`   ✅ 作成完了: ${richMenuId}`);

  // Step 2: 画像をアップロード
  console.log("2️⃣ 画像をアップロード中...");
  await uploadRichMenuImage(richMenuId, imagePath);
  console.log("   ✅ アップロード完了");

  // Step 3: デフォルトに設定
  console.log("3️⃣ デフォルトメニューに設定中...");
  await setDefaultRichMenu(richMenuId);
  console.log("   ✅ 設定完了");

  console.log(`
🎉 リッチメニューのセットアップが完了しました！

リッチメニューID: ${richMenuId}

各ボタンのpostbackアクション:
  - AIで銘柄分析: action=guide
  - レポートを再送: action=report_select
  - ダッシュボード: action=dashboard
`);
};

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
