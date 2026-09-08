import React from 'react';
import { OccultCard } from '../types';
import { Sparkles, Skull, Flame } from 'lucide-react';

interface AICardNoticeProps {
  playerName: string;
  card: OccultCard;
  is100PercentUnlucky?: boolean;
  reason?: string;
  onClose?: () => void;
}

export const AICardNotice: React.FC<AICardNoticeProps> = ({
  playerName,
  card,
  is100PercentUnlucky,
  reason
}) => {
  const isLucky = card.type === 'lucky';

  const getReasonText = () => {
    if (reason === 'invasion' || is100PercentUnlucky) {
      return '【領域侵犯】他者領域の迎撃バトルで呪縛カード発動！';
    }
    if (reason === 'battle') {
      return '【怪異挑戦】怪異とのバトルで運命カード発動！';
    }
    return '【呪物収蔵庫】深淵よりオカルトカード召喚！';
  };

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-bounce duration-300">
      <div
        className={`rounded-2xl p-4 border-2 shadow-2xl backdrop-blur-xl ${
          isLucky
            ? 'bg-gradient-to-r from-purple-950/95 via-indigo-950/95 to-slate-950/95 border-purple-400 shadow-purple-900/60 text-purple-100'
            : 'bg-gradient-to-r from-red-950/95 via-zinc-950/95 to-black/95 border-red-500 shadow-red-900/70 text-red-100'
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
          <div className="flex items-center gap-2">
            {isLucky ? (
              <Sparkles className="w-5 h-5 text-amber-300" />
            ) : (
              <Skull className="w-5 h-5 text-red-400" />
            )}
            <span className="text-xs font-black uppercase tracking-wider">
              {playerName} の運命開示
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-mono">
            {getReasonText()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
              isLucky
                ? 'bg-purple-800/80 text-amber-300'
                : 'bg-red-900/80 text-red-300'
            }`}
          >
            {isLucky ? <Flame className="w-6 h-6 animate-pulse" /> : <Skull className="w-6 h-6 animate-pulse" />}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-white truncate font-serif">
              {card.title}
            </h4>
            <p className="text-xs text-white/70 line-clamp-1">{card.description}</p>
          </div>

          <div className="text-right shrink-0">
            <span
              className={`text-lg font-black font-mono block ${
                isLucky ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isLucky ? `+${card.effectValue.toLocaleString()}` : `-${card.effectValue.toLocaleString()}`} G
            </span>
            <span className="text-[10px] opacity-75">霊貨変動</span>
          </div>
        </div>
      </div>
    </div>
  );
};
