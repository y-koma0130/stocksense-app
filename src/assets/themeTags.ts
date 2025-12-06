/**
 * テーマタグマスターデータ
 * 銘柄のテーマ・特徴タグ（AI、半導体、バイオなど）
 */

export const THEME_TAGS = [
  // テクノロジー
  {
    id: "ai",
    name: "AI（人工知能）",
    description: "生成AIや機械学習の普及による成長期待が強いテーマ。投資資金の集中が起こりやすい。",
  },
  {
    id: "quantum",
    name: "量子技術",
    description:
      "量子コンピュータ、量子暗号通信など次世代技術。長期期待は大きいが実用化は中期以降。",
  },
  {
    id: "semiconductor",
    name: "半導体",
    description: "AI・EV・デバイスの需要増で世界的に成長。製造装置から素材まで日本企業が強い分野。",
  },
  {
    id: "robotics",
    name: "ロボティクス",
    description: "自動化需要の増加で長期的な成長が期待される分野。製造業・物流などで活用が進む。",
  },
  {
    id: "cloud",
    name: "クラウド",
    description: "AWSやSaaSなどクラウドサービスの普及に伴う成長期待。DX需要とも密接に関連。",
  },
  {
    id: "cybersecurity",
    name: "サイバーセキュリティ",
    description: "企業や政府機関への攻撃増加で重要性が高まる領域。景気変動の影響を受けにくい。",
  },
  {
    id: "iot",
    name: "IoT",
    description: "あらゆるデバイスをネットワーク接続する流れ。センサーや通信技術関連が強い。",
  },
  {
    id: "autonomous_driving",
    name: "自動運転",
    description: "EV化と並行して進む次世代モビリティ領域。半導体やセンサー株が影響を受ける。",
  },
  {
    id: "mobility",
    name: "モビリティ",
    description: "EV、 MaaS、次世代移動産業などを含む広いテーマ。長期トレンドとして注目度が高い。",
  },

  // エネルギー・資源
  {
    id: "renewable_energy",
    name: "再生可能エネルギー",
    description: "太陽光・風力など脱炭素の中心となる領域。政策支援を受けやすいテーマ。",
  },
  {
    id: "hydrogen",
    name: "水素エネルギー",
    description: "次世代クリーンエネルギーとして注目。実用化には時間がかかるが長期性が強い。",
  },
  {
    id: "nuclear",
    name: "原子力",
    description: "エネルギー安定供給のニーズから再評価される領域。政策による影響が大きい。",
  },
  {
    id: "lithium",
    name: "リチウム・バッテリー",
    description: "EV・蓄電池に不可欠。資源価格や需要で大きく動くテーマ。",
  },
  {
    id: "rare_earth",
    name: "レアアース",
    description: "半導体やEVに必須の戦略資源。地政学リスクに敏感なテーマ。",
  },
  {
    id: "resource_development",
    name: "資源開発",
    description: "鉱山・エネルギー開発などを含む。市況ニュースと連動しやすい。",
  },

  // 産業・ものづくり
  {
    id: "manufacturing",
    name: "製造業（スマートファクトリー）",
    description: "DXと自動化の進展による効率化需要が強い分野。日本の競争力が高い領域。",
  },
  {
    id: "logistics",
    name: "物流",
    description: "EC拡大や人手不足を背景に成長。自動化や倉庫ロボットとも関連する。",
  },
  {
    id: "space",
    name: "宇宙産業",
    description: "衛星・ロケット・GPS関連。長期的市場創出が期待されるフロンティア領域。",
  },
  {
    id: "defense",
    name: "防衛",
    description: "安全保障問題から需要増加。政策変動による影響が大きいテーマ。",
  },
  {
    id: "infrastructure",
    name: "社会インフラ",
    description: "建設、電力、交通など基盤産業。景気敏感だが長期安定性が高い。",
  },
  {
    id: "construction",
    name: "建設",
    description: "公共投資や都市開発に関連。金利や景気の影響を受けやすい。",
  },

  // 流通・消費
  {
    id: "ec",
    name: "EC・ネット通販",
    description: "消費のオンライン化による成長。物流・決済など関連領域が広い。",
  },
  {
    id: "retail",
    name: "小売",
    description: "消費動向と密接に連動する業態。物価、賃金、景気の影響を受けやすい。",
  },
  {
    id: "foodtech",
    name: "フードテック",
    description: "食品の自動化・代替肉など。中長期成長テーマだが波が激しい。",
  },
  {
    id: "travel",
    name: "旅行・観光",
    description: "インバウンドや景気回復で需要が急増するテーマ。外部要因の影響が大きい。",
  },
  {
    id: "entertainment",
    name: "エンタメ",
    description: "ゲーム、音楽、アニメなど。消費者の嗜好に左右されるが利益率が高い。",
  },

  // ヘルスケア
  {
    id: "biotech",
    name: "バイオテクノロジー",
    description: "創薬や遺伝子治療など高ボラティリティだが長期期待が大きい分野。",
  },
  {
    id: "pharma",
    name: "医薬品",
    description: "ディフェンシブで安定。研究開発や薬価政策の影響を受ける。",
  },
  {
    id: "medical_device",
    name: "医療機器",
    description: "高齢化で需要が拡大。高収益な企業が多い。",
  },
  {
    id: "healthcare",
    name: "ヘルスケア",
    description: "医療サービスや介護など。人口動態の影響が大きい。",
  },

  // 金融・デジタル化
  {
    id: "fintech",
    name: "フィンテック",
    description: "キャッシュレス化やオンライン金融サービスの普及で成長。",
  },
  {
    id: "crypto",
    name: "暗号資産・Web3",
    description: "価格に左右されやすいが技術革新のインパクトが大きいテーマ。",
  },
  {
    id: "digital_transformation",
    name: "DX",
    description: "業務効率化・IT化促進の中核テーマで長期安定して追い風。",
  },

  // 環境・サステナビリティ
  {
    id: "esg",
    name: "ESG",
    description: "環境・社会・企業統治の評価向上に関連。海外投資家に重視される。",
  },
  {
    id: "carbon_neutral",
    name: "カーボンニュートラル",
    description: "脱炭素社会の実現に向けた重要テーマ。政策や国際規格の影響が大きい。",
  },
  {
    id: "circular_economy",
    name: "サーキュラーエコノミー",
    description: "リサイクルや再資源化。環境対策により重要性が高まる分野。",
  },

  // 日本株特有の主要テーマ
  {
    id: "residential",
    name: "住宅・不動産",
    description: "金利や景気、政策の影響が強い。セクター循環が発生しやすい。",
  },
  {
    id: "aging",
    name: "高齢化",
    description: "医療、介護、生活サービスなど幅広い需要増加が見込まれる。",
  },
  {
    id: "inbound",
    name: "インバウンド",
    description: "訪日客の消費拡大で観光・小売・交通などに追い風。",
  },
  {
    id: "telecom",
    name: "通信",
    description: "インフラ性の強い安定セクター。競争や規制の影響を受けやすい。",
  },
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
 * 全テーマタグIDの配列（z.enumに渡すためのタプル型）
 */
export const THEME_TAG_IDS: readonly [ThemeTagId, ...ThemeTagId[]] = [
  "ai",
  "quantum",
  "semiconductor",
  "robotics",
  "cloud",
  "cybersecurity",
  "iot",
  "autonomous_driving",
  "mobility",
  "renewable_energy",
  "hydrogen",
  "nuclear",
  "lithium",
  "rare_earth",
  "resource_development",
  "manufacturing",
  "logistics",
  "space",
  "defense",
  "infrastructure",
  "construction",
  "ec",
  "retail",
  "foodtech",
  "travel",
  "entertainment",
  "biotech",
  "pharma",
  "medical_device",
  "healthcare",
  "fintech",
  "crypto",
  "digital_transformation",
  "esg",
  "carbon_neutral",
  "circular_economy",
  "residential",
  "aging",
  "inbound",
  "telecom",
];
