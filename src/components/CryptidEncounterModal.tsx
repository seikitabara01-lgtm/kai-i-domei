import React from 'react';
import { Cryptid, PlayerState } from '../types';
import { ShieldAlert, Handshake, Swords, AlertTriangle } from 'lucide-react';

interface CryptidEncounterModalProps {
  cryptid: Cryptid;
  player: PlayerState;
  onAlliance: () => void;
  onBattle: () => void;
}

export const CryptidEncounterModal: React.FC<CryptidEncounterModalProps> = ({
  cryptid,
  player,
  onAlliance,
  onBattle
}) => {
  const canAfford = player.ghosts >= cryptid.allianceCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl p-6 border-2 border-purple-500/80 bg-gradient-to-b from-slate-950 via-purple-950/90 to-black shadow-2xl shadow-purple-950/80">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-amber-300 uppercase">
              【未契約怪異と遭遇】行動を選択してください
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
            <p className="text-xs text-purple-300 font-mono mt-0.5">呪縛能力: {cryptid.curseType}</p>
            <p className="text-[11px] text-white/70 line-clamp-2 mt-1 leading-snug">{cryptid.description}</p>
          </div>
        </div>

        {/* Cost & Income Details */}
        <div className="grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-xl border border-white/5 mb-5 font-mono text-xs">
          <div className="flex flex-col">
            <span className="text-white/60">契約費用 (魔王へ納入):</span>
            <span className="text-base font-black text-amber-400">
              {cryptid.allianceCost.toLocaleString()} G
            </span>
            <span className="text-[10px] text-white/40">あなたの所持: {player.ghosts.toLocaleString()} G</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/60">他者侵入時の貢納金:</span>
            <span className="text-base font-black text-emerald-400">
              +{cryptid.baseTribute.toLocaleString()} G
            </span>
            <span className="text-[10px] text-white/40">不運100%迎撃バトル発生</span>
          </div>
        </div>

        {/* Action Choices */}
        <div className="space-y-3">
          {/* 1: Alliance */}
          <button
            id="encounter-alliance-btn"
            onClick={onAlliance}
            disabled={!canAfford}
            className={`w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-between text-white shadow-lg transition duration-200 active:scale-95 ${
              canAfford
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 cursor-pointer border border-purple-400/40'
                : 'bg-zinc-800 text-white/40 cursor-not-allowed border border-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-purple-300" />
              <div className="text-left">
                <div className="text-sm">① 同盟を結ぶ (怪異を支配下に置く)</div>
                <div className="text-[10px] text-purple-200/80 font-normal">契約料を支払い、このマスを自領地にする</div>
              </div>
            </div>
            <span className="text-xs font-mono font-black shrink-0">{cryptid.allianceCost} G</span>
          </button>

          {!canAfford && (
            <p className="text-[11px] text-rose-400 flex items-center gap-1 pl-1 font-mono">
              <AlertTriangle className="w-3.5 h-3.5" /> 所持霊貨が不足しているため同盟は結べません
            </p>
          )}

          {/* 2: Battle */}
          <button
            id="encounter-battle-btn"
            onClick={onBattle}
            className="w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-between text-white shadow-lg transition duration-200 active:scale-95 bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 cursor-pointer border border-red-500/40"
          >
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-rose-300" />
              <div className="text-left">
                <div className="text-sm">② 怪異とバトル (オカルトカード召喚)</div>
                <div className="text-[10px] text-red-200/80 font-normal">運命のタロットを引き、加護または呪縛を受ける</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-black/40 px-2 py-0.5 rounded text-amber-300 shrink-0">
              運試し
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
