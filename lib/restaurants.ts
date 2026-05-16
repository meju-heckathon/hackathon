export type Category = "korean" | "noodle" | "street" | "cafe";

type Localized = { en: string; ko: string; ja: string; zh: string };

export type MenuItem = {
  id: string;
  name: Localized;
  description: Localized;
  priceKRW: number;
  spicy?: boolean;
  vegetarian?: boolean;
};

export type Restaurant = {
  id: string;
  name: Localized;
  category: Category;
  area: Localized;
  address: Localized;
  hours: string;
  heroEmoji: string;
  rating: number;
  waitingParties: number;
  avgWaitMinutes: number;
  blurb: Localized;
  menu: MenuItem[];
};

export const restaurants: Restaurant[] = [
  {
    id: "myeongdong-kalguksu",
    name: {
      en: "Myeongdong Kalguksu",
      ko: "명동 칼국수",
      ja: "明洞カルグクス",
      zh: "明洞刀削面",
    },
    category: "noodle",
    area: {
      en: "Myeongdong, Seoul",
      ko: "서울 명동",
      ja: "ソウル 明洞",
      zh: "首尔 明洞",
    },
    address: {
      en: "29 Myeongdong 10-gil, Jung-gu, Seoul",
      ko: "서울 중구 명동10길 29",
      ja: "ソウル特別市 中区 明洞10ギル 29",
      zh: "首尔特别市 中区 明洞10街 29",
    },
    hours: "10:30 – 21:30",
    heroEmoji: "🍜",
    rating: 4.7,
    waitingParties: 14,
    avgWaitMinutes: 35,
    blurb: {
      en: "Hand-cut noodles in rich anchovy broth. A 60-year Seoul institution.",
      ko: "멸치 육수에 손칼국수. 60년 전통의 서울 노포.",
      ja: "煮干し出汁に手打ち麺。60年の歴史を持つソウルの名店。",
      zh: "凤尾鱼汤底配手切面,首尔60年老店。",
    },
    menu: [
      {
        id: "kalguksu",
        name: { en: "Kalguksu", ko: "칼국수", ja: "カルグクス", zh: "刀削面" },
        description: {
          en: "Hand-cut wheat noodles in anchovy broth with zucchini.",
          ko: "멸치 육수에 손칼국수와 애호박.",
          ja: "煮干し出汁に手打ち麺とズッキーニ。",
          zh: "凤尾鱼汤底配手切面与西葫芦。",
        },
        priceKRW: 9000,
      },
      {
        id: "mandu",
        name: {
          en: "Steamed Mandu (10pc)",
          ko: "찐만두 (10개)",
          ja: "蒸しマンドゥ (10個)",
          zh: "蒸饺 (10个)",
        },
        description: {
          en: "Pork and chive dumplings, hand-folded.",
          ko: "돼지고기와 부추를 손으로 빚은 만두.",
          ja: "豚肉とニラを手包みした蒸し餃子。",
          zh: "手工猪肉韭菜蒸饺。",
        },
        priceKRW: 8000,
        vegetarian: false,
      },
      {
        id: "bibim",
        name: {
          en: "Bibim Guksu",
          ko: "비빔국수",
          ja: "ビビン麺",
          zh: "拌面",
        },
        description: {
          en: "Cold spicy mixed noodles with gochujang.",
          ko: "고추장 양념의 매콤한 비빔국수.",
          ja: "コチュジャンの辛味冷麺。",
          zh: "辣椒酱口味的冷拌面。",
        },
        priceKRW: 9000,
        spicy: true,
      },
    ],
  },
  {
    id: "mapo-galbi",
    name: {
      en: "Mapo Charcoal Galbi",
      ko: "마포 숯불 갈비",
      ja: "麻浦炭火カルビ",
      zh: "麻浦炭火排骨",
    },
    category: "korean",
    area: {
      en: "Mapo, Seoul",
      ko: "서울 마포",
      ja: "ソウル 麻浦",
      zh: "首尔 麻浦",
    },
    address: {
      en: "14 Mapo-daero, Mapo-gu, Seoul",
      ko: "서울 마포구 마포대로 14",
      ja: "ソウル特別市 麻浦区 麻浦大路 14",
      zh: "首尔特别市 麻浦区 麻浦大路 14",
    },
    hours: "17:00 – 24:00",
    heroEmoji: "🥩",
    rating: 4.8,
    waitingParties: 22,
    avgWaitMinutes: 55,
    blurb: {
      en: "Charcoal-grilled marinated short ribs in a smoky open kitchen.",
      ko: "숯불에 굽는 양념 갈비. 연기 자욱한 오픈 키친.",
      ja: "炭火で焼く味付けカルビ。煙が漂うオープンキッチン。",
      zh: "炭火烤的腌制排骨,烟雾缭绕的开放式厨房。",
    },
    menu: [
      {
        id: "yangnyeom-galbi",
        name: {
          en: "Marinated Galbi (200g)",
          ko: "양념 갈비 (200g)",
          ja: "味付けカルビ (200g)",
          zh: "腌制排骨 (200g)",
        },
        description: {
          en: "Soy-marinated beef short rib, grilled tableside.",
          ko: "간장 양념 소갈비, 테이블에서 직화 구이.",
          ja: "醤油ベースで漬けた牛カルビ、卓上焼き。",
          zh: "酱油腌制牛排骨,桌边炭烤。",
        },
        priceKRW: 32000,
      },
      {
        id: "naengmyeon",
        name: {
          en: "Mul Naengmyeon",
          ko: "물냉면",
          ja: "ムル冷麺",
          zh: "水冷面",
        },
        description: {
          en: "Cold beef-broth buckwheat noodles.",
          ko: "차가운 소고기 육수의 메밀 냉면.",
          ja: "冷たい牛骨スープのそば冷麺。",
          zh: "冰镇牛骨汤荞麦冷面。",
        },
        priceKRW: 11000,
      },
    ],
  },
  {
    id: "gwangjang-bindaetteok",
    name: {
      en: "Gwangjang Bindaetteok",
      ko: "광장 빈대떡",
      ja: "広蔵ピンデトック",
      zh: "广藏绿豆煎饼",
    },
    category: "street",
    area: {
      en: "Gwangjang Market, Seoul",
      ko: "서울 광장시장",
      ja: "ソウル 広蔵市場",
      zh: "首尔 广藏市场",
    },
    address: {
      en: "88 Changgyeonggung-ro, Jongno-gu, Seoul",
      ko: "서울 종로구 창경궁로 88",
      ja: "ソウル特別市 鍾路区 昌慶宮路 88",
      zh: "首尔特别市 钟路区 昌庆宫路 88",
    },
    hours: "09:00 – 22:00",
    heroEmoji: "🥞",
    rating: 4.6,
    waitingParties: 9,
    avgWaitMinutes: 20,
    blurb: {
      en: "Mung bean pancakes fried on huge cast-iron pans. A market classic.",
      ko: "거대 무쇠 솥에 부치는 녹두 빈대떡. 시장의 클래식.",
      ja: "大きな鉄板で焼く緑豆チヂミ。市場の定番。",
      zh: "在巨大铁锅上煎的绿豆煎饼,市场经典。",
    },
    menu: [
      {
        id: "bindaetteok",
        name: {
          en: "Bindaetteok",
          ko: "빈대떡",
          ja: "ピンデトック",
          zh: "绿豆煎饼",
        },
        description: {
          en: "Crispy mung bean pancake with pork and kimchi.",
          ko: "돼지고기와 김치가 들어간 바삭한 녹두전.",
          ja: "豚肉とキムチ入りのカリッとした緑豆チヂミ。",
          zh: "猪肉与泡菜的香脆绿豆煎饼。",
        },
        priceKRW: 6000,
      },
      {
        id: "makgeolli",
        name: {
          en: "Makgeolli (bowl)",
          ko: "막걸리 (한 사발)",
          ja: "マッコリ (一杯)",
          zh: "马格利 (一碗)",
        },
        description: {
          en: "Traditional rice wine, served in a brass bowl.",
          ko: "전통 쌀막걸리, 놋쇠 사발에 제공.",
          ja: "伝統的な米のどぶろく、真鍮の器で提供。",
          zh: "传统米酒,以铜碗盛装。",
        },
        priceKRW: 4000,
      },
    ],
  },
  {
    id: "anguk-cafe",
    name: {
      en: "Anguk Hanok Cafe",
      ko: "안국 한옥 카페",
      ja: "安国 韓屋カフェ",
      zh: "安国韩屋咖啡",
    },
    category: "cafe",
    area: {
      en: "Anguk, Seoul",
      ko: "서울 안국",
      ja: "ソウル 安国",
      zh: "首尔 安国",
    },
    address: {
      en: "5 Yulgok-ro 3-gil, Jongno-gu, Seoul",
      ko: "서울 종로구 율곡로3길 5",
      ja: "ソウル特別市 鍾路区 栗谷路3ギル 5",
      zh: "首尔特别市 钟路区 栗谷路3街 5",
    },
    hours: "10:00 – 21:00",
    heroEmoji: "☕",
    rating: 4.5,
    waitingParties: 6,
    avgWaitMinutes: 15,
    blurb: {
      en: "Pour-over coffee in a restored 1920s hanok courtyard.",
      ko: "1920년대 한옥을 복원한 마당에서 즐기는 핸드드립 커피.",
      ja: "1920年代の韓屋を復元した中庭で味わうハンドドリップコーヒー。",
      zh: "在修复的1920年代韩屋庭院里享用手冲咖啡。",
    },
    menu: [
      {
        id: "pourover",
        name: {
          en: "Pour-over (Ethiopia)",
          ko: "핸드드립 (에티오피아)",
          ja: "ハンドドリップ (エチオピア)",
          zh: "手冲咖啡 (埃塞俄比亚)",
        },
        description: {
          en: "Light-roast Yirgacheffe, citrus and floral notes.",
          ko: "라이트 로스트 예가체프, 시트러스와 꽃향.",
          ja: "ライトローストのイルガチェフェ、柑橘と花の香り。",
          zh: "浅烘耶加雪菲,带柑橘与花香。",
        },
        priceKRW: 7500,
        vegetarian: true,
      },
      {
        id: "patbingsu",
        name: {
          en: "Patbingsu",
          ko: "팥빙수",
          ja: "パッピンス",
          zh: "红豆刨冰",
        },
        description: {
          en: "Shaved milk ice with red bean and rice cake.",
          ko: "우유 얼음에 팥과 떡을 올린 팥빙수.",
          ja: "ミルクかき氷に小豆と餅をのせた韓国風かき氷。",
          zh: "牛奶刨冰配红豆与年糕。",
        },
        priceKRW: 12000,
        vegetarian: true,
      },
    ],
  },
];

export function getRestaurant(id: string) {
  return restaurants.find((r) => r.id === id);
}
