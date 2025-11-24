const LINE_API_BASE = "https://api.line.me/v2/bot";

export type SendMessageResult = {
  success: boolean;
  error?: string;
};

export type LineMessage = {
  type: "text";
  text: string;
};

/**
 * LINEプッシュメッセージを送信する関数の型定義
 */
export type SendLineMessage = (
  lineUserId: string,
  messages: LineMessage[],
) => Promise<SendMessageResult>;

export const sendLineMessage: SendLineMessage = async (lineUserId, messages) => {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!accessToken) {
    return { success: false, error: "LINE_CHANNEL_ACCESS_TOKEN is not set" };
  }

  const response = await fetch(`${LINE_API_BASE}/message/push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { success: false, error: `LINE API error: ${response.status} ${errorText}` };
  }

  return { success: true };
};
