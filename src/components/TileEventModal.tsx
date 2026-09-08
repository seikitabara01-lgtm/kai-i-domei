import React, { useEffect, useState } from 'react';
import { PlayerState } from '../types';
import { Crown, Droplets, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

interface TileEventModalProps {
  player: PlayerState;
  eventType: 'start' | 'blood_tax' | 'safe_cryptid' | 'rift';
  details: {
    title: string;
    description: string;
    amount?: number;
    prevGhosts?: number;
    newGhosts?: number;
  };
  onConfirm: () => void;
  isHuman: boolean;
}

export const TileEventModal: React.FC<TileEventModalProps> = ({
  player,
  eventType,
  details,
  onConfirm,
  isHuman
}) => {
  const [countdown, setCountdown] = useState(isHuman ? 0 : 3);

  // Auto-advance timer for AI players
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

  const getEventVisual = () => {
    switch (eventType) {
      case 'blood_tax':
        return {
          icon: Droplets,
          border: 'border-rose-600',
          badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-600',
          glow: 'shadow-rose-950/80',
          accent: 'text-rose-400'
        };
      case 'start':
        return {
          icon: Crown,
          border: 'border-amber-500',
          badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500',
          glow: 'shadow-amber-950/80',
          accent: 'text-amber-400'
        };
      case 'safe_cryptid':
        return {
          icon: ShieldCheck,
          border: 'border-purple-500',
          badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-500',
          glow: 'shadow-purple-950/80',
          accent: 'text-purple-300'
        };
      case 'rift':
      default:
        return {
          icon: Zap,
          border: 'border-indigo-500',
          badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-500',
          glow: 'shadow-indigo-950/80',
          accent: 'text-indigo-400'
        };
    }
  };

  const visual = getEventVisual();
  const IconComponent = visual.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-md rounded-2xl p-6 border-2 bg-gradient-to-b from-slate-950 via-purple-950/90 to-black shadow-2xl ${visual.border} ${visual.glow}`}
      >
        {/* Header Tag */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <IconComponent className={`w-5 h-5 ${visual.accent} animate-pulse`} />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-white">
              【{player.name} のイベント発生】
            </span>
          </div>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${visual.badgeBg}`}>
            {player.isHuman ? '契約者' : '悪魔'}
          </span>
        </div>

        {/* Event Main Banner */}
        <div className="text-center py-4 bg-black/50 rounded-xl border border-white/10 mb-4">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-white/5 border border-white/10 mb-3 shadow-inner">
            <IconComponent className={`w-8 h-8 ${visual.accent}`} />
          </div>
          <h3 className="text-xl font-serif font-black text-white px-2 tracking-wide">
            {details.title}
          </h3>
          <p className="text-xs text-white/70 mt-1.5 px-4 leading-relaxed font-sans">
            {details.description}
          </p>
        </div>

        {/* Currency Result if applicable */}
        {details.prevGhosts !== undefined && details.newGhosts !== undefined && (
          <div className="bg-black/60 p-3.5 rounded-xl border border-white/10 mb-5 font-mono text-xs">
            <div className="flex items-center justify-between text-white/60 mb-1">
              <span>霊貨変動:</span>
              <span className={`font-black text-sm ${details.amount && details.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {details.amount && details.amount > 0 ? `+${details.amount.toLocaleString()}` : `${details.amount?.toLocaleString()}`} G
              </span>
            </div>
            <div className="flex items-center justify-between font-bold pt-2 border-t border-white/10 text-white">
              <span>所持霊貨:</span>
              <span className="text-amber-300 text-sm">
                {details.prevGhosts.toLocaleString()} G ➔ {details.newGhosts.toLocaleString()} G
              </span>
            </div>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={onConfirm}
          className="w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 active:scale-95 transition cursor-pointer text-sm"
        >
          <span>
            {isHuman ? '確認して次の手番へ' : `確認して次へ ${countdown > 0 ? `(${countdown}s)` : ''}`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
