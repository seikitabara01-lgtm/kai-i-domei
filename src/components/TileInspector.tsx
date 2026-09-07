import React from 'react';
import { BoardTile, PlayerState } from '../types';
import { Shield, Swords, DollarSign, Crown, MapPin, AlertTriangle, Sparkles } from 'lucide-react';

interface TileInspectorProps {
  tile: BoardTile;
  activePlayer: PlayerState;
  players: PlayerState[];
  isHumanTurn: boolean;
  isLandedOn: boolean;
  onFormAlliance: () => void;
  onBattleCryptid: () => void;
  onPassSpecialTile?: () => void;
}

export const TileInspector: React.FC<TileInspectorProps> = ({
  tile,
  activePlayer,
  players,
  isHumanTurn,
  isLandedOn,
  onFormAlliance,
  onBattleCryptid,
  onPassSpecialTile
}) => {
  const cryptid = tile.cryptid;
  const owner = players.find(p => p.id === tile.ownerId);
  const isOwner = tile.ownerId === activePlayer.id;
  const hasOtherOwner = tile.ownerId !== null && !isOwner;
  const canAffordAlliance = cryptid ? activePlayer.ghosts >= cryptid.allianceCost : false;

  return (
    <div className="bg-slate-950/90 backdrop-blur-md rounded-xl border border-purple-900/60 p-3 sm:p-4 text-white shadow-xl flex flex-col justify-between h-full overflow-y-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-purple-300 font-mono">
            <MapPin className="w-3.5 h-3.5 text-purple-400" />
            <span>マス #{tile.index}</span>
            <span className="text-white/40">|</span>
            <span className="text-amber-400 uppercase font-semibold">
              {tile.type === 'start'
                ? '魔王の祭壇'
                : tile.type === 'cryptid'
                ? '怪異の棲処'
                : tile.type === 'occult_rift'
                ? '異界の特異点'
                : tile.type === 'blood_tax'
                ? '血税の祭壇'
                : '呪物収蔵庫'}
            </span>
          </div>
          {cryptid && (
            <span
              className={`text-xs px-2 py-0.5 rounded font-black tracking-wider ${
                cryptid.grade === '特級'
                  ? 'bg-purple-900/80 text-purple-200 border border-purple-400'
                  : cryptid.grade === '1級'
                  ? 'bg-rose-900/80 text-rose-200 border border-rose-500'
                  : 'bg-amber-950/80 text-amber-200 border border-amber-500'
              }`}
            >
              {cryptid.grade}
            </span>
          )}
        </div>

        {/* Tile Title & Origin */}
        <div className="flex items-start gap-3 my-2">
          {cryptid ? (
            <div className="text-3xl p-2 rounded-xl bg-purple-950/70 border border-purple-700/50 flex-shrink-0 shadow-inner">
              {cryptid.avatarIcon}
            </div>
          ) : (
            <div className="text-3xl p-2 rounded-xl bg-red-950/70 border border-red-700/50 flex-shrink-0 shadow-inner">
              👑
            </div>
          )}
          <div>
            <h3 className="text-lg sm:text-xl font-serif font-black text-amber-100 tracking-wide">
              {tile.name}
            </h3>
            {cryptid ? (
              <p className="text-xs text-white/60 font-mono">
                伝承地: {cryptid.country} ({cryptid.nameEn})
              </p>
            ) : (
              <p className="text-xs text-red-300/80 font-mono">{tile.nameSub}</p>
            )}
          </div>
        </div>

        {/* Cryptid Lore & Stats */}
        {cryptid && (
          <div className="space-y-2 mt-3 text-xs">
            <p className="text-slate-300 leading-relaxed bg-black/40 p-2.5 rounded border border-white/5 font-sans">
              {cryptid.description}
            </p>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="bg-white/5 p-2 rounded border border-white/5">
                <span className="text-white/50 block">同盟締結費 (魔王納入):</span>
                <span className="text-amber-400 font-bold text-sm">
                  {cryptid.allianceCost.toLocaleString()} G
                </span>
              </div>
              <div className="bg-white/5 p-2 rounded border border-white/5">
                <span className="text-white/50 block">基本貢納 (進入時):</span>
                <span className="text-rose-400 font-bold text-sm">
                  {cryptid.baseTribute.toLocaleString()} G
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Current Alliance Owner Badge */}
        <div className="mt-3 pt-2 border-t border-white/10 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white/60">同盟契約状況:</span>
            {owner ? (
              <span
                className="flex items-center gap-1 font-bold px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: owner.color + '40', border: `1px solid ${owner.color}` }}
              >
                <Crown className="w-3.5 h-3.5" />
                {owner.name} ({owner.isHuman ? '契約者' : '悪魔'})
              </span>
            ) : (
              <span className="text-emerald-400 font-bold">未契約 (自由領域)</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons (Enabled when human player has landed on this tile) */}
      <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
        {isHumanTurn && isLandedOn ? (
          <>
            {/* Case A: Unallied Cryptid -> Option 1: Alliance, Option 2: Battle */}
            {tile.type === 'cryptid' && !tile.ownerId && (
              <div className="space-y-2">
                <div className="text-[11px] text-amber-300/90 font-mono flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  選択: 同盟を締結するか、バトルを挑むか決めてください
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={onFormAlliance}
                    disabled={!canAffordAlliance}
                    className={`p-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      canAffordAlliance
                        ? 'bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white shadow-lg cursor-pointer'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>① 同盟締結 ({cryptid?.allianceCost} G)</span>
                  </button>
                  <button
                    onClick={onBattleCryptid}
                    className="p-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-800 to-rose-700 hover:from-red-700 hover:to-rose-600 text-white shadow-lg transition cursor-pointer"
                  >
                    <Swords className="w-4 h-4" />
                    <span>② 怪異とバトル (運命カード)</span>
                  </button>
                </div>
                {!canAffordAlliance && (
                  <p className="text-[10px] text-red-400 font-mono text-center">
                    ※ 所持ゴースト不足のため、怪異とバトル（運命カード）のみ可能です
                  </p>
                )}
              </div>
            )}

            {/* Case B: Allied by Another Player -> Option 3: Battle (100% unlucky cards) */}
            {tile.type === 'cryptid' && hasOtherOwner && (
              <div className="space-y-2">
                <div className="p-2 rounded bg-red-950/80 border border-red-600/70 text-red-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>
                    【他プレイヤー領域侵犯】{owner?.name} の同盟領域に侵入しました！
                    怪異との迎撃バトルが発生します（不運100%カード）。
                  </span>
                </div>
                <button
                  onClick={onBattleCryptid}
                  className="w-full p-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white shadow-lg transition animate-pulse cursor-pointer"
                >
                  <Swords className="w-4 h-4" />
                  <span>③ 領域迎撃バトルを敢行 (不運系100%カード)</span>
                </button>
              </div>
            )}

            {/* Case C: Own Allied Tile -> Safe passage */}
            {tile.type === 'cryptid' && isOwner && (
              <div className="p-2.5 rounded bg-purple-950/70 border border-purple-700/60 text-center">
                <p className="text-xs text-purple-200 font-semibold">
                  あなたの盟友怪異の領域です。穏やかに霊力を保全しました。
                </p>
                <button
                  onClick={onPassSpecialTile}
                  className="mt-2 w-full py-1.5 px-3 bg-purple-800 hover:bg-purple-700 text-white text-xs rounded transition"
                >
                  ターン終了
                </button>
              </div>
            )}

            {/* Case D: Special Tiles */}
            {tile.type !== 'cryptid' && (
              <div className="space-y-2">
                <p className="text-xs text-amber-200/90 text-center">
                  特殊イベントマスに停止しました。
                </p>
                <button
                  onClick={onPassSpecialTile}
                  className="w-full py-2 px-3 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded transition"
                >
                  儀式を終えて進む
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-2 text-xs text-white/40 font-mono">
            {isHumanTurn
              ? 'サイコロを振ってマスに移動してください'
              : 'AI悪魔が自身の勝利のために思考・行動中...'}
          </div>
        )}
      </div>
    </div>
  );
};
