import crypto from "crypto";
import { NextResponse } from "next/server";
import { createLineUser } from "@/server/features/lineNotification/domain/entities/lineUser";
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
      const entity = createLineUser({
        lineUserId: event.source.userId,
        displayName: null,
      });

      await upsertLineUser(entity);
    }
  }

  return NextResponse.json({ success: true });
}
