/**
 * マクロタグマスターデータ
 * 銘柄のマクロ経済感応度タグ（金利敏感、輸出、内需など）
 */

export const MACRO_TAGS = [
  // ===== 金利関連 =====
  {
    id: "interest_sensitive",
    name: "金利敏感",
    description: "金利の変動（上昇・下降）に収益が大きく影響する企業。",
  },
  {
    id: "interest_cost_risk",
    name: "金利コスト増リスク",
    description: "金利上昇によって借入コストの増加が懸念される企業。",
  },

  // ===== 景気（循環・防御） =====
  {
    id: "economic_sensitive",
    name: "景気敏感",
    description: "景気循環に伴う需要変動の影響を受けやすい企業。",
  },
  {
    id: "defensive",
    name: "ディフェンシブ",
    description: "景気変動の影響を受けにくい安定業種。",
  },

  // ===== 為替（輸出・輸入） =====
  {
    id: "export_benefit",
    name: "輸出メリット",
    description: "円安が追い風となり利益が増えやすい企業。",
  },
  {
    id: "import_cost_risk",
    name: "輸入コスト増リスク",
    description: "円安により原材料・仕入れコストが上昇しやすい企業。",
  },

  // ===== 物価（インフレ） =====
  {
    id: "inflation_benefit",
    name: "インフレメリット",
    description: "価格転嫁をしやすく、インフレ局面で利益が出やすい企業。",
  },
  {
    id: "inflation_risk",
    name: "インフレ悪影響",
    description: "原材料コスト増などで利益率が圧迫されやすい企業。",
  },

  // ===== 政策・財政 =====
  {
    id: "policy_support",
    name: "政策支援恩恵",
    description: "政府・自治体等の補助金、投資政策などの恩恵が見込まれる企業。",
  },
  {
    id: "regulation_risk",
    name: "規制リスク",
    description: "業界特有の規制強化が業績の下押し要因となる企業。",
  },

  // ===== 資源・エネルギー =====
  {
    id: "commodity_risk",
    name: "資源価格リスク",
    description: "原油・金属など資源価格の上昇に影響を受けやすい企業。",
  },
  {
    id: "commodity_benefit",
    name: "資源高メリット",
    description: "資源価格の上昇が収益押し上げにつながる企業。",
  },

  // ===== 地政学 =====
  {
    id: "geopolitical_risk",
    name: "地政学リスク",
    description: "国際情勢の影響を直接受けやすい企業。",
  },
] as const;

/**
 * マクロタグの型
 */
export type MacroTag = (typeof MACRO_TAGS)[number];

/**
 * マクロタグIDの型
 */
export type MacroTagId = MacroTag["id"];

/**
 * マクロタグIDからタグを取得
 */
export const getMacroTagById = (id: string): MacroTag | undefined => {
  return MACRO_TAGS.find((tag) => tag.id === id);
};

/**
 * 全マクロタグIDの配列（z.enumに渡すためのタプル型）
 */
export const MACRO_TAG_IDS: readonly [MacroTagId, ...MacroTagId[]] = [
  "interest_sensitive",
  "interest_cost_risk",
  "economic_sensitive",
  "defensive",
  "export_benefit",
  "import_cost_risk",
  "inflation_benefit",
  "inflation_risk",
  "policy_support",
  "regulation_risk",
  "commodity_risk",
  "commodity_benefit",
  "geopolitical_risk",
];
