import React, { useState } from 'react';
import { PlayerState, GameSettings } from '../types';
import { Play, LogOut, Shield, Flame, RotateCcw, AlertTriangle, X } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  players: PlayerState[];
  settings: GameSettings;
  roundsCount: number;
  onResume: () => void;
  onQuit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  players,
  settings,
  roundsCount,
  onResume,
  onQuit
}) => {
  const [confirmQuit, setConfirmQuit] = useState(false);

  if (!isOpen) return null;

  const humanPlayer = players.find(p => p.isHuman) || players[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-950 border-2 border-purple-800/90 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden text-white space-y-4">
        {/* Occult background visual decoration */}
        <div className="absolute -top-24 -right-24 w-52 h-52 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-700 flex items-center justify-center text-purple-300">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-purple-400 block">
                ◆ 儀式一時中断 (PAUSED) ◆
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-black text-amber-100">
                時の封印
              </h2>
            </div>
          </div>
          <button
            onClick={onResume}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
            title="再開"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Ritual Status Card */}
        <div className="bg-black/50 rounded-2xl p-3.5 border border-purple-950/80 space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center text-white/60 pb-1.5 border-b border-white/5">
            <span>進行中の儀式ステータス</span>
            <span className="text-purple-300 font-bold">第{roundsCount}巡目</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-white/40 block text-[10px]">契約者名:</span>
              <span className="font-serif font-bold text-amber-300 truncate block">
                {humanPlayer.name}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-white/40 block text-[10px]">所持霊貨:</span>
              <span className="font-bold text-amber-400 block">
                {humanPlayer.ghosts.toLocaleString()} G
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-white/40 block text-[10px]">周回数:</span>
              <span className="font-bold text-purple-300 block">
                {humanPlayer.laps} / {settings.targetLaps} 周
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-white/40 block text-[10px]">同盟怪異数:</span>
              <span className="font-bold text-emerald-400 block flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {humanPlayer.alliancesCount} 体
              </span>
            </div>
          </div>
        </div>

        {/* Action Selection: 再開 vs 終了 */}
        {!confirmQuit ? (
          <div className="space-y-2.5 pt-1">
            {/* 再開 (Resume) */}
            <button
              onClick={onResume}
              className="w-full py-3.5 px-4 rounded-xl font-serif font-black text-sm text-white bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:via-indigo-500 hover:to-purple-700 shadow-xl shadow-purple-950/80 border border-amber-400/50 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>儀式を再開する (再開)</span>
            </button>

            {/* 終了 (Quit confirmation) */}
            <button
              onClick={() => setConfirmQuit(true)}
              className="w-full py-3 px-4 rounded-xl font-serif font-bold text-xs text-rose-300 hover:text-white bg-slate-900/90 hover:bg-rose-950/60 border border-rose-900/50 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>儀式を破棄してタイトルに戻る (終了)</span>
            </button>
          </div>
        ) : (
          /* Confirm Quit Dialog */
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-900/80 space-y-3">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>本当に儀式を終了しますか？</span>
            </div>
            <p className="text-[11px] text-white/70 font-sans leading-relaxed">
              現在進行中の契約と盤面は破棄され、最初からやり直すことになります。
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setConfirmQuit(false)}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-mono text-white transition cursor-pointer"
              >
                キャンセル
              </button>
              <button
                onClick={onQuit}
                className="py-2.5 px-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-serif font-black text-xs shadow-lg transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>終了して戻る</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
