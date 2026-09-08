import { Cryptid, BoardTile, PlayerCharacter, AICharacter, OccultCard } from '../types';

export const PLAYER_CHARACTERS: PlayerCharacter[] = [
  {
    id: 'onmyoji',
    name: '陰陽師 (Onmyoji)',
    role: '和風・呪符の退魔士',
    origin: '日本',
    description: '式神と五行の霊符を操り、現世と常世の境界を守護する呪術者。',
    color: '#06b6d4', // Cyan spiritual flame
    modelType: 'onmyoji'
  },
  {
    id: 'exorcist',
    name: '退魔司祭 (Exorcist)',
    role: '聖術・銀杭の執行者',
    origin: 'バチカン',
    description: '聖別された十字架と聖水を掲げ、闇の怪異を退ける厳格な異端審問官。',
    color: '#eab308', // Holy Gold
    modelType: 'exorcist'
  },
  {
    id: 'occultist',
    name: 'オカルティスト (Occultist)',
    role: '深淵・禁書の研究家',
    origin: 'イギリス',
    description: '魔導書『ネクロノミコン』を解読し、怪異の理を己の力に変える探求者。',
    color: '#a855f7', // Eldritch Purple
    modelType: 'medium'
  },
  {
    id: 'alchemist',
    name: '黒錬金術師 (Alchemist)',
    role: '変成・霊素の調合師',
    origin: 'プラハ',
    description: '賢者の石の模造品により怪異の魂を霊貨「ゴースト」へと昇華させる異端児。',
    color: '#10b981', // Emerald Alchemy
    modelType: 'alchemist'
  }
];

export const AI_DEMONS: AICharacter[] = [
  {
    id: 'baphomet',
    name: 'バフォメット',
    title: '黒山羊の智恵神',
    origin: '中世オカルト伝承',
    personality: '理知的な契約者。利益率の高い同盟を着実に固め、計算づくで勝利を狙う。',
    color: '#ef4444', // Blood Crimson
    modelType: 'baphomet'
  },
  {
    id: 'beelzebub',
    name: 'ベルゼブブ',
    title: '深淵の蝿の王',
    origin: 'カナン神話・地獄の宰相',
    personality: '貪欲な領土拡張者。怪異の格を問わず次々と同盟を結び、地歩を強奪する。',
    color: '#84cc16', // Toxic Green
    modelType: 'beelzebub'
  },
  {
    id: 'asmodeus',
    name: 'アスモデウス',
    title: '激情の紅蓮公',
    origin: 'ソロモン72柱・悪魔大公',
    personality: '勝負狂のギャンブラー。怪異とのバトルを恐れず、高リスク高リターンに賭ける。',
    color: '#f97316', // Infernal Flame Orange
    modelType: 'asmodeus'
  }
];

