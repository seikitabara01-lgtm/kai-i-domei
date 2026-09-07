import React, { useEffect, useState } from 'react';
import { ServerMatchRecord } from '../types';
import { History, RefreshCw, Trophy, Skull, Calendar, X, ShieldCheck } from 'lucide-react';

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({ isOpen, onClose }) => {
  const [matches, setMatches] = useState<ServerMatchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/matches');
      if (!res.ok) throw new Error('サーバーからの対戦履歴取得に失敗しました');
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '取得エラー');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMatches();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-purple-900/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-700/50 text-purple-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-black text-amber-100 flex items-center gap-2">
                直近30戦の対戦記録
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  サーバ管理
                </span>
              </h2>
              <p className="text-[11px] text-white/60 font-mono">
                全対戦データはバックエンドサーバで永続管理（端末クッキー・保存なし）
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMatches}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition disabled:opacity-50"
              title="履歴を再取得"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Server storage notice banner */}
        <div className="px-4 py-2 bg-purple-950/40 border-b border-purple-900/40 text-[11px] text-purple-300 font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            プライバシー保護規定に基づき、Cookieや端末ストレージは一切使用せず、サーバー側APIから最新30件を照会しています。
          </span>
        </div>

        {/* Match List Table / Cards */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {isLoading && matches.length === 0 ? (
            <div className="text-center py-12 text-white/50 font-mono text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
              サーバーから最新の対戦記録を照会中...
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-mono text-center">
              {error}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12 text-white/40 font-mono text-xs">
              まだ記録された対戦がありません。ゲームを完了すると自動保存されます。
            </div>
          ) : (
            <div className="space-y-2.5">
              {matches.map((match, idx) => {
                const dateStr = new Date(match.timestamp).toLocaleString('ja-JP', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={match.id || idx}
                    className={`p-3.5 rounded-xl border transition-all duration-200 ${
                      match.isPlayerWinner
                        ? 'bg-slate-900/80 border-amber-500/40 hover:border-amber-500/70'
                        : 'bg-black/50 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {match.isPlayerWinner ? (
                          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Trophy className="w-3.5 h-3.5" />
                            勝利 ({match.playerRank}位)
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                            <Skull className="w-3.5 h-3.5" />
                            敗北 ({match.playerRank}位)
                          </span>
                        )}
                        <span className="text-sm font-bold text-white font-serif">
                          {match.playerName}
                        </span>
                        <span className="text-xs text-white/50 font-mono">
                          ({match.playerCharacter})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-white/40 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            match.difficulty === 'beginner'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : match.difficulty === 'intermediate'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-red-950 text-red-300 border border-red-800'
                          }`}
                        >
                          {match.difficulty === 'beginner'
                            ? '初級'
                            : match.difficulty === 'intermediate'
                            ? '中級'
                            : '上級'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-black/40 p-2.5 rounded-lg border border-white/5">
                      <div>
                        <span className="text-white/40 block text-[10px]">勝者:</span>
                        <span className="font-bold text-amber-200 truncate block">
                          {match.winnerName}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px]">最終霊貨:</span>
                        <span className="font-bold text-emerald-400">
                          {match.playerFinalGhosts.toLocaleString()} G
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px]">周回数 / 生存:</span>
                        <span className="font-bold text-purple-300">
                          {match.targetLaps}周設定 ({match.roundsCount}R)
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px]">締結同盟:</span>
                        <span className="font-bold text-cyan-300">
                          {match.alliancesCount} 体
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-white/50">
          <span>表示件数: 最新 {matches.length} / 30 件</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-purple-900 hover:bg-purple-800 text-white transition cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
