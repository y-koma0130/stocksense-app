/**
 * OpenAI クライアントの初期化
 */

import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

export const openai = new OpenAI({
  apiKey,
});

/**
 * デフォルトのモデル設定
 */
export const DEFAULT_MODEL = "gpt-4o" as const;
export const TEMPERATURE = 0.3 as const; // 分析の一貫性を保つため低めに設定