export const CRYPTIDS: Cryptid[] = [
  {
    id: 1,
    name: '八尺様',
    nameEn: 'Hachishaku-sama',
    country: '日本',
    grade: '特級',
    allianceCost: 1600,
    baseTribute: 750,
    description: '「ぽぽぽ…」と奇怪な笑い声を響かせる身長八尺の白い女怪異。魅入られた者は逃れられない。',
    curseType: '精神汚染・魅入られ',
    avatarIcon: '👻',
    themeColor: '#e0e7ff'
  },
  {
    id: 2,
    name: 'モスマン',
    nameEn: 'Mothman',
    country: 'アメリカ',
    grade: '1級',
    allianceCost: 1100,
    baseTribute: 480,
    description: '赤く輝く複眼と漆黒の翼を持つ飛翔未確認生物。凶事の直前に現れ警告する。',
    curseType: '厄災予兆・超音波',
    avatarIcon: '🦇',
    themeColor: '#dc2626'
  },
  {
    id: 3,
    name: 'チュパカブラ',
    nameEn: 'Chupacabra',
    country: 'プエルトリコ',
    grade: '2級',
    allianceCost: 800,
    baseTribute: 320,
    description: '獲物の血を完全に吸い尽くす牙を持つ吸血獣。闇夜に潜み素早く急襲する。',
    curseType: '霊血吸啜・体力強奪',
    avatarIcon: '🐺',
    themeColor: '#ca8a04'
  },
  {
    id: 4,
    name: 'メリーさん',
    nameEn: 'Mary-san',
    country: '日本',
    grade: '3級',
    allianceCost: 550,
    baseTribute: 220,
    description: '「私メリーさん、今あなたの後ろにいるの…」携帯電話を通じて距離を詰める怪奇人形。',
    curseType: '空間跳躍・背後急襲',
    avatarIcon: '🪆',
    themeColor: '#ec4899'
  },
  {
    id: 5,
    name: '口裂け女',
    nameEn: 'Kuchisake-onna',
    country: '日本',
    grade: '2級',
    allianceCost: 850,
    baseTribute: 340,
    description: '「私、綺麗…？」巨大なハサミを携え、解答を誤った旅人を切り裂く都市伝説の怪異。',
    curseType: '問答呪縛・裂傷',
    avatarIcon: '✂️',
    themeColor: '#f43f5e'
  },
  {
    id: 6,
    name: 'ウェンディゴ',
    nameEn: 'Wendigo',
    country: 'カナダ',
    grade: '特級',
    allianceCost: 1800,
    baseTribute: 850,
    description: '極北の氷雪地帯を彷徨う飢餓の悪霊。決して満たされない無限の飢えで魂を喰らい尽くす。',
    curseType: '凍結飢餓・霊魂喰い',
    avatarIcon: '🦌',
    themeColor: '#38bdf8'
  },
  {
    id: 7,
    name: 'ネッシー',
    nameEn: 'Loch Ness Monster',
    country: 'スコットランド',
    grade: '1級',
    allianceCost: 1200,
    baseTribute: 520,
    description: 'ネス湖の底知れぬ深淵に潜む巨大水竜。霧深き夜に水面を割り巨体を現す。',
    curseType: '大渦巻・水底幽閉',
    avatarIcon: '🦕',
    themeColor: '#0ea5e9'
  },
  {
    id: 8,
    name: 'ジャック・オー・ランタン',
    nameEn: "Jack-o'-Lantern",
    country: 'アイルランド',
    grade: '2級',
    allianceCost: 900,
    baseTribute: 360,
    description: '天国にも地獄にも拒絶された亡霊ジャックの魂が宿る、妖しく嗤う火炎南瓜。',
    curseType: '鬼火幻惑・迷い道',
    avatarIcon: '🎃',
    themeColor: '#f97316'
  },
  {
    id: 9,
    name: 'クラーケン',
    nameEn: 'Kraken',
    country: 'ノルウェー',
    grade: '特級',
    allianceCost: 1900,
    baseTribute: 900,
    description: '北海の暗黒海峡に巣食う超巨大頭足類。触手の一撃で堅牢な軍艦すらへし折る。',
    curseType: '深海圧殺・触手縛',
    avatarIcon: '🦑',
    themeColor: '#6366f1'
  },
  {
    id: 10,
    name: 'デュラハン',
    nameEn: 'Dullahan',
    country: 'アイルランド',
    grade: '1級',
    allianceCost: 1300,
    baseTribute: 550,
    description: '自らの首を抱え、黒馬に跨がり走る死の妖精騎士。名を呼ばれた者は命を奪われる。',
    curseType: '死宣告・霊首狩り',
    avatarIcon: '🏇',
    themeColor: '#a855f7'
  },
  {
    id: 11,
    name: 'カンカンダラ',
    nameEn: 'Kankandara',
    country: '日本',
    grade: '1級',
    allianceCost: 1150,
    baseTribute: 500,
    description: '「カンカンカン…」と金属音を立てて山林を蛇行疾走する禁忌の奇形忌み神。',
    curseType: '禁忌波長・狂気感染',
    avatarIcon: '🐍',
    themeColor: '#10b981'
  },
  {
    id: 12,
    name: 'ドッペルゲンガー',
    nameEn: 'Doppelgänger',
    country: 'ドイツ',
    grade: '特級',
    allianceCost: 1750,
    baseTribute: 800,
    description: '自己の姿を完全コピーして出現する分身怪異。遭遇した者は近いうちに死を遂げる。',
    curseType: '自己反転・存在簒奪',
    avatarIcon: '👥',
    themeColor: '#9333ea'
  },
  {
    id: 13,
    name: 'スレンダーマン',
    nameEn: 'Slenderman',
    country: 'アメリカ',
    grade: '特級',
    allianceCost: 1850,
    baseTribute: 880,
    description: '漆黒のスーツを着た無貌・異常長躯の怪異。背中から伸びる無数の触手で異空間へ連れ去る。',
    curseType: '無貌電波・次元拉致',
    avatarIcon: '🕴️',
    themeColor: '#64748b'
  },
  {
    id: 14,
    name: 'カッパ',
    nameEn: 'Kappa',
    country: '日本',
    grade: '3級',
    allianceCost: 600,
    baseTribute: 240,
    description: '頭上の皿に水を湛え川辺に棲息する水妖。尻子玉を狙って相撲を挑んでくる。',
    curseType: '尻子玉抜取・水難',
    avatarIcon: '🥒',
    themeColor: '#22c55e'
  },
  {
    id: 15,
    name: 'バンシー',
    nameEn: 'Banshee',
    country: 'アイルランド',
    grade: '2級',
    allianceCost: 950,
    baseTribute: 380,
    description: '一家の死を予見して暗夜に長髪を乱し慟哭の叫びをあげる女霊妖精。',
    curseType: '慟哭絶叫・魂魄破砕',
    avatarIcon: '👰',
    themeColor: '#c084fc'
  },
  {
    id: 16,
    name: 'ポルターガイスト',
    nameEn: 'Poltergeist',
    country: 'イギリス',
    grade: '3級',
    allianceCost: 500,
    baseTribute: 200,
    description: '家具や食器を宙に浮かせ激しく投げつける騒々しい騒霊。室内の者を混乱に陥れる。',
    curseType: '念力飛翔・破壊騒乱',
    avatarIcon: '🕯️',
    themeColor: '#fbbf24'
  },
  {
    id: 17,
    name: '口裂け女',
    nameEn: 'Kuchisake-onna',
    country: '日本',
    grade: '2級',
    allianceCost: 1050,
    baseTribute: 420,
    description: '「私、きれい…？」と尋ね耳元まで裂けた口を見せる都市伝説の代表格怪異。',
    curseType: '絶対問答・裁ち鋏',
    avatarIcon: '✂️',
    themeColor: '#e11d48'
  },
  {
    id: 18,
    name: 'チュパカブラ',
    nameEn: 'Chupacabra',
    country: 'プエルトリコ',
    grade: '2級',
    allianceCost: 980,
    baseTribute: 400,
    description: '家畜の血を瞬時に吸い尽くす奇怪な吸血生物。暗闇から鋭い牙で忍び寄る。',
    curseType: '霊血搾取・吸血牙',
    avatarIcon: '🦇',
    themeColor: '#be123c'
  },
  {
    id: 19,
    name: 'ネッシー',
    nameEn: 'Nessie',
    country: 'スコットランド',
    grade: '1級',
    allianceCost: 1400,
    baseTribute: 600,
    description: '深い霧のネス湖に潜む巨大首長竜UMA。湖面を揺るがし波紋を残して消え去る。',
    curseType: '湖底深淵・霧中潜伏',
    avatarIcon: '🦕',
    themeColor: '#0284c7'
  },
  {
    id: 20,
    name: 'ウェンディゴ',
    nameEn: 'Wendigo',
    country: 'カナダ',
    grade: '特級',
    allianceCost: 1800,
    baseTribute: 850,
    description: '極寒の吹雪とともに現れる人喰い飢餓の魔獣。終わらない飢えを撒き散らす。',
    curseType: '飢餓狂乱・吹雪凍結',
    avatarIcon: '🦌',
    themeColor: '#0ea5e9'
  },
  {
    id: 21,
    name: 'ジャージー・デビル',
    nameEn: 'Jersey Devil',
    country: 'アメリカ',
    grade: '1級',
    allianceCost: 1250,
    baseTribute: 520,
    description: '馬の頭にコウモリの翼、蹄を持つ悪魔の子。夜空を甲高い金切り声で翔ける。',
    curseType: '不吉蹄音・空襲',
    avatarIcon: '🐎',
    themeColor: '#b45309'
  },
  {
    id: 22,
    name: 'メジェド',
    nameEn: 'Medjed',
    country: 'エジプト',
    grade: '1級',
    allianceCost: 1350,
    baseTribute: 560,
    description: '『死者の書』に記されし不可視の打ち倒す神。布を被った姿から目から光線を放つ。',
    curseType: '神罰不可視・破壊光線',
    avatarIcon: '👁️',
    themeColor: '#f59e0b'
  },
  {
    id: 23,
    name: '土蜘蛛',
    nameEn: 'Tsuchigumo',
    country: '日本',
    grade: '特級',
    allianceCost: 1700,
    baseTribute: 780,
    description: '山奥の洞穴を巣とし、毒糸を吐いて獲物を捕食する古代の巨大蜘蛛妖怪。',
    curseType: '怨念絡繰・猛毒縛糸',
    avatarIcon: '🕷️',
    themeColor: '#78716c'
  },
  {
    id: 24,
    name: '件 (くだん)',
    nameEn: 'Kudan',
    country: '日本',
    grade: '2級',
    allianceCost: 1000,
    baseTribute: 450,
    description: '人面牛身の予言獣。生まれ落ちて重大な凶事を予言し、数日で息絶える。',
    curseType: '終末予言・運命確定',
    avatarIcon: '🐂',
    themeColor: '#d97706'
  },
  {
    id: 25,
    name: 'ビッグフット',
    nameEn: 'Bigfoot',
    country: 'アメリカ',
    grade: '2級',
    allianceCost: 1100,
    baseTribute: 460,
    description: '鬱蒼とした原生林に足跡を残す巨大毛むくじゃらの猿人UMA。大地を揺らす。',
    curseType: '原生獣力・大地震動',
    avatarIcon: '👣',
    themeColor: '#a16207'
  },
  {
    id: 26,
    name: 'グレムリン',
    nameEn: 'Gremlin',
    country: 'イギリス',
    grade: '3級',
    allianceCost: 550,
    baseTribute: 220,
    description: '機械や計器に潜り込み意図的に不具合を起こす悪戯妖精。盤上を狂わせる。',
    curseType: '機工破壊・悪戯攪乱',
    avatarIcon: '⚙️',
    themeColor: '#84cc16'
  },
  {
    id: 27,
    name: 'バジリスク',
    nameEn: 'Basilisk',
    country: 'ギリシャ',
    grade: '1級',
    allianceCost: 1450,
    baseTribute: 620,
    description: 'その視線で見つめた者を一瞬で石化させる蛇の王。毒息は草木すら枯らす。',
    curseType: '石化邪視・枯渇猛毒',
    avatarIcon: '🦎',
    themeColor: '#15803d'
  },
  {
    id: 28,
    name: '九尾の狐',
    nameEn: 'Nine-tailed Fox',
    country: '日本',
    grade: '特級',
    allianceCost: 2000,
    baseTribute: 950,
    description: '千年の霊力を宿し九本の尾を揺らす伝説の大妖怪。絶大な妖気で国をも傾ける。',
    curseType: '傾国妖術・九華火焔',
    avatarIcon: '🦊',
    themeColor: '#f43f5e'
  }
];

