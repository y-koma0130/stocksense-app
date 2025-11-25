import crypto from "crypto";
import { NextResponse } from "next/server";
import { createLineUser } from "@/server/features/lineNotification/domain/entities/lineUser";
import { sendLineMessage } from "@/server/features/lineNotification/infrastructure/externalServices/sendLineMessage";
import { getLineUserByLineUserId } from "@/server/features/lineNotification/infrastructure/queryServices/getLineUserByLineUserId";
import { upsertLineUser } from "@/server/features/lineNotification/infrastructure/repositories/upsertLineUser.repository";

type LineEvent = {
  type: string;
  source: {
    type: string;
    userId: string;
  };
};

type LineWebhookBody = {
  events: LineEvent[];
};

/**
 * LINE Webhook署名を検証
 */
const verifySignature = (body: string, signature: string): boolean => {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!channelSecret) {
    return false;
  }

  const hash = crypto.createHmac("SHA256", channelSecret).update(body).digest("base64");

  return hash === signature;
};

/**
 * Webhook URLの疎通確認用
 */
export async function GET() {
  return NextResponse.json({ status: "ok", message: "LINE Webhook endpoint is ready" });
}

/**
 * LINE Webhookエンドポイント
 * 友だち追加時にLINEユーザーを登録
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    if (!signature || !verifySignature(body, signature)) {
      console.error("[LINE Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const webhookBody: LineWebhookBody = JSON.parse(body);

    for (const event of webhookBody.events) {
      if (event.type === "follow" && event.source.type === "user") {
        const lineUserId = event.source.userId;

        // 既存ユーザーかどうかを確認
        const existingUser = await getLineUserByLineUserId(lineUserId);

        // DBにLINEユーザーを登録または更新
        const entity = createLineUser({
          lineUserId,
          displayName: null,
        });
        await upsertLineUser(entity);

        // メッセージを送信
        const serviceDomain = process.env.SERVICE_DOMAIN;
        const baseUrl = serviceDomain ? `https://${serviceDomain}` : "http://localhost:3000";
        const authUrl = `${baseUrl}/login?lineUserId=${lineUserId}`;

        let welcomeMessage: string;

        if (existingUser?.userId) {
          // 既にアカウント登録済みのユーザー
          welcomeMessage = `StockSenseへようこそ！

すでにアカウントをお持ちですね。以下のリンクからログインしてLINE通知を有効にできます。

${authUrl}`;
        } else {
          // 新規ユーザー
          welcomeMessage = `StockSenseへようこそ！

割安株の通知を受け取るには、以下のリンクからアカウント登録をお願いします。

${authUrl}

※このリンクから登録すると、自動的にLINE通知が有効になります。`;
        }

        await sendLineMessage(lineUserId, [
          {
            type: "text",
            text: welcomeMessage,
          },
        ]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[LINE Webhook] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
