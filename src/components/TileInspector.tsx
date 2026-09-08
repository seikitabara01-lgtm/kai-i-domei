import React from 'react';
import { BoardTile, PlayerState } from '../types';
import { Shield, Swords, Crown, MapPin, AlertTriangle, Sparkles, Info } from 'lucide-react';

interface TileInspectorProps {
  tile: BoardTile;
  activePlayer: PlayerState;
  players: PlayerState[];
  isHumanTurn: boolean;
  isLandedOn: boolean;
  onFormAlliance: () => void;
  onBattleCryptid: () => void;
}

export const TileInspector: React.FC<TileInspectorProps> = ({
  tile,
  activePlayer,
  players,
  isHumanTurn,
  isLandedOn,
  onFormAlliance,
  onBattleCryptid
}) => {
  const cryptid = tile.cryptid;
  const owner = players.find(p => p.id === tile.ownerId);
  const isOwner = tile.ownerId === activePlayer?.id;
  const hasOtherOwner = tile.ownerId !== null && !isOwner;
  const canAffordAlliance = cryptid && activePlayer ? activePlayer.ghosts >= cryptid.allianceCost : false;

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
              {tile.type === 'start' ? '👑' : tile.type === 'blood_tax' ? '🩸' : tile.type === 'occult_rift' ? '🌀' : '🔮'}
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
                  +{cryptid.baseTribute.toLocaleString()} G
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

      {/* Information / Action Status Panel */}
      <div className="mt-4 pt-3 border-t border-white/10">
        {tile.type === 'cryptid' && !tile.ownerId && (
          <div className="p-2.5 rounded-lg bg-purple-950/60 border border-purple-800/60 text-xs text-purple-200">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              未契約の怪異領域
            </div>
            <p className="text-[11px] text-white/70">
              このマスに着地すると、「①同盟を結ぶ」か「②怪異とバトル」を選択できます。
            </p>
          </div>
        )}

        {tile.type === 'cryptid' && hasOtherOwner && (
          <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs text-rose-200">
            <div className="flex items-center gap-1.5 font-bold text-rose-300 mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              敵対プレイヤー同盟領域
            </div>
            <p className="text-[11px] text-white/70">
              他プレイヤーが着地した場合、同盟主への貢納金支払いと不運100%の迎撃バトルが発生します。
            </p>
          </div>
        )}

        {tile.type === 'cryptid' && isOwner && (
          <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-200">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300 mb-1">
              <Shield className="w-4 h-4 text-emerald-400" />
              あなたの盟友領域
            </div>
            <p className="text-[11px] text-white/70">
              あなたが着地しても安全に通過でき、他者が侵入した際には貢納金を受け取れます。
            </p>
          </div>
        )}

        {tile.type !== 'cryptid' && (
          <div className="p-2.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
              <Info className="w-4 h-4 text-amber-400" />
              特殊儀式マス
            </div>
            <p className="text-[11px] text-white/70">
              {tile.type === 'start'
                ? '魔王の祭壇。周回完了時の通過・停止で利息納付が行われます。'
                : tile.type === 'blood_tax'
                ? '血税の生贄台。停止時に所持霊貨の5%を魔王へ強制献上します。'
                : tile.type === 'occult_rift'
                ? '異界の特異点。時空を歪めて前方のマスへワープします。'
                : '呪物収蔵庫。停止時に深淵のオカルトカードを召喚します。'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
