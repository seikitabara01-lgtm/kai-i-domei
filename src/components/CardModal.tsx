import React, { useState, useEffect } from 'react';
import { OccultCard } from '../types';
import { Sparkles, Skull, Flame, ArrowRight, ShieldAlert, Eye, Zap } from 'lucide-react';

interface CardModalProps {
  card: OccultCard;
  onConfirm: () => void;
  is100PercentUnlucky?: boolean;
  reason?: string; // Cause of drawing: 'relic' | 'invasion' | 'battle' | etc.
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  onConfirm,
  is100PercentUnlucky,
  reason
}) => {
  const isLucky = card.type === 'lucky';
  const [isFlipped, setIsFlipped] = useState(false);

  // Trigger card flip after brief buildup
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const getReasonBadge = () => {
    if (reason === 'invasion' || is100PercentUnlucky) {
      return {
        label: '領域侵犯・迎撃バトル (不運100%確定)',
        desc: '他プレイヤーの怪異領域に踏み込んだため、呪縛カードが強制発動！',
        icon: ShieldAlert,
        color: 'text-rose-400 bg-rose-950/80 border-rose-600'
      };
    }
    if (reason === 'battle') {
      return {
        label: '怪異挑戦バトル (運命判定)',
        desc: '未契約怪異との戦闘により、オカルトカードの効果が判定されます！',
        icon: Zap,
        color: 'text-amber-300 bg-amber-950/80 border-amber-600'
      };
    }
    return {
      label: '呪物収蔵庫 (深淵の託宣)',
      desc: '呪物マスに着地し、禁断のオカルトカードを引き当てました！',
      icon: Eye,
      color: 'text-purple-300 bg-purple-950/80 border-purple-600'
    };
  };

  const reasonInfo = getReasonBadge();
  const ReasonIcon = reasonInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Occult Magic Circle Backdrop FX */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
        <div className="w-[520px] h-[520px] rounded-full border-4 border-dashed border-purple-500 animate-spin duration-10000" />
        <div className="absolute w-[380px] h-[380px] rounded-full border-2 border-red-500 animate-spin duration-7000" />
      </div>

      <div className="relative w-full max-w-sm sm:max-w-md flex flex-col items-center">
        {/* Draw Context Notification Header */}
        <div className={`w-full mb-3 px-4 py-2.5 rounded-xl border flex items-center gap-2.5 shadow-lg ${reasonInfo.color} animate-pulse`}>
          <ReasonIcon className="w-5 h-5 shrink-0" />
          <div className="text-left flex-1 min-w-0">
            <div className="text-xs font-black uppercase tracking-wider">{reasonInfo.label}</div>
            <div className="text-[11px] opacity-80 truncate">{reasonInfo.desc}</div>
          </div>
        </div>

        {/* 3D Card Flip Perspective Container */}
        <div className="w-full [perspective:1000px]">
          <div
            className={`relative w-full rounded-2xl transition-transform duration-700 [transform-style:preserve-3d] ${
              isFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
            }`}
          >
            {/* Card Back Face (Shown before flipping) */}
            <div className="w-full rounded-2xl p-7 border-2 border-purple-500/80 bg-gradient-to-b from-purple-950 via-slate-950 to-black shadow-2xl [backface-visibility:hidden] flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-24 h-24 rounded-full border-4 border-purple-500/40 flex items-center justify-center mb-4 animate-pulse">
                <Skull className="w-12 h-12 text-purple-400" />
              </div>
              <p className="text-sm font-serif font-black text-purple-200 tracking-widest uppercase">
                運命の託宣を開示中…
              </p>
              <p className="text-xs text-purple-400/70 mt-1">タロットカードが回転します</p>
            </div>

            {/* Card Front Face (Revealed with flip) */}
            <div
              className={`w-full rounded-2xl p-5 sm:p-6 border-2 shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                isLucky
                  ? 'bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 border-purple-500/80 shadow-purple-900/60'
                  : 'bg-gradient-to-b from-rose-950 via-zinc-950 to-red-950 border-red-600/80 shadow-red-900/70'
              }`}
            >
              {/* Header Ribbon */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
                <div className="flex items-center gap-1.5">
                  {isLucky ? (
                    <Sparkles className="w-5 h-5 text-amber-300 animate-bounce" />
                  ) : (
                    <Skull className="w-5 h-5 text-red-400 animate-pulse" />
                  )}
                  <span className="text-xs tracking-wider uppercase font-mono font-bold text-white">
                    {is100PercentUnlucky
                      ? '【不運確定 100%】'
                      : isLucky
                      ? '【幸運の託宣 (LUCKY)】'
                      : '【厄災の呪縛 (UNLUCKY)】'}
                  </span>
                </div>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-serif font-bold ${
                    isLucky
                      ? 'bg-purple-900/80 text-purple-200 border border-purple-500/60'
                      : 'bg-red-900/80 text-red-200 border border-red-500/60'
                  }`}
                >
                  {card.category}
                </span>
              </div>

              {/* Card Artwork / Emblem */}
              <div className="flex flex-col items-center justify-center my-3 py-4 bg-black/50 rounded-xl border border-white/10 relative overflow-hidden">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 shadow-inner ${
                    isLucky
                      ? 'bg-gradient-to-tr from-purple-800 to-amber-500/40 text-amber-300'
                      : 'bg-gradient-to-tr from-red-900 to-rose-600/40 text-red-300'
                  }`}
                >
                  {isLucky ? (
                    <Flame className="w-8 h-8 animate-pulse text-amber-300" />
                  ) : (
                    <Skull className="w-8 h-8 text-red-400 animate-pulse" />
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-white text-center px-3 tracking-wide">
                  {card.title}
                </h3>
                <p className="text-xs text-amber-300/80 font-mono mt-0.5">怪異の導き: {card.cryptidName}</p>
              </div>

              {/* Card Body & Description */}
              <div className="space-y-2 text-xs sm:text-sm text-slate-200 bg-black/40 p-3 rounded-lg border border-white/5 mb-4">
                <p className="leading-relaxed">{card.description}</p>
                <p className="text-[11px] italic font-serif text-white/50 border-l-2 border-white/20 pl-2">
                  {card.fluffQuote}
                </p>
              </div>

              {/* Effect Value Highlight */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-black/60 rounded-lg mb-4 border border-white/15 font-mono">
                <span className="text-xs font-bold text-white/80">霊貨【ゴースト】変動:</span>
                <span
                  className={`text-xl sm:text-2xl font-black tracking-wider ${
                    isLucky ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  }`}
                >
                  {isLucky ? `+${card.effectValue.toLocaleString()}` : `-${card.effectValue.toLocaleString()}`} G
                </span>
              </div>

              {/* Action Button */}
              <button
                id="card-confirm-button"
                onClick={onConfirm}
                className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg transition duration-200 active:scale-95 cursor-pointer ${
                  isLucky
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500'
                    : 'bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500'
                }`}
              >
                <span>運命を受け入れる (効果適用)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
