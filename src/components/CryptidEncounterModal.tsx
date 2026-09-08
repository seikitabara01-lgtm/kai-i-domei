import React from 'react';
import { Cryptid, PlayerState } from '../types';
import { ShieldAlert, Handshake, Swords, Footprints, AlertTriangle } from 'lucide-react';

interface CryptidEncounterModalProps {
  cryptid: Cryptid;
  player: PlayerState;
  onAlliance: () => void;
  onBattle: () => void;
  onPass: () => void;
}

export const CryptidEncounterModal: React.FC<CryptidEncounterModalProps> = ({
  cryptid,
  player,
  onAlliance,
  onBattle,
  onPass
}) => {
  const canAfford = player.ghosts >= cryptid.allianceCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl p-6 border-2 border-purple-500/80 bg-gradient-to-b from-slate-950 via-purple-950/90 to-black shadow-2xl shadow-purple-950/80">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-mono font-bold tracking-wider text-amber-300 uppercase">
              【未契約怪異と遭遇】
            </span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-serif font-black bg-purple-900/60 text-purple-200 border border-purple-500/50">
            {cryptid.grade}
          </span>
        </div>

        {/* Cryptid Profile */}
        <div className="flex items-center gap-4 bg-black/50 p-4 rounded-xl border border-white/10 mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0"
            style={{ backgroundColor: `${cryptid.themeColor}33`, borderColor: cryptid.themeColor, borderWidth: 1 }}
          >
            {cryptid.avatarIcon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold font-serif text-white truncate">{cryptid.name}</h3>
              <span className="text-[10px] text-white/50 font-mono">({cryptid.country})</span>
            </div>
            <p className="text-xs text-purple-300 font-mono mt-0.5">呪縛: {cryptid.curseType}</p>
            <p className="text-[11px] text-white/70 line-clamp-2 mt-1 leading-snug">{cryptid.description}</p>
          </div>
        </div>

        {/* Cost & Income Details */}
        <div className="grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-xl border border-white/5 mb-5 font-mono text-xs">
          <div className="flex flex-col">
            <span className="text-white/60">契約費用 (魔王へ支払):</span>
            <span className="text-base font-black text-amber-400">
              {cryptid.allianceCost.toLocaleString()} G
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/60">他者侵入時の貢納金:</span>
            <span className="text-base font-black text-emerald-400">
              +{cryptid.baseTribute.toLocaleString()} G
            </span>
          </div>
        </div>

        {/* Action Choices */}
        <div className="space-y-2.5">
          {/* 1: Alliance */}
          <button
            id="encounter-alliance-btn"
            onClick={onAlliance}
            disabled={!canAfford}
            className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-between text-white shadow-lg transition duration-200 active:scale-95 ${
              canAfford
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 cursor-pointer'
                : 'bg-zinc-800 text-white/40 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-purple-300" />
              <span>① 同盟を結ぶ (契約料支払い)</span>
            </div>
            <span className="text-xs font-mono font-black">{cryptid.allianceCost} G</span>
          </button>

          {!canAfford && (
            <p className="text-[11px] text-rose-400 flex items-center gap-1 pl-1">
              <AlertTriangle className="w-3.5 h-3.5" /> 所持霊貨が不足しているため契約できません
            </p>
          )}

          {/* 2: Battle */}
          <button
            id="encounter-battle-btn"
            onClick={onBattle}
            className="w-full py-3 px-4 rounded-xl font-bold flex items-center justify-between text-white shadow-lg transition duration-200 active:scale-95 bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-rose-300" />
              <span>② バトルを挑む (運命カード召喚)</span>
            </div>
            <span className="text-xs font-mono opacity-80">運試し</span>
          </button>

          {/* 3: Pass */}
          <button
            id="encounter-pass-btn"
            onClick={onPass}
            className="w-full py-2 px-4 rounded-xl font-medium flex items-center justify-center gap-1.5 text-white/60 hover:text-white hover:bg-white/5 transition duration-200 text-xs cursor-pointer"
          >
            <Footprints className="w-4 h-4" />
            <span>何もしないで立ち去る (ターン終了)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
