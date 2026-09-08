import React, { useState, useEffect } from 'react';
import { OccultCard, PlayerState } from '../types';
import { Sparkles, Skull, Flame, ArrowRight, ShieldAlert, Eye, Zap, User } from 'lucide-react';

interface CardModalProps {
  card: OccultCard;
  player: PlayerState;
  is100PercentUnlucky?: boolean;
  reason?: string; // 'relic' | 'invasion' | 'battle'
  resultInfo?: {
    prevGhosts: number;
    newGhosts: number;
    difference: number;
    extraNote?: string;
  };
  onConfirm: () => void;
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  player,
  is100PercentUnlucky,
  reason,
  resultInfo,
  onConfirm
}) => {
  const isLucky = card.type === 'lucky';
  const [isFlipped, setIsFlipped] = useState(false);
  const isHuman = player.isHuman;
  const [countdown, setCountdown] = useState(isHuman ? 0 : 4);

  // Trigger card flip animation after brief anticipation buildup
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer for AI turns so player can read result and game auto-advances
  useEffect(() => {
    if (isHuman) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onConfirm();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isHuman, onConfirm]);

  const getReasonBadge = () => {
    if (reason === 'invasion' || is100PercentUnlucky) {
      return {
        label: '【領域侵犯・迎撃バトル】不運100%確定！',
        desc: `${player.name} は他プレイヤーの怪異領域に踏み込み、不運の呪縛カードが強制発動！`,
        icon: ShieldAlert,
        color: 'text-rose-400 bg-rose-950/90 border-rose-600'
      };
    }
    if (reason === 'battle') {
      return {
        label: '【怪異挑戦バトル】運命タロット判定！',
        desc: `${player.name} が怪異にバトルを挑み、オカルトカードを召喚！`,
        icon: Zap,
        color: 'text-amber-300 bg-amber-950/90 border-amber-600'
      };
    }
    return {
      label: '【呪物収蔵庫】深淵の託宣！',
      desc: `${player.name} は呪物マスに着地し、禁断のオカルトカードを開示！`,
      icon: Eye,
      color: 'text-purple-300 bg-purple-950/90 border-purple-600'
    };
  };

  const reasonInfo = getReasonBadge();
  const ReasonIcon = reasonInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Occult Magic Circle Backdrop FX */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[540px] h-[540px] rounded-full border-4 border-dashed border-purple-500 animate-spin duration-10000" />
        <div className="absolute w-[400px] h-[400px] rounded-full border-2 border-red-500 animate-spin duration-7000" />
      </div>

      <div className="relative w-full max-w-sm sm:max-w-md flex flex-col items-center">
        {/* Draw Context Notification Header */}
        <div className={`w-full mb-3 px-4 py-2.5 rounded-xl border flex items-center gap-2.5 shadow-lg ${reasonInfo.color} animate-pulse`}>
          <ReasonIcon className="w-5 h-5 shrink-0" />
          <div className="text-left flex-1 min-w-0">
            <div className="text-xs font-black uppercase tracking-wider">{reasonInfo.label}</div>
            <div className="text-[11px] opacity-90 truncate">{reasonInfo.desc}</div>
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
            <div className="w-full rounded-2xl p-7 border-2 border-purple-500/80 bg-gradient-to-b from-purple-950 via-slate-950 to-black shadow-2xl [backface-visibility:hidden] flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-24 h-24 rounded-full border-4 border-purple-500/40 flex items-center justify-center mb-4 animate-pulse">
                <Skull className="w-12 h-12 text-purple-400" />
              </div>
              <p className="text-sm font-serif font-black text-purple-200 tracking-widest uppercase">
                運命の託宣を開示中…
              </p>
              <p className="text-xs text-purple-400/70 mt-1">深淵のカードが回転します</p>
            </div>

            {/* Card Front Face (Revealed with flip) */}
            <div
              className={`w-full rounded-2xl p-5 sm:p-6 border-2 shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                isLucky
                  ? 'bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 border-purple-500/90 shadow-purple-900/60'
                  : 'bg-gradient-to-b from-rose-950 via-zinc-950 to-red-950 border-red-600/90 shadow-red-900/70'
              }`}
            >
              {/* Header Ribbon with Player Name */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="text-xs font-serif font-bold text-amber-200">
                    {player.name}
                  </span>
                  <span className="text-[10px] text-white/50">
                    ({player.isHuman ? '契約者' : '悪魔'})
                  </span>
                </div>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-serif font-bold ${
                    isLucky
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
                      : 'bg-red-900/80 text-red-200 border border-red-500/60'
                  }`}
                >
                  {is100PercentUnlucky
                    ? '💀 不運100%'
                    : isLucky
                    ? '✨ 幸運 (LUCKY)'
                    : '💀 厄災 (UNLUCKY)'}
                </span>
              </div>

              {/* Card Artwork / Emblem */}
              <div className="flex flex-col items-center justify-center my-2 py-3 bg-black/50 rounded-xl border border-white/10 relative overflow-hidden">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-1.5 shadow-inner ${
                    isLucky
                      ? 'bg-gradient-to-tr from-purple-800 to-amber-500/40 text-amber-300'
                      : 'bg-gradient-to-tr from-red-900 to-rose-600/40 text-red-300'
                  }`}
                >
                  {isLucky ? (
                    <Flame className="w-7 h-7 animate-pulse text-amber-300" />
                  ) : (
                    <Skull className="w-7 h-7 text-red-400 animate-pulse" />
                  )}
                </div>
                <h3 className="text-xl font-serif font-black text-white text-center px-3 tracking-wide">
                  {card.title}
                </h3>
                <p className="text-[11px] text-amber-300/80 font-mono mt-0.5">怪異の導き: {card.cryptidName}</p>
              </div>

              {/* Card Description & Flavor Quote */}
              <div className="space-y-1.5 text-xs text-slate-200 bg-black/40 p-2.5 rounded-lg border border-white/5 mb-3 font-sans">
                <p className="leading-relaxed font-semibold">{card.description}</p>
                <p className="text-[10px] italic font-serif text-white/50 border-l-2 border-white/20 pl-2">
                  {card.fluffQuote}
                </p>
              </div>

              {/* Explicit Clear Outcome / Result Breakdown */}
              {resultInfo ? (
                <div className="bg-black/70 p-3 rounded-xl border border-white/15 mb-4 font-mono text-xs space-y-1">
                  <div className="flex items-center justify-between text-white/70">
                    <span>霊貨変動:</span>
                    <span
                      className={`font-black text-sm ${
                        resultInfo.difference >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {resultInfo.difference >= 0
                        ? `+${resultInfo.difference.toLocaleString()}`
                        : `${resultInfo.difference.toLocaleString()}`}{' '}
                      G
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-bold pt-1.5 border-t border-white/10 text-white">
                    <span>所持霊貨:</span>
                    <span className="text-amber-300">
                      {resultInfo.prevGhosts.toLocaleString()} G ➔{' '}
                      {resultInfo.newGhosts.toLocaleString()} G
                    </span>
                  </div>
                  {resultInfo.extraNote && (
                    <p className="text-[10px] text-purple-300 pt-1 border-t border-white/5">
                      {resultInfo.extraNote}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-black/60 rounded-lg mb-4 border border-white/15 font-mono">
                  <span className="text-xs font-bold text-white/80">霊貨【ゴースト】変動:</span>
                  <span
                    className={`text-xl font-black tracking-wider ${
                      isLucky ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isLucky ? `+${card.effectValue.toLocaleString()}` : `-${card.effectValue.toLocaleString()}`} G
                  </span>
                </div>
              )}

              {/* Action Button */}
              <button
                id="card-confirm-button"
                onClick={onConfirm}
                className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg transition duration-200 active:scale-95 cursor-pointer text-sm ${
                  isLucky
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500'
                    : 'bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500'
                }`}
              >
                <span>
                  {isHuman
                    ? '結果を受け入れ、次の手番へ進む'
                    : `結果を確認して次へ ${countdown > 0 ? `(${countdown}s)` : ''}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
