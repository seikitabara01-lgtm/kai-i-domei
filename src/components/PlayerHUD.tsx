import React from 'react';
import { PlayerState, GameLog, DeviceMode } from '../types';
import { Dices, Volume2, VolumeX, Shield, Skull, History, Settings, Github, Zap } from 'lucide-react';
import { calculateLapInterest } from '../data/gameData';

interface PlayerHUDProps {
  players: PlayerState[];
  activePlayerIndex: number;
  isRolling: boolean;
  canRoll: boolean;
  onRollDice: () => void;
  lastRoll: number | null;
  targetLaps: number;
  gameLogs: GameLog[];
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHistory: () => void;
  onOpenAdmin: () => void;
  onOpenGithub: () => void;
  deviceMode: DeviceMode;
}

export const PlayerHUD: React.FC<PlayerHUDProps> = ({
  players,
  activePlayerIndex,
  isRolling,
  canRoll,
  onRollDice,
  lastRoll,
  targetLaps,
  gameLogs,
  isMuted,
  onToggleMute,
  onOpenHistory,
  onOpenAdmin,
  onOpenGithub,
  deviceMode
}) => {
  const activePlayer = players[activePlayerIndex];
  const isHumanTurn = activePlayer?.isHuman;

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Top Header Strip: Game Controls & Utilities */}
      <div className="bg-slate-950/90 backdrop-blur-md rounded-xl border border-purple-900/60 p-2 sm:p-2.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-700 to-red-900 flex items-center justify-center text-white text-xs font-black shadow">
            呪
          </div>
          <div>
            <h1 className="text-sm font-serif font-black text-amber-100 tracking-wider">
              怪異同盟
            </h1>
            <span className="text-[10px] text-purple-300/70 font-mono hidden sm:inline">
              目標: {targetLaps}周到達 / 3体破産
            </span>
          </div>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-purple-950 border border-purple-900/50 text-purple-300 hover:text-white transition"
            title={isMuted ? '音声を有効化' : '音声をミュート'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={onOpenHistory}
            className="px-2 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-800 text-purple-200 text-xs font-mono flex items-center gap-1 transition"
            title="直近30戦の対戦記録 (サーバ管理)"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">直近30戦</span>
          </button>
          <button
            onClick={onOpenGithub}
            className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/20 text-white text-xs font-mono flex items-center gap-1 transition"
            title="GitHub連携"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden md:inline">GitHub</span>
          </button>
          <button
            onClick={onOpenAdmin}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-purple-950 border border-purple-900/50 text-purple-300 hover:text-white transition"
            title="管理者メニュー (/admin)"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Players Status Grid */}
      <div
        className={`grid gap-1.5 ${
          deviceMode === 'mobile' ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {players.map((p, idx) => {
          const isActive = idx === activePlayerIndex;
          const nextLapInterest = calculateLapInterest(p.laps + 1);

          return (
            <div
              key={p.id}
              className={`relative rounded-xl p-2.5 transition-all duration-200 border ${
                p.isBankrupt
                  ? 'bg-zinc-950/60 border-zinc-800 opacity-50'
                  : isActive
                  ? 'bg-slate-900/95 border-amber-400/90 shadow-lg shadow-purple-950/50 ring-1 ring-amber-400/50'
                  : 'bg-slate-950/80 border-purple-950 hover:border-purple-900'
              }`}
            >
              {/* Active Glow indicator */}
              {isActive && (
                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </div>
              )}

              {/* Player Header */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5 truncate">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-xs font-bold text-white truncate font-serif">
                    {p.name}
                  </span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    p.isHuman
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-red-950 text-red-300 border border-red-800'
                  }`}
                >
                  {p.isHuman ? '契約者' : '悪魔'}
                </span>
              </div>

              {/* Ghost Currency Balance */}
              <div className="flex items-baseline justify-between font-mono bg-black/40 px-2 py-1 rounded border border-white/5 mb-1.5">
                <span className="text-[10px] text-white/50">所持霊貨:</span>
                <span
                  className={`text-xs font-black ${
                    p.isBankrupt
                      ? 'text-red-500 line-through'
                      : p.ghosts < 2000
                      ? 'text-rose-400 animate-pulse'
                      : 'text-amber-300'
                  }`}
                >
                  {p.ghosts.toLocaleString()} G
                </span>
              </div>

              {/* Lap Progress & Interest Due */}
              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-white/70">
                <div>
                  <span className="text-white/40 block">周回:</span>
                  <span className="font-semibold text-purple-300">
                    {p.laps} / {targetLaps} 周
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block">次周利息:</span>
                  <span className="font-semibold text-rose-400">
                    -{nextLapInterest} G
                  </span>
                </div>
              </div>

              {/* Bankrupt or Alliance Count Tag */}
              <div className="mt-1.5 pt-1 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-white/40 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-purple-400" />
                  同盟怪異:
                </span>
                <span className="font-bold text-white font-mono">
                  {p.alliancesCount} 体
                </span>
              </div>

              {p.isBankrupt && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px] rounded-xl flex items-center justify-center text-rose-500 font-bold font-serif text-sm">
                  <Skull className="w-4 h-4 mr-1" />
                  破産消滅
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Primary Action Console: Dice Roll & Current Action */}
      <div className="bg-slate-950/90 backdrop-blur-md rounded-xl border border-purple-900/60 p-3 sm:p-4 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-black text-2xl sm:text-3xl shadow-2xl border-2 transition-transform duration-300 ${
              isRolling
                ? 'animate-spin bg-purple-900 border-amber-400 text-amber-300 scale-105'
                : lastRoll
                ? 'bg-gradient-to-br from-purple-950 to-indigo-950 border-purple-500 text-white'
                : 'bg-black/60 border-purple-900/60 text-purple-400'
            }`}
          >
            {isRolling ? (
              <Dices className="w-8 h-8 animate-pulse text-amber-300" />
            ) : lastRoll ? (
              <span>{lastRoll}</span>
            ) : (
              <Dices className="w-7 h-7 text-white/40" />
            )}
            <span className="text-[9px] font-mono text-white/50 tracking-tighter uppercase">
              {isRolling ? '霊数抽選' : '出目'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isHumanTurn
                  ? '【あなたのターン】行動を選択してください'
                  : `【${activePlayer?.name}の思考】`}
              </span>
            </div>
            <p className="text-xs text-white/70 mt-0.5 max-w-sm sm:max-w-md font-sans">
              {isHumanTurn
                ? canRoll
                  ? 'サイコロを振って盤上を進み、怪異との同盟またはバトルに挑みましょう。'
                  : '停止マスの指示に従って選択を行ってください。'
                : `${activePlayer?.name}は自身の利益を最大化するべく盤面を計算中…`}
            </p>
          </div>
        </div>

        {/* Big Roll Button */}
        <div>
          {isHumanTurn && canRoll ? (
            <button
              onClick={onRollDice}
              disabled={isRolling}
              className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl font-serif font-black text-sm sm:text-base text-white bg-gradient-to-r from-red-700 via-purple-700 to-indigo-600 hover:from-red-600 hover:via-purple-600 hover:to-indigo-500 active:scale-95 shadow-xl shadow-purple-950/80 border border-amber-400/50 flex items-center gap-2 cursor-pointer transition"
            >
              <Dices className="w-5 h-5 animate-bounce" />
              <span>サイコロを振る</span>
            </button>
          ) : (
            <div className="px-4 py-2 bg-slate-900/80 rounded-xl border border-white/10 text-white/40 text-xs font-mono text-center">
              {isRolling ? '出目確定中…' : isHumanTurn ? '選択待ち' : 'AI思考中'}
            </div>
          )}
        </div>
      </div>

      {/* Live Ritual Log Console (Scrollable) */}
      <div className="bg-slate-950/90 backdrop-blur-md rounded-xl border border-purple-900/60 p-2.5 sm:p-3 flex-1 overflow-hidden flex flex-col shadow-xl min-h-[100px] max-h-[160px] sm:max-h-[180px]">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 text-[11px] font-mono text-purple-300">
          <span className="flex items-center gap-1 font-bold">
            📜 冥界の儀式実況ログ
          </span>
          <span className="text-white/40 text-[10px]">
            リアルタイム更新
          </span>
        </div>
        <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 text-xs font-sans">
          {gameLogs.slice(-15).reverse().map(log => (
            <div
              key={log.id}
              className="p-1.5 rounded bg-black/40 border border-white/5 flex items-start gap-2 leading-relaxed"
            >
              <span className="text-[10px] font-mono text-purple-400 flex-shrink-0 pt-0.5">
                [{log.timestamp}]
              </span>
              <span className={log.color || 'text-slate-200'}>{log.text}</span>
            </div>
          ))}
          {gameLogs.length === 0 && (
            <p className="text-white/40 text-center py-2 text-xs font-mono">
              儀式開始を待機中...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
