import React, { useState } from 'react';
import { GameSettings, GameDifficulty, PlayerCharacter } from '../types';
import { PLAYER_CHARACTERS, AI_DEMONS } from '../data/gameData';
import { Skull, Shield, Sparkles, Flame, Check, ArrowRight, BookOpen, Volume2, VolumeX } from 'lucide-react';

interface GameSetupProps {
  onStartGame: (settings: GameSettings) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHistory: () => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({
  onStartGame,
  isMuted,
  onToggleMute,
  onOpenHistory
}) => {
  const [nickname, setNickname] = useState('契約者レオン');
  const [selectedCharId, setSelectedCharId] = useState<string>(PLAYER_CHARACTERS[0].id);
  const [targetLaps, setTargetLaps] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('intermediate');

  const selectedChar = PLAYER_CHARACTERS.find(c => c.id === selectedCharId) || PLAYER_CHARACTERS[0];

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    onStartGame({
      playerNickname: nickname.trim(),
      playerCharacterId: selectedCharId,
      targetLaps,
      difficulty
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      {/* Occult background visual elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-600 blur-[128px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-red-600 blur-[128px]" />
      </div>

      <div className="w-full max-w-4xl relative z-10 space-y-5 my-auto">
        {/* Game Title & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-mono tracking-widest uppercase">
            <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            3D OCCULT MONOPOLY
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-purple-200 to-red-200 drop-shadow-lg">
            怪異同盟
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80 font-serif max-w-xl mx-auto leading-relaxed">
            世界各国の怪異と同盟を結び、己の命を担保に魔王から借りた霊貨で生き残れ。
          </p>
        </div>

        {/* Demon King Contract Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-900/90 to-purple-950/70 border border-red-900/70 shadow-xl space-y-2 text-xs">
          <div className="flex items-center gap-2 text-red-400 font-bold font-serif">
            <Skull className="w-4 h-4 text-red-500" />
            <span>【魔王バンカーとの命の借財契約】</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300 font-mono text-[11px]">
            <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
              <span className="text-white/50 block">初期借入資金:</span>
              <span className="text-amber-400 font-black text-sm">10,000 ゴースト (G)</span>
            </div>
            <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
              <span className="text-white/50 block">周回利息の掟:</span>
              <span className="text-rose-400 font-semibold text-xs">
                1周後: 100 G / 2周後: 110 G / 3周後: 121 G (1.1倍・切捨)
              </span>
            </div>
            <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
              <span className="text-white/50 block">終局・破産条件:</span>
              <span className="text-purple-300 font-semibold text-xs">
                規定周回到達 または 3名破産で終了
              </span>
            </div>
          </div>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleStart} className="space-y-5">
          {/* Nickname & Laps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-purple-950/80 space-y-2 shadow-lg">
              <label className="block text-xs font-bold text-purple-300 font-mono">
                ① プレイヤー・契約者名 (ニックネーム)
              </label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                maxLength={14}
                required
                className="w-full p-2.5 rounded-xl bg-black/60 border border-purple-900/80 text-white font-serif font-bold text-sm focus:outline-none focus:border-amber-400 transition"
                placeholder="契約者名を入力..."
              />
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-purple-950/80 space-y-2 shadow-lg">
              <label className="block text-xs font-bold text-purple-300 font-mono">
                ② 規定周回数の選択 (GOマス通過数)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map(laps => (
                  <button
                    key={laps}
                    type="button"
                    onClick={() => setTargetLaps(laps)}
                    className={`py-2 px-3 rounded-xl font-bold font-mono text-xs transition ${
                      targetLaps === laps
                        ? 'bg-purple-700 text-white border border-amber-400 shadow-md scale-102'
                        : 'bg-black/40 text-white/70 border border-white/10 hover:bg-white/5'
                    }`}
                  >
                    {laps}周
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty Level (初級、中級、上級) */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-purple-950/80 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-purple-300 font-mono">
                ③ 儀式難易度 (運命カードの幸運率設定)
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Beginner */}
              <button
                type="button"
                onClick={() => setDifficulty('beginner')}
                className={`p-3 rounded-xl text-left border transition ${
                  difficulty === 'beginner'
                    ? 'bg-emerald-950/80 border-emerald-500 ring-1 ring-emerald-500 shadow-lg'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-300 font-serif">初級 (Beginner)</span>
                  {difficulty === 'beginner' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-white/70">
                  プレイヤーに大幅有利
                </p>
                <span className="inline-block mt-1 font-mono text-[10px] text-emerald-400 font-bold">
                  人間幸運80% / 各AI20%
                </span>
              </button>

              {/* Intermediate */}
              <button
                type="button"
                onClick={() => setDifficulty('intermediate')}
                className={`p-3 rounded-xl text-left border transition ${
                  difficulty === 'intermediate'
                    ? 'bg-amber-950/80 border-amber-500 ring-1 ring-amber-500 shadow-lg'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-amber-300 font-serif">中級 (Standard)</span>
                  {difficulty === 'intermediate' && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[11px] text-white/70">
                  プレイヤーに有利
                </p>
                <span className="inline-block mt-1 font-mono text-[10px] text-amber-400 font-bold">
                  人間幸運65% / 各AI35%
                </span>
              </button>

              {/* Advanced */}
              <button
                type="button"
                onClick={() => setDifficulty('advanced')}
                className={`p-3 rounded-xl text-left border transition ${
                  difficulty === 'advanced'
                    ? 'bg-rose-950/80 border-rose-500 ring-1 ring-rose-500 shadow-lg'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-rose-300 font-serif">上級 (Advanced)</span>
                  {difficulty === 'advanced' && <Check className="w-4 h-4 text-rose-400" />}
                </div>
                <p className="text-[11px] text-white/70">
                  互角の過酷な儀式
                </p>
                <span className="inline-block mt-1 font-mono text-[10px] text-rose-400 font-bold">
                  人間幸運50% / 各AI50%
                </span>
              </button>
            </div>
          </div>

          {/* 3D Character Selection for Human */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-purple-950/80 space-y-2.5 shadow-lg">
            <label className="block text-xs font-bold text-purple-300 font-mono">
              ④ 自分の立体キャラ選択
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PLAYER_CHARACTERS.map(char => {
                const isSelected = char.id === selectedCharId;
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => setSelectedCharId(char.id)}
                    className={`p-3 rounded-xl text-left border transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-950/80 border-amber-400 ring-1 ring-amber-400 shadow-lg scale-102'
                        : 'bg-black/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: char.color }}
                        />
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <span className="font-bold text-xs text-white block font-serif">
                        {char.name}
                      </span>
                      <span className="text-[10px] text-white/50 block font-mono">
                        {char.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/60 mt-2 line-clamp-2">
                      {char.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auto-selected 3 AI Opponents Display */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-white/60 font-bold">
                ⑤ 対戦相手: 自動選出された3体の世界悪魔 (個別勝利を目指す・結託禁止)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">AUTO-SELECTED</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
              {AI_DEMONS.map(demon => (
                <div
                  key={demon.id}
                  className="p-2.5 rounded-xl bg-black/50 border border-purple-900/40 flex items-center gap-2.5"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: demon.color }}
                  />
                  <div className="truncate">
                    <span className="font-bold text-white block truncate">{demon.name}</span>
                    <span className="text-[10px] text-purple-300/70 block truncate">
                      {demon.title} ({demon.origin})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Start Button & Utilities */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleMute}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-900 text-white transition flex items-center gap-1.5 text-xs font-mono"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                <span>{isMuted ? 'BGM OFF' : 'BGM ON'}</span>
              </button>
              <button
                type="button"
                onClick={onOpenHistory}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-900 text-purple-200 transition flex items-center gap-1.5 text-xs font-mono"
              >
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>直近30戦の記録</span>
              </button>
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl font-serif font-black text-base text-white bg-gradient-to-r from-red-700 via-purple-700 to-indigo-600 hover:from-red-600 hover:via-purple-600 hover:to-indigo-500 shadow-xl shadow-purple-950/80 border border-amber-400/50 flex items-center gap-2 active:scale-95 transition cursor-pointer"
            >
              <span>契約を結び、ゲーム開始</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
