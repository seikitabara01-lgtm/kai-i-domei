import React from 'react';
import { PlayerState, GameSettings } from '../types';
import { Trophy, Skull, RotateCcw, History, ArrowRight } from 'lucide-react';

interface GameOverModalProps {
  players: PlayerState[];
  settings: GameSettings;
  roundsCount: number;
  onRestart: () => void;
  onOpenHistory: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  players,
  settings,
  roundsCount,
  onRestart,
  onOpenHistory
}) => {
  // Sort players by surviving status, then by ghost balance
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.isBankrupt && !b.isBankrupt) return 1;
    if (!a.isBankrupt && b.isBankrupt) return -1;
    return b.ghosts - a.ghosts;
  });

  const winner = sortedPlayers[0];
  const humanPlayer = players.find(p => p.isHuman);
  const isHumanWinner = winner?.isHuman;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-950 border-2 border-purple-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white text-center space-y-5">
        {/* Occult Trophy / Skull emblem */}
        <div className="flex justify-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-2 ${
              isHumanWinner
                ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 border-amber-300 text-slate-950'
                : 'bg-gradient-to-tr from-red-900 to-rose-700 border-red-500 text-white'
            }`}
          >
            {isHumanWinner ? (
              <Trophy className="w-10 h-10 animate-bounce" />
            ) : (
              <Skull className="w-10 h-10 animate-pulse" />
            )}
          </div>
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-purple-400 block mb-1">
            ◆ 儀式終局 (RITUAL CONCLUDED) ◆
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-wide">
            {isHumanWinner ? '魔王の試練 突破・完全制覇！' : `${winner?.name} の勝利`}
          </h2>
          <p className="text-xs text-white/60 font-mono mt-1">
            {isHumanWinner
              ? 'あなたは莫大な霊貨を築き、魔王との命の契約を完遂しました。'
              : '冥界の悪魔が覇権を掌握しました。次回こそ怪異の力を束ね勝利を掴み取れ。'}
          </p>
        </div>

        {/* Leaderboard */}
        <div className="bg-black/50 rounded-2xl p-3 sm:p-4 border border-white/10 space-y-2 text-left">
          <div className="text-[11px] font-mono text-purple-300 pb-1 border-b border-white/10 flex justify-between">
            <span>順位 / 契約者</span>
            <span>最終霊貨 (ゴースト)</span>
          </div>
          {sortedPlayers.map((p, idx) => (
            <div
              key={p.id}
              className={`p-2 rounded-xl flex items-center justify-between text-xs font-mono border ${
                idx === 0
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 font-bold'
                  : p.isBankrupt
                  ? 'bg-red-950/20 border-red-900/30 text-zinc-500'
                  : 'bg-white/5 border-transparent text-white/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">#{idx + 1}</span>
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span className="font-serif truncate max-w-[130px] sm:max-w-[180px]">
                  {p.name} {p.isHuman && '(あなた)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {p.isBankrupt ? (
                  <span className="text-red-400 font-serif">破産消滅</span>
                ) : (
                  <span className="font-bold text-amber-400">
                    {p.ghosts.toLocaleString()} G
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Server storage notice */}
        <p className="text-[10px] text-emerald-400/80 font-mono">
          ✓ 本対戦結果はサーバーへ永続保存されました（端末Cookie・ローカルデータ不使用）
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={onOpenHistory}
            className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-800 text-purple-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <History className="w-4 h-4" />
            <span>直近30戦の記録</span>
          </button>
          <button
            onClick={onRestart}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white text-xs font-serif font-black flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>新しい儀式を始める</span>
          </button>
        </div>
      </div>
    </div>
  );
};
