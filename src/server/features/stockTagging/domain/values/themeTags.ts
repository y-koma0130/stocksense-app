/**
 * テーマタグマスターデータ
 * 銘柄のテーマ・特徴タグ（AI、半導体、バイオなど）
 */

export const THEME_TAGS = [
  // テクノロジー
  { id: "ai", name: "AI（人工知能）" },
  { id: "quantum", name: "量子技術" },
  { id: "semiconductor", name: "半導体" },
  { id: "robotics", name: "ロボティクス" },
  { id: "cloud", name: "クラウド" },
  { id: "cybersecurity", name: "サイバーセキュリティ" },
  { id: "iot", name: "IoT" },
  { id: "autonomous_driving", name: "自動運転" },
  { id: "mobility", name: "モビリティ" },

  // エネルギー・資源
  { id: "renewable_energy", name: "再生可能エネルギー" },
  { id: "hydrogen", name: "水素エネルギー" },
  { id: "nuclear", name: "原子力" },
  { id: "lithium", name: "リチウム・バッテリー" },
  { id: "rare_earth", name: "レアアース" },
  { id: "resource_development", name: "資源開発" },

  // 産業・ものづくり
  { id: "manufacturing", name: "製造業（スマートファクトリー）" },
  { id: "logistics", name: "物流" },
  { id: "space", name: "宇宙産業" },
  { id: "defense", name: "防衛" },
  { id: "infrastructure", name: "社会インフラ" },
  { id: "construction", name: "建設" },

  // 流通・消費
  { id: "ec", name: "EC・ネット通販" },
  { id: "retail", name: "小売" },
  { id: "foodtech", name: "フードテック" },
  { id: "travel", name: "旅行・観光" },
  { id: "entertainment", name: "エンタメ" },

  // ヘルスケア・ライフサイエンス
  { id: "biotech", name: "バイオテクノロジー" },
  { id: "pharma", name: "医薬品" },
  { id: "medical_device", name: "医療機器" },
  { id: "healthcare", name: "ヘルスケア" },

  // 金融・デジタル化
  { id: "fintech", name: "フィンテック" },
  { id: "crypto", name: "暗号資産・Web3" },
  { id: "digital_transformation", name: "DX（デジタルトランスフォーメーション）" },

  // 環境・サステナビリティ
  { id: "esg", name: "ESG" },
  { id: "carbon_neutral", name: "カーボンニュートラル" },
  { id: "circular_economy", name: "サーキュラーエコノミー" },

  // その他の日本株文脈で重要なテーマ
  { id: "residential", name: "住宅・不動産" },
  { id: "aging", name: "高齢化" },
  { id: "inbound", name: "インバウンド" },
  { id: "telecom", name: "通信" },
] as const;

/**
 * テーマタグの型
 */
export type ThemeTag = (typeof THEME_TAGS)[number];

/**
 * テーマタグIDの型
 */
export type ThemeTagId = ThemeTag["id"];

/**
 * テーマタグIDからタグを取得
 */
export const getThemeTagById = (id: string): ThemeTag | undefined => {
  return THEME_TAGS.find((tag) => tag.id === id);
};

/**
 * 全テーマタグIDの配列
 */
export const THEME_TAG_IDS = THEME_TAGS.map((tag) => tag.id);