export const INITIAL_BOARD: BoardTile[] = [
  // Edge 1: Bottom (0..9) - 10 tiles, from Bottom-Right to Bottom-Left (Counter-Clockwise Left Turn)
  {
    index: 0,
    type: 'start',
    name: '魔王の祭壇 (START)',
    nameSub: '周回利息支払い・再契約の間',
    ownerId: null,
    allianceLevel: 0
  },
  {
    index: 1,
    type: 'cryptid',
    name: CRYPTIDS[0].name,
    cryptid: CRYPTIDS[0],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 2,
    type: 'cryptid',
    name: CRYPTIDS[1].name,
    cryptid: CRYPTIDS[1],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 3,
    type: 'cryptid',
    name: CRYPTIDS[2].name,
    cryptid: CRYPTIDS[2],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 4,
    type: 'cryptid',
    name: CRYPTIDS[3].name,
    cryptid: CRYPTIDS[3],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 5,
    type: 'curse_relic',
    name: '呪物収蔵庫 (深淵)',
    nameSub: '運命のオカルトカード召喚',
    ownerId: null,
    allianceLevel: 0
  },
  {
    index: 6,
    type: 'cryptid',
    name: CRYPTIDS[4].name,
    cryptid: CRYPTIDS[4],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 7,
    type: 'cryptid',
    name: CRYPTIDS[5].name,
    cryptid: CRYPTIDS[5],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 8,
    type: 'cryptid',
    name: CRYPTIDS[6].name,
    cryptid: CRYPTIDS[6],
    ownerId: null,
    allianceLevel: 1
  },
  // Corner 1: Left-Bottom (Index 9)
  {
    index: 9,
    type: 'occult_rift',
    name: '異界の特異点',
    nameSub: '時空跳躍ワープ (前方へ跳躍)',
    ownerId: null,
    allianceLevel: 0
  },

  // Edge 2: Left (9..18) - 10 tiles, from Bottom-Left to Top-Left
  {
    index: 10,
    type: 'cryptid',
    name: CRYPTIDS[7].name,
    cryptid: CRYPTIDS[7],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 11,
    type: 'cryptid',
    name: CRYPTIDS[8].name,
    cryptid: CRYPTIDS[8],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 12,
    type: 'cryptid',
    name: CRYPTIDS[9].name,
    cryptid: CRYPTIDS[9],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 13,
    type: 'cryptid',
    name: CRYPTIDS[10].name,
    cryptid: CRYPTIDS[10],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 14,
    type: 'curse_relic',
    name: '降霊の儀式場',
    nameSub: '運命のオカルトカード召喚',
    ownerId: null,
    allianceLevel: 0
  },
  {
    index: 15,
    type: 'cryptid',
    name: CRYPTIDS[11].name,
    cryptid: CRYPTIDS[11],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 16,
    type: 'cryptid',
    name: CRYPTIDS[12].name,
    cryptid: CRYPTIDS[12],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 17,
    type: 'cryptid',
    name: CRYPTIDS[13].name,
    cryptid: CRYPTIDS[13],
    ownerId: null,
    allianceLevel: 1
  },
  // Corner 2: Top-Left (Index 18)
  {
    index: 18,
    type: 'curse_relic',
    name: '呪物大収蔵庫',
    nameSub: '運命のオカルトカード召喚',
    ownerId: null,
    allianceLevel: 0
  },

  // Edge 3: Top (18..27) - 10 tiles, from Top-Left to Top-Right
  {
    index: 19,
    type: 'cryptid',
    name: CRYPTIDS[14].name,
    cryptid: CRYPTIDS[14],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 20,
    type: 'cryptid',
    name: CRYPTIDS[15].name,
    cryptid: CRYPTIDS[15],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 21,
    type: 'cryptid',
    name: CRYPTIDS[16].name,
    cryptid: CRYPTIDS[16],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 22,
    type: 'cryptid',
    name: CRYPTIDS[17].name,
    cryptid: CRYPTIDS[17],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 23,
    type: 'curse_relic',
    name: '黄泉の託宣所',
    nameSub: '運命のオカルトカード召喚',
    ownerId: null,
    allianceLevel: 0
  },
  {
    index: 24,
    type: 'cryptid',
    name: CRYPTIDS[18].name,
    cryptid: CRYPTIDS[18],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 25,
    type: 'cryptid',
    name: CRYPTIDS[19].name,
    cryptid: CRYPTIDS[19],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 26,
    type: 'cryptid',
    name: CRYPTIDS[20].name,
    cryptid: CRYPTIDS[20],
    ownerId: null,
    allianceLevel: 1
  },
  // Corner 3: Top-Right (Index 27)
  {
    index: 27,
    type: 'blood_tax',
    name: '血税の生贄台',
    nameSub: '魔王へ5%の血霊納付',
    ownerId: null,
    allianceLevel: 0
  },

  // Edge 4: Right (27..35 + 0) - 10 tiles, from Top-Right to Bottom-Right
  {
    index: 28,
    type: 'cryptid',
    name: CRYPTIDS[21].name,
    cryptid: CRYPTIDS[21],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 29,
    type: 'cryptid',
    name: CRYPTIDS[22].name,
    cryptid: CRYPTIDS[22],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 30,
    type: 'cryptid',
    name: CRYPTIDS[23].name,
    cryptid: CRYPTIDS[23],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 31,
    type: 'cryptid',
    name: CRYPTIDS[24].name,
    cryptid: CRYPTIDS[24],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 32,
    type: 'occult_rift',
    name: '次元の裂け目',
    nameSub: '時空跳躍ワープ (前方へ跳躍)',
    ownerId: null,
    allianceLevel: 0
  },
  {
    index: 33,
    type: 'cryptid',
    name: CRYPTIDS[25].name,
    cryptid: CRYPTIDS[25],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 34,
    type: 'cryptid',
    name: CRYPTIDS[26].name,
    cryptid: CRYPTIDS[26],
    ownerId: null,
    allianceLevel: 1
  },
  {
    index: 35,
    type: 'cryptid',
    name: CRYPTIDS[27].name,
    cryptid: CRYPTIDS[27],
    ownerId: null,
    allianceLevel: 1
  }
];

