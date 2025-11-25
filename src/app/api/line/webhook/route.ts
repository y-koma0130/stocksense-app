import crypto from "crypto";
import { NextResponse } from "next/server";
import { createLineUser } from "@/server/features/lineNotification/domain/entities/lineUser";
import { sendLineMessage } from "@/server/features/lineNotification/infrastructure/externalServices/sendLineMessage";
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
 * LINE Webhookエンドポイント
 * 友だち追加時にLINEユーザーを登録
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!signature || !verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const webhookBody: LineWebhookBody = JSON.parse(body);

  for (const event of webhookBody.events) {
    if (event.type === "follow" && event.source.type === "user") {
      const lineUserId = event.source.userId;

      // DBにLINEユーザーを登録
      const entity = createLineUser({
        lineUserId,
        displayName: null,
      });

      await upsertLineUser(entity);

      // サインアップリンクを送信
      const serviceDomain = process.env.SERVICE_DOMAIN;
      const baseUrl = serviceDomain ? `https://${serviceDomain}` : "http://localhost:3000";
      const signupUrl = `${baseUrl}/login?lineUserId=${lineUserId}`;

      const welcomeMessage = `StockSenseへようこそ！

割安株の通知を受け取るには、以下のリンクからアカウント登録をお願いします。

${signupUrl}

※このリンクから登録すると、自動的にLINE通知が有効になります。`;

      await sendLineMessage(lineUserId, [
        {
          type: "text",
          text: welcomeMessage,
        },
      ]);
    }
  }

  return NextResponse.json({ success: true });
}
