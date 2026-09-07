import React, { useEffect, useState } from 'react';
import { Shield, Settings, BarChart3, Database, Save, RotateCcw, ArrowLeft, CheckCircle, AlertCircle, Wrench } from 'lucide-react';

interface AdminStats {
  totalMatches: number;
  playerWins: number;
  winRate: number;
  difficultyBreakdown: {
    beginner: { total: 0; wins: 0 };
    intermediate: { total: 0; wins: 0 };
    advanced: { total: 0; wins: 0 };
  };
  settings: {
    initialGhosts: number;
    interestRate: number;
    baseLapInterest: number;
    allowAIAlliances: boolean;
    adminNotes: string;
  };
}

interface AdminPanelProps {
  onBackToGame: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToGame }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialGhosts, setInitialGhosts] = useState(10000);
  const [interestRate, setInterestRate] = useState(1.1);
  const [baseInterest, setBaseInterest] = useState(100);
  const [adminNotes, setAdminNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        if (data.stats.settings) {
          setInitialGhosts(data.stats.settings.initialGhosts);
          setInterestRate(data.stats.settings.interestRate);
          setBaseInterest(data.stats.settings.baseLapInterest);
          setAdminNotes(data.stats.settings.adminNotes || '');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialGhosts,
          interestRate,
          baseLapInterest: baseInterest,
          adminNotes
        })
      });
      if (res.ok) {
        setSaveStatus('サーバー設定を更新しました');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetMatches = async () => {
    if (!window.confirm('本当にサーバーの対戦履歴（直近30戦）を全て初期化しますか？')) return;
    try {
      const res = await fetch('/api/admin/reset-matches', { method: 'POST' });
      if (res.ok) {
        alert('対戦履歴をリセットしました');
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 border border-purple-900/80 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-900/50 border border-purple-600 text-purple-200">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-black text-amber-100">
                  怪異同盟 管理者コンソール
                </h1>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-purple-900 text-purple-200 border border-purple-700">
                  URL: /admin
                </span>
              </div>
              <p className="text-xs text-white/60 font-mono mt-0.5">
                ゲームサーバーパラメータ管理 & 統計解析ダッシュボード
              </p>
            </div>
          </div>

          <button
            onClick={onBackToGame}
            className="px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>プレイヤー用URL (ゲーム画面) へ戻る</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-white/50 block font-mono">総対戦記録数</span>
              <span className="text-2xl font-black text-white font-mono">
                {stats ? stats.totalMatches : '...'} 戦
              </span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-white/50 block font-mono">人間プレイヤー勝率</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {stats ? `${stats.winRate}%` : '...'}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-950 border border-purple-800 text-purple-300">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-white/50 block font-mono">データ保持方式</span>
              <span className="text-sm font-bold text-purple-300 font-mono">
                Server Persistent (No Cookie)
              </span>
            </div>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        {stats && (
          <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white/80 font-serif flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              難易度別 勝敗統計 (初級: 人間80% / 中級: 人間65% / 上級: 人間50%)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-black/40 border border-emerald-900/50">
                <span className="text-emerald-400 font-bold block mb-1">初級 (Beginner)</span>
                <p className="text-white/70">
                  対戦数: {stats.difficultyBreakdown.beginner.total}戦 | 勝者: {stats.difficultyBreakdown.beginner.wins}勝
                </p>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-amber-900/50">
                <span className="text-amber-400 font-bold block mb-1">中級 (Intermediate)</span>
                <p className="text-white/70">
                  対戦数: {stats.difficultyBreakdown.intermediate.total}戦 | 勝者: {stats.difficultyBreakdown.intermediate.wins}勝
                </p>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-red-900/50">
                <span className="text-red-400 font-bold block mb-1">上級 (Advanced)</span>
                <p className="text-white/70">
                  対戦数: {stats.difficultyBreakdown.advanced.total}戦 | 勝者: {stats.difficultyBreakdown.advanced.wins}勝
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Game Rules & Parameter Tuning */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-400" />
              ゲーム経済・魔王利息パラメータ調整
            </h3>
            {saveStatus && (
              <span className="text-xs text-emerald-400 font-mono animate-pulse">
                ✓ {saveStatus}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block text-white/60 mb-1">
                初期借入ゴースト (命担保ローン):
              </label>
              <input
                type="number"
                value={initialGhosts}
                onChange={e => setInitialGhosts(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg bg-black/60 border border-purple-900 text-white font-mono focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-white/40 mt-1 block">標準: 10,000 G</span>
            </div>

            <div>
              <label className="block text-white/60 mb-1">
                魔王周回利息倍率 (周回ごと):
              </label>
              <input
                type="number"
                step="0.05"
                value={interestRate}
                onChange={e => setInterestRate(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg bg-black/60 border border-purple-900 text-white font-mono focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-white/40 mt-1 block">標準: 1.1倍 (端数切捨)</span>
            </div>

            <div>
              <label className="block text-white/60 mb-1">
                第1周基本利息:
              </label>
              <input
                type="number"
                value={baseInterest}
                onChange={e => setBaseInterest(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg bg-black/60 border border-purple-900 text-white font-mono focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-white/40 mt-1 block">標準: 100 G</span>
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-xs font-mono mb-1">
              管理者ノート / バージョンメモ:
            </label>
            <textarea
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              rows={2}
              className="w-full p-2.5 rounded-lg bg-black/60 border border-purple-900 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleSaveSettings}
              className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>設定をサーバーに保存</span>
            </button>

            <button
              onClick={handleResetMatches}
              className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>直近30戦の対戦記録を初期化</span>
            </button>
          </div>
        </div>

        {/* Future Admin Features Roadmap (今後実装していく管理者機能) */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900/90 to-purple-950/40 border border-purple-900/60 space-y-3">
          <div className="flex items-center gap-2 text-amber-300">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold font-serif">
              今後実装予定の管理者機能ロードマップ
            </h3>
          </div>
          <p className="text-xs text-white/70 font-sans leading-relaxed">
            要件「管理者機能は今後実装していく」に基づき、以下のモジュール拡張枠をシステム構成済です：
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
              <span className="text-purple-300 font-bold block mb-1">
                1. オリジナル怪異・伝承エディタ
              </span>
              <p className="text-white/50 text-[11px]">
                新怪異の追加、格（特級〜3級）や同盟費、伝承文のGUI動的登録機能。
              </p>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
              <span className="text-purple-300 font-bold block mb-1">
                2. 悪魔AIアルゴリズム重み付け調整
              </span>
              <p className="text-white/50 text-[11px]">
                バフォメット・ベルゼブブ・アスモデウスの勝率最適化パラメータの動的制御。
              </p>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
              <span className="text-purple-300 font-bold block mb-1">
                3. 魔王の天変地異イベントスケジューラ
              </span>
              <p className="text-white/50 text-[11px]">
                特定ラウンドでのオカルト日蝕、全員強制シャッフルなどのライブ発動。
              </p>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
              <span className="text-purple-300 font-bold block mb-1">
                4. リアルタイム観戦・チート防止監査ログ
              </span>
              <p className="text-white/50 text-[11px]">
                ゲーム進行中の不正ダイスチェックおよびリプレイ自動生成。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
