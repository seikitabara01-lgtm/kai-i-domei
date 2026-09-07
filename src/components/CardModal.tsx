import React from 'react';
import { OccultCard } from '../types';
import { Sparkles, Skull, Flame, ArrowRight } from 'lucide-react';

interface CardModalProps {
  card: OccultCard;
  onConfirm: () => void;
  is100PercentUnlucky?: boolean;
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  onConfirm,
  is100PercentUnlucky
}) => {
  const isLucky = card.type === 'lucky';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Occult Magic Circle Backdrop FX */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[500px] h-[500px] rounded-full border-4 border-dashed border-purple-500 animate-spin duration-10000" />
        <div className="absolute w-[400px] h-[400px] rounded-full border-2 border-red-500 animate-spin duration-7000" />
      </div>

      {/* Cinematic Tarot / Occult Card */}
      <div
        className={`relative w-full max-w-sm sm:max-w-md rounded-2xl p-6 sm:p-7 border-2 shadow-2xl transition-all duration-300 ${
          isLucky
            ? 'bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 border-purple-500/70 shadow-purple-900/50'
            : 'bg-gradient-to-b from-rose-950 via-zinc-950 to-red-950 border-red-600/70 shadow-red-900/60'
        }`}
      >
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            {isLucky ? (
              <Sparkles className="w-5 h-5 text-amber-300" />
            ) : (
              <Skull className="w-5 h-5 text-red-400" />
            )}
            <span className="text-xs tracking-wider uppercase font-mono font-bold text-white/70">
              {is100PercentUnlucky
                ? '【領域侵犯・不運100%確定】'
                : isLucky
                ? '【幸運の託宣 (LUCKY)】'
                : '【厄災の呪縛 (UNLUCKY)】'}
            </span>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-serif font-bold ${
              isLucky
                ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50'
                : 'bg-red-900/60 text-red-200 border border-red-500/50'
            }`}
          >
            {card.category}
          </span>
        </div>

        {/* Card Artwork / Emblem */}
        <div className="flex flex-col items-center justify-center my-4 py-6 bg-black/40 rounded-xl border border-white/5 relative overflow-hidden">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 shadow-inner ${
              isLucky
                ? 'bg-gradient-to-tr from-purple-800 to-amber-500/40 text-amber-300'
                : 'bg-gradient-to-tr from-red-900 to-rose-600/40 text-red-300'
            }`}
          >
            {isLucky ? (
              <Flame className="w-10 h-10 animate-pulse text-amber-300" />
            ) : (
              <Skull className="w-10 h-10 text-red-400 animate-pulse" />
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-black text-white text-center px-4 tracking-wide">
            {card.title}
          </h3>
          <p className="text-xs text-white/60 font-mono mt-1">怪異の導き: {card.cryptidName}</p>
        </div>

        {/* Card Body & Description */}
        <div className="space-y-3 text-sm text-slate-200 bg-black/30 p-3.5 rounded-lg border border-white/5 mb-5">
          <p className="leading-relaxed">{card.description}</p>
          <p className="text-xs italic font-serif text-white/50 border-l-2 border-white/20 pl-2">
            {card.fluffQuote}
          </p>
        </div>

        {/* Effect Value Display */}
        <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg mb-5 border border-white/10 font-mono">
          <span className="text-xs text-white/70">霊貨【ゴースト】変動:</span>
          <span
            className={`text-lg font-black tracking-wider ${
              isLucky ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isLucky ? `+${card.effectValue.toLocaleString()}` : `-${card.effectValue.toLocaleString()}`} G
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onConfirm}
          className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg transition duration-200 active:scale-95 ${
            isLucky
              ? 'bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500'
              : 'bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500'
          }`}
        >
          <span>運命を受け入れる</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