// Fate Cards database
export const OCCULT_CARDS_LUCKY: OccultCard[] = [
  {
    id: 'l1',
    title: '怪異の加護【魂の共鳴】',
    cryptidName: '神秘の霊導',
    type: 'lucky',
    category: 'divine_grace',
    description: '怪異があなたの霊力に感銘を受け、契約の対価として魔力ゴーストを献上した。',
    fluffQuote: '「お前の魂…悪くない響きだ。これを持っていけ」',
    effectValue: 1200
  },
  {
    id: 'l2',
    title: '魔王の気まぐれ【利息免除】',
    cryptidName: '魔王の恩赦',
    type: 'lucky',
    category: 'divine_grace',
    description: 'バンカーである魔王が退屈しのぎに、次周の利息免除とボーナスを授けた。',
    fluffQuote: '「ふふ…見事な生贄ぶりだ。褒美をとらせよう」',
    effectValue: 800
  },
  {
    id: 'l3',
    title: '怪異狂宴【霊力強奪】',
    cryptidName: '影の同盟陣',
    type: 'lucky',
    category: 'plunder',
    description: 'フィールドの全対戦相手からそれぞれ300ゴーストずつ霊気を吸い上げた。',
    fluffQuote: '「闇はすべてを均す…奪い取れ」',
    effectValue: 300
  },
  {
    id: 'l4',
    title: '時空裂開【跳躍の呪印】',
    cryptidName: '異界の門',
    type: 'lucky',
    category: 'teleport',
    description: '足元の空間が歪み、一気に前方の有利なマスへ3マス跳躍した。',
    fluffQuote: '「境界を越えよ。時間は貴様の意のままだ」',
    effectValue: 3
  },
  {
    id: 'l5',
    title: '古文書の秘儀【無償同盟の契り】',
    cryptidName: '禁断の契約書',
    type: 'lucky',
    category: 'alliance_boost',
    description: '怪異との絆が深まり、強大な魔力障壁が展開された。所持金が大幅増加。',
    fluffQuote: '「血の署名など不要…魂で語らおう」',
    effectValue: 1500
  }
];

