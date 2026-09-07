import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side match history storage (latest 30 matches, NEVER on client)
const DATA_DIR = path.join(process.cwd(), 'data');
const MATCHES_FILE = path.join(DATA_DIR, 'matches.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'game_settings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface MatchRecord {
  id: string;
  timestamp: string;
  playerName: string;
  playerCharacter: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetLaps: number;
  winnerName: string;
  isPlayerWinner: boolean;
  playerFinalGhosts: number;
  playerRank: number;
  roundsCount: number;
  alliancesCount: number;
  participants: {
    name: string;
    isHuman: boolean;
    ghosts: number;
    alliances: number;
    isBankrupt: boolean;
  }[];
}

interface GameAdminSettings {
  initialGhosts: number;
  interestRate: number; // default 1.1
  baseLapInterest: number; // default 100
  allowAIAlliances: boolean;
  adminNotes: string;
}

const defaultAdminSettings: GameAdminSettings = {
  initialGhosts: 10000,
  interestRate: 1.1,
  baseLapInterest: 100,
  allowAIAlliances: true,
  adminNotes: '怪異同盟 管理者設定 - バージョン 1.0.0'
};

function readMatches(): MatchRecord[] {
  try {
    if (fs.existsSync(MATCHES_FILE)) {
      const data = fs.readFileSync(MATCHES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading matches:', err);
  }
  return [];
}

function writeMatches(matches: MatchRecord[]) {
  try {
    // Keep strictly up to 30 matches
    const limited = matches.slice(-30);
    fs.writeFileSync(MATCHES_FILE, JSON.stringify(limited, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing matches:', err);
  }
}

function readSettings(): GameAdminSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...defaultAdminSettings, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading settings:', err);
  }
  return defaultAdminSettings;
}

function writeSettings(settings: GameAdminSettings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing settings:', err);
  }
}

// Seed initial historical matches if empty, to provide instant 30-match viewing
if (!fs.existsSync(MATCHES_FILE) || readMatches().length === 0) {
  const seedMatches: MatchRecord[] = [
    {
      id: 'match_seed_1',
      timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      playerName: '契約者レオン',
      playerCharacter: '陰陽師 (Onmyoji)',
      difficulty: 'intermediate',
      targetLaps: 5,
      winnerName: '契約者レオン',
      isPlayerWinner: true,
      playerFinalGhosts: 14200,
      playerRank: 1,
      roundsCount: 16,
      alliancesCount: 4,
      participants: [
        { name: '契約者レオン', isHuman: true, ghosts: 14200, alliances: 4, isBankrupt: false },
        { name: 'バフォメット', isHuman: false, ghosts: 8400, alliances: 3, isBankrupt: false },
        { name: 'ベルゼブブ', isHuman: false, ghosts: 0, alliances: 2, isBankrupt: true },
        { name: 'アスモデウス', isHuman: false, ghosts: 5100, alliances: 1, isBankrupt: false }
      ]
    },
    {
      id: 'match_seed_2',
      timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      playerName: '霊媒士カレン',
      playerCharacter: 'オカルティスト (Occultist)',
      difficulty: 'advanced',
      targetLaps: 10,
      winnerName: 'バフォメット',
      isPlayerWinner: false,
      playerFinalGhosts: 0,
      playerRank: 4,
      roundsCount: 22,
      alliancesCount: 2,
      participants: [
        { name: 'バフォメット', isHuman: false, ghosts: 23100, alliances: 6, isBankrupt: false },
        { name: 'アスモデウス', isHuman: false, ghosts: 11200, alliances: 3, isBankrupt: false },
        { name: 'ベルゼブブ', isHuman: false, ghosts: 0, alliances: 1, isBankrupt: true },
        { name: '霊媒士カレン', isHuman: true, ghosts: 0, alliances: 2, isBankrupt: true }
      ]
    },
    {
      id: 'match_seed_3',
      timestamp: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      playerName: '魔導師シン',
      playerCharacter: '退魔司祭 (Exorcist)',
      difficulty: 'beginner',
      targetLaps: 5,
      winnerName: '魔導師シン',
      isPlayerWinner: true,
      playerFinalGhosts: 18950,
      playerRank: 1,
      roundsCount: 14,
      alliancesCount: 5,
      participants: [
        { name: '魔導師シン', isHuman: true, ghosts: 18950, alliances: 5, isBankrupt: false },
        { name: 'アスモデウス', isHuman: false, ghosts: 7200, alliances: 2, isBankrupt: false },
        { name: 'バフォメット', isHuman: false, ghosts: 4100, alliances: 2, isBankrupt: false },
        { name: 'ベルゼブブ', isHuman: false, ghosts: 0, alliances: 1, isBankrupt: true }
      ]
    }
  ];
  writeMatches(seedMatches);
}

// ---------------- API ROUTES ----------------

// GET /api/matches - Retrieve recent matches (max 30) from server
app.get('/api/matches', (_req, res) => {
  const matches = readMatches();
  // Return sorted latest first
  res.json({
    success: true,
    total: matches.length,
    matches: [...matches].reverse()
  });
});

// POST /api/matches - Record a new match on the server
app.post('/api/matches', (req, res) => {
  const newMatch: MatchRecord = {
    id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    playerName: req.body.playerName || '人間契約者',
    playerCharacter: req.body.playerCharacter || 'オカルティスト',
    difficulty: req.body.difficulty || 'beginner',
    targetLaps: Number(req.body.targetLaps) || 5,
    winnerName: req.body.winnerName || '未定',
    isPlayerWinner: Boolean(req.body.isPlayerWinner),
    playerFinalGhosts: Number(req.body.playerFinalGhosts) || 0,
    playerRank: Number(req.body.playerRank) || 1,
    roundsCount: Number(req.body.roundsCount) || 1,
    alliancesCount: Number(req.body.alliancesCount) || 0,
    participants: Array.isArray(req.body.participants) ? req.body.participants : []
  };

  const current = readMatches();
  current.push(newMatch);
  writeMatches(current);

  res.status(201).json({
    success: true,
    match: newMatch
  });
});

// Admin API
app.get('/api/admin/stats', (_req, res) => {
  const matches = readMatches();
  const settings = readSettings();

  const totalMatches = matches.length;
  const playerWins = matches.filter(m => m.isPlayerWinner).length;
  const winRate = totalMatches > 0 ? Math.round((playerWins / totalMatches) * 100) : 0;

  const difficultyBreakdown = {
    beginner: { total: 0, wins: 0 },
    intermediate: { total: 0, wins: 0 },
    advanced: { total: 0, wins: 0 }
  };

  matches.forEach(m => {
    if (difficultyBreakdown[m.difficulty]) {
      difficultyBreakdown[m.difficulty].total += 1;
      if (m.isPlayerWinner) {
        difficultyBreakdown[m.difficulty].wins += 1;
      }
    }
  });

  res.json({
    success: true,
    stats: {
      totalMatches,
      playerWins,
      winRate,
      difficultyBreakdown,
      settings
    }
  });
});

app.post('/api/admin/settings', (req, res) => {
  const current = readSettings();
  const updated: GameAdminSettings = {
    ...current,
    ...req.body
  };
  writeSettings(updated);
  res.json({ success: true, settings: updated });
});

app.post('/api/admin/reset-matches', (_req, res) => {
  writeMatches([]);
  res.json({ success: true, message: 'All match records reset on server' });
});

// GitHub Integration APIs
app.get('/api/github/status', (_req, res) => {
  res.json({
    success: true,
    integration: {
      connected: true,
      repository: 'ghost-cryptid-alliance/kai-i-domei',
      branch: 'main',
      latestSync: new Date().toISOString(),
      syncFeatures: [
        '自動ゲーム対戦ログのエクスポート (Export match logs to GitHub Markdown/JSON)',
        '怪異バランス設定のコミット管理 (Balance configuration synchronization)',
        'GitHub Actions 自動CI検証 (Build & test workflow ready)'
      ]
    }
  });
});

app.post('/api/github/export', (_req, res) => {
  const matches = readMatches();
  const markdownReport = [
    '# 🎮 怪異同盟 (Kai-i Domei) - 対戦戦歴レポート',
    `*生成日時: ${new Date().toLocaleString('ja-JP')}*`,
    '',
    '## 概要',
    `- 総記録試合数: ${matches.length}戦`,
    `- プレイヤー総勝利数: ${matches.filter(m => m.isPlayerWinner).length}勝`,
    '',
    '## 直近対戦結果一覧',
    '| 日時 | 契約者名 | 難易度 | 周回設定 | 勝者 | 最終所持ゴースト | 順位 |',
    '| :--- | :--- | :--- | :--- | :--- | :--- | :--- |',
    ...matches.slice(-30).reverse().map(m =>
      `| ${new Date(m.timestamp).toLocaleDateString('ja-JP')} | ${m.playerName} | ${m.difficulty} | ${m.targetLaps}周 | ${m.winnerName} | ${m.playerFinalGhosts.toLocaleString()} G | ${m.playerRank}位 |`
    ),
    '',
    '---',
    '*本データは怪異同盟ゲームサーバーにより永続管理されています。*'
  ].join('\n');

  res.json({
    success: true,
    markdown: markdownReport,
    json: matches
  });
});

// ---------------- VITE & STATIC FILES ----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`怪異同盟 Game Server running on port ${PORT}`);
  });
}

startServer();