export const OCCULT_CARDS_UNLUCKY: OccultCard[] = [
  {
    id: 'u1',
    title: '怪異の祟り【血の報復】',
    cryptidName: '怨嗟の爪痕',
    type: 'unlucky',
    category: 'curse',
    description: '怪異の逆鱗に触れた！身体から生気を吸われ、大損害を被った。',
    fluffQuote: '「我が領域を土足で踏み荒らす愚か者め…！」',
    effectValue: 1000
  },
  {
    id: 'u2',
    title: '悪霊の金縛り【足止め】',
    cryptidName: '呪縛の泥濘',
    type: 'unlucky',
    category: 'teleport',
    description: '霊体の手によって後方へ2マス引きずり戻された。',
    fluffQuote: '「どこへ行く…？ ここで朽ち果てるがよい」',
    effectValue: -2
  },
  {
    id: 'u3',
    title: '魔王の催促状【過酷な重課】',
    cryptidName: '借財の執行者',
    type: 'unlucky',
    category: 'curse',
    description: '魔王の死神徴税官が突如出現し、強制的に取り立てが行われた。',
    fluffQuote: '「命を担保にしたことを忘れたか？ 払え」',
    effectValue: 800
  },
  {
    id: 'u4',
    title: '憑依発狂【霊貨の散逸】',
    cryptidName: '彷徨う百鬼夜行',
    type: 'unlucky',
    category: 'curse',
    description: '無数の雑霊が財布に群がり、1200ゴーストを喰い荒らした。',
    fluffQuote: '「喰わせろ…もっと冷たい霊魂の通貨を…」',
    effectValue: 1200
  },
  {
    id: 'u5',
    title: '他プレイヤー同盟の猛威【領域の鉄槌】',
    cryptidName: '契約怪異の迎撃',
    type: 'unlucky',
    category: 'curse',
    description: '他者の同盟怪異が全力で防衛迎撃！莫大な貢ぎ物(タックス)を強制徴収された。',
    fluffQuote: '「ここは我が盟友の領地ぞ。立ち去れぬなら身ぐるみ剥がすまで！」',
    effectValue: 1400
  }
];

// Helper to calculate lap interest
// 1周後: 100, 2周後: 110, 3周後: 121 (1.1x each, Math.floor)
export function calculateLapInterest(lapNumber: number): number {
  if (lapNumber <= 0) return 0;
  let interest = 100;
  for (let i = 2; i <= lapNumber; i++) {
    interest = Math.floor(interest * 1.1);
  }
  return interest;
}
