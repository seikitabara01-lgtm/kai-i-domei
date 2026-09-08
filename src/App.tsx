import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BoardTile,
  PlayerState,
  GameSettings,
  GameLog,
  OccultCard,
  DeviceMode
} from './types';
import {
  INITIAL_BOARD,
  PLAYER_CHARACTERS,
  AI_DEMONS,
  OCCULT_CARDS_LUCKY,
  OCCULT_CARDS_UNLUCKY,
  calculateLapInterest
} from './data/gameData';
import { useDeviceMode } from './hooks/useDeviceMode';
import { Board3D } from './components/Board3D';
import { PlayerHUD } from './components/PlayerHUD';
import { TileInspector } from './components/TileInspector';
import { CardModal } from './components/CardModal';
import { CryptidEncounterModal } from './components/CryptidEncounterModal';
import { TileEventModal } from './components/TileEventModal';
import { GameSetup } from './components/GameSetup';
import { GameOverModal } from './components/GameOverModal';
import { MatchHistoryModal } from './components/MatchHistoryModal';
import { PauseModal } from './components/PauseModal';
import { AdminPanel } from './components/AdminPanel';
import { GitHubIntegrationModal } from './components/GitHubIntegrationModal';
import { occultAudio } from './utils/occultAudio';
import { Cryptid } from './types';

export default function App() {
  const { deviceMode } = useDeviceMode();

  // Navigation State (/admin vs game)
  const [currentRoute, setCurrentRoute] = useState<'game' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/admin' || window.location.hash === '#admin') {
        return 'admin';
      }
    }
    return 'game';
  });

  // Game Lifecycle States
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    targetLaps: 5,
    difficulty: 'intermediate',
    playerNickname: '契約者レオン',
    playerCharacterId: 'onmyoji'
  });

  // Board and Players State
  const [board, setBoard] = useState<BoardTile[]>(INITIAL_BOARD);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);

  // Turn Flow States
  const [isRolling, setIsRolling] = useState(false);
  const [canRoll, setCanRoll] = useState(true);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [roundsCount, setRoundsCount] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Encounter modal for human player landing on unowned cryptid
  const [encounterCryptid, setEncounterCryptid] = useState<Cryptid | null>(null);

  // Dramatic Occult Fate Card Modal (Used for BOTH Human & AI)
  const [cardModalData, setCardModalData] = useState<{
    card: OccultCard;
    player: PlayerState;
    is100PercentUnlucky?: boolean;
    reason?: string;
    resultInfo?: {
      prevGhosts: number;
      newGhosts: number;
      difference: number;
      extraNote?: string;
    };
    onConfirm: () => void;
  } | null>(null);

  // Tile Event Modal (Start altar, Blood tax, Safe ally territory, Occult rift)
  const [tileEventModalData, setTileEventModalData] = useState<{
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
  } | null>(null);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGithubOpen, setIsGithubOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraView, setCameraView] = useState<'dynamic' | 'overview' | 'topdown'>('dynamic');

  // Logs
  const [gameLogs, setGameLogs] = useState<GameLog[]>([]);

  // Ref to track latest players state across asynchronous timeouts without stale closures
  const playersRef = useRef<PlayerState[]>([]);
  playersRef.current = players;

  // Active AI timer ref
  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback((text: string, type: GameLog['type'] = 'system', color?: string) => {
    const time = new Date().toLocaleTimeString('ja-JP', { hour12: false });
    setGameLogs(prev => [
      ...prev,
      {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: time,
        round: roundsCount,
        text,
        type,
        color
      }
    ]);
  }, [roundsCount]);

  // Audio Toggle
  const handleToggleMute = () => {
    const muted = occultAudio.toggleMute();
    setIsMuted(muted);
  };

  // Sync browser path with route state
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('game');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: 'game' | 'admin') => {
    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', route === 'admin' ? '/admin' : '/');
    }
  };

  // Start new game session
  const handleStartGame = (gameSettings: GameSettings) => {
    setSettings(gameSettings);
    const chosenChar = PLAYER_CHARACTERS.find(c => c.id === gameSettings.playerCharacterId) || PLAYER_CHARACTERS[0];

    // Initial 4 players: Human + 3 Demonic AI (Baphomet, Beelzebub, Asmodeus)
    const initialPlayers: PlayerState[] = [
      {
        id: 'player_human',
        isHuman: true,
        name: gameSettings.playerNickname,
        title: chosenChar.role,
        characterId: chosenChar.id,
        modelType: chosenChar.modelType,
        color: chosenChar.color,
        position: 0,
        ghosts: 10000, // Borrowed from Demon King on one's life!
        laps: 0,
        isBankrupt: false,
        alliancesCount: 0,
        debtAccumulated: 0
      },
      {
        id: 'ai_baphomet',
        isHuman: false,
        name: AI_DEMONS[0].name,
        title: AI_DEMONS[0].title,
        characterId: AI_DEMONS[0].id,
        modelType: AI_DEMONS[0].modelType,
        color: AI_DEMONS[0].color,
        position: 0,
        ghosts: 10000,
        laps: 0,
        isBankrupt: false,
        alliancesCount: 0,
        debtAccumulated: 0
      },
      {
        id: 'ai_beelzebub',
        isHuman: false,
        name: AI_DEMONS[1].name,
        title: AI_DEMONS[1].title,
        characterId: AI_DEMONS[1].id,
        modelType: AI_DEMONS[1].modelType,
        color: AI_DEMONS[1].color,
        position: 0,
        ghosts: 10000,
        laps: 0,
        isBankrupt: false,
        alliancesCount: 0,
        debtAccumulated: 0
      },
      {
        id: 'ai_asmodeus',
        isHuman: false,
        name: AI_DEMONS[2].name,
        title: AI_DEMONS[2].title,
        characterId: AI_DEMONS[2].id,
        modelType: AI_DEMONS[2].modelType,
        color: AI_DEMONS[2].color,
        position: 0,
        ghosts: 10000,
        laps: 0,
        isBankrupt: false,
        alliancesCount: 0,
        debtAccumulated: 0
      }
    ];

    // Reset board
    const cleanBoard = INITIAL_BOARD.map(t => ({ ...t, ownerId: null, allianceLevel: t.type === 'cryptid' ? 1 : 0 }));
    setBoard(cleanBoard);
    setPlayers(initialPlayers);
    setActivePlayerIndex(0);
    setSelectedTileIndex(0);
    setCanRoll(true);
    setIsRolling(false);
    setLastRoll(null);
    setRoundsCount(1);
    setIsGameOver(false);
    setIsPaused(false);
    setIsGameStarted(true);

    // Occult BGM start
    occultAudio.startOccultBGM();

    addLog(`◆ 魔王との血の契約成立。10,000ゴーストを借入し儀式を開始した。目標: ${gameSettings.targetLaps}周到達 ◆`, 'system', 'text-amber-300 font-bold');
    addLog(`対戦相手: 悪魔バフォメット、ベルゼブブ、アスモデウスが各自の野望のために参陣。`, 'system', 'text-purple-300');
  };

  // Check Game Over Condition
  const checkGameOverCondition = useCallback((currentPlayers: PlayerState[]): boolean => {
    // Condition 1: Target laps reached by any player
    const lapWinner = currentPlayers.find(p => p.laps >= settings.targetLaps && !p.isBankrupt);
    if (lapWinner) {
      return true;
    }

    // Condition 2: 3 players are bankrupt (only 1 survivor left)
    const survivors = currentPlayers.filter(p => !p.isBankrupt);
    if (survivors.length <= 1) {
      return true;
    }

    return false;
  }, [settings.targetLaps]);

  // Submit match result to server
  const submitMatchToServer = useCallback(async (finalPlayers: PlayerState[]) => {
    const sorted = [...finalPlayers].sort((a, b) => {
      if (a.isBankrupt && !b.isBankrupt) return 1;
      if (!a.isBankrupt && b.isBankrupt) return -1;
      return b.ghosts - a.ghosts;
    });

    const human = finalPlayers.find(p => p.isHuman);
    const winner = sorted[0];
    const playerRank = sorted.findIndex(p => p.isHuman) + 1;

    try {
      await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: settings.playerNickname,
          playerCharacter: human?.title || '陰陽師',
          difficulty: settings.difficulty,
          targetLaps: settings.targetLaps,
          winnerName: winner?.name || '不明',
          isPlayerWinner: winner?.isHuman || false,
          playerFinalGhosts: human?.ghosts || 0,
          playerRank: playerRank || 4,
          roundsCount,
          alliancesCount: human?.alliancesCount || 0,
          participants: finalPlayers.map(p => ({
            name: p.name,
            isHuman: p.isHuman,
            ghosts: p.ghosts,
            alliances: p.alliancesCount,
            isBankrupt: p.isBankrupt
          }))
        })
      });
    } catch (err) {
      console.error('Failed to post match to server:', err);
    }
  }, [settings, roundsCount]);

  // Finish game
  const triggerGameOver = useCallback((finalPlayers: PlayerState[]) => {
    setIsGameOver(true);
    // Stop Occult BGM immediately when game ends
    occultAudio.stopOccultBGM();

    submitMatchToServer(finalPlayers);
    const winner = [...finalPlayers].sort((a, b) => b.ghosts - a.ghosts)[0];
    addLog(`【儀式終了】勝者: ${winner?.name}！ 全記録はサーバーに保存されました。`, 'system', 'text-amber-400 font-black');
  }, [submitMatchToServer, addLog]);

  // Switch Turn to Next Living Player in strict sequential clockwise order
  const advanceToNextPlayer = useCallback((fromPlayerIndex: number, playersOverride?: PlayerState[]) => {
    // Dismiss active modals
    setCardModalData(null);
    setEncounterCryptid(null);
    setTileEventModalData(null);
    setIsRolling(false);

    const currentList = playersOverride || playersRef.current;

    // Check game over condition
    if (checkGameOverCondition(currentList)) {
      triggerGameOver(currentList);
      return;
    }

    // Strict sequential turn cycle: 0 -> 1 -> 2 -> 3 -> 0 ...
    let nextIdx = (fromPlayerIndex + 1) % currentList.length;
    let attempts = 0;
    while (currentList[nextIdx]?.isBankrupt && attempts < currentList.length) {
      nextIdx = (nextIdx + 1) % currentList.length;
      attempts++;
    }

    // If turn returns to human (nextIdx === 0), advance round count
    if (nextIdx === 0) {
      setRoundsCount(r => r + 1);
    }

    setActivePlayerIndex(nextIdx);
    setSelectedTileIndex(currentList[nextIdx].position);

    if (currentList[nextIdx].isHuman) {
      setCanRoll(true);
      addLog(`✨ あなたの手番です。サイコロを振ってください。`, 'system', 'text-amber-300 font-bold');
    } else {
      setCanRoll(false);
      addLog(`👿 ${currentList[nextIdx].name} の手番です。`, 'system');
    }
  }, [checkGameOverCondition, triggerGameOver, addLog]);

  // Compatibility alias
  const advanceFromPlayerIndex = advanceToNextPlayer;

  // Dice Roll Logic for Human
  const handleRollDice = () => {
    if (!canRoll || isRolling || isPaused || isGameOver) return;

    setIsRolling(true);
    setCanRoll(false);
    occultAudio.playDiceRoll();

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setLastRoll(roll);
      setIsRolling(false);
      addLog(`🎲 あなたがサイコロを振った: [${roll}]`, 'roll', 'text-amber-300 font-bold');

      executeMovement(0, roll);
    }, 850);
  };

  // Movement along the 36-tile board
  const executeMovement = (playerIdx: number, steps: number) => {
    const boardLen = board.length;

    setPlayers(prev => {
      const updated = [...prev];
      const p = { ...updated[playerIdx] };
      const oldPos = p.position;
      const newPos = (oldPos + steps) % boardLen;

      p.position = newPos;
      p.lastDiceRoll = steps;
      setSelectedTileIndex(newPos);

      // Check if player passed or landed on START (tile 0) -> Completed a lap
      const passedStart = (oldPos + steps) >= boardLen;
      if (passedStart) {
        p.laps += 1;
        const interestDue = calculateLapInterest(p.laps);
        p.ghosts -= interestDue;
        p.debtAccumulated += interestDue;
        occultAudio.playBellToll();

        addLog(
          `${p.name} が第${p.laps}周を完了！ 魔王へ利息【${interestDue.toLocaleString()} G】を納付。`,
          'interest',
          'text-rose-400 font-bold'
        );

        if (p.ghosts < 0) {
          p.isBankrupt = true;
          p.ghosts = 0;
          addLog(`💀 ${p.name} は魔王への周回利息を支払えず破産消滅した！`, 'bankruptcy', 'text-red-500 font-black');
        }
      }

      updated[playerIdx] = p;
      playersRef.current = updated;

      // Evaluate landing after piece movement
      setTimeout(() => {
        evaluateTileLanding(playerIdx, updated);
      }, 550);

      return updated;
    });
  };

  // Draw an Occult Card based on Difficulty and Cryptid Grade
  const drawFateCard = (isHuman: boolean, force100PercentUnlucky: boolean = false): OccultCard => {
    if (force100PercentUnlucky) {
      return OCCULT_CARDS_UNLUCKY[Math.floor(Math.random() * OCCULT_CARDS_UNLUCKY.length)];
    }

    let luckyProbability = 0.5;
    if (settings.difficulty === 'beginner') {
      luckyProbability = isHuman ? 0.8 : 0.2;
    } else if (settings.difficulty === 'intermediate') {
      luckyProbability = isHuman ? 0.65 : 0.35;
    } else {
      luckyProbability = 0.5;
    }

    const isLucky = Math.random() < luckyProbability;
    if (isLucky) {
      return OCCULT_CARDS_LUCKY[Math.floor(Math.random() * OCCULT_CARDS_LUCKY.length)];
    } else {
      return OCCULT_CARDS_UNLUCKY[Math.floor(Math.random() * OCCULT_CARDS_UNLUCKY.length)];
    }
  };

  // Trigger Dramatic Occult Fate Card Event for BOTH Human & AI
  const triggerCardEvent = (
    playerIdx: number,
    card: OccultCard,
    reason: 'relic' | 'invasion' | 'battle',
    is100PercentUnlucky: boolean,
    currentPlayers: PlayerState[],
    cryptidName?: string,
    ownerName?: string,
    tributePaid?: number
  ) => {
    const boardLen = board.length;
    const updated = [...currentPlayers];
    const p = { ...updated[playerIdx] };
    const prevGhosts = p.ghosts;

    let difference = 0;
    let extraNote = '';

    if (card.type === 'lucky') {
      if (card.category === 'plunder') {
        let totalStolen = 0;
        updated.forEach((other, oIdx) => {
          if (oIdx !== playerIdx && !other.isBankrupt) {
            const stealAmount = Math.min(other.ghosts, card.effectValue);
            other.ghosts -= stealAmount;
            totalStolen += stealAmount;
          }
        });
        p.ghosts += totalStolen;
        difference = totalStolen;
        extraNote = `全敵対者から合計 ${totalStolen.toLocaleString()} G を強奪しました！`;
        occultAudio.playCoin();
      } else if (card.category === 'teleport') {
        p.position = (p.position + card.effectValue) % boardLen;
        extraNote = `時空跳躍により盤上を ${card.effectValue} マス前進しました！`;
      } else {
        p.ghosts += card.effectValue;
        difference = card.effectValue;
        extraNote = `幸運の加護により霊貨 +${card.effectValue.toLocaleString()} G を獲得！`;
        occultAudio.playCoin();
      }
      addLog(`✨ 【幸運の託宣】${p.name} は『${card.title}』により霊貨+${card.effectValue.toLocaleString()} G！`, 'card', 'text-emerald-400 font-bold');
    } else {
      // Unlucky
      if (card.category === 'teleport') {
        p.position = (p.position + card.effectValue + boardLen) % boardLen;
        extraNote = `呪縛により盤上を ${Math.abs(card.effectValue)} マス後退しました…`;
      } else {
        p.ghosts -= card.effectValue;
        difference = -card.effectValue;
        extraNote = `厄災の呪縛により霊貨 -${card.effectValue.toLocaleString()} G の損害！`;
      }
      addLog(`💀 【厄災の呪縛】${p.name} は『${card.title}』により損害-${card.effectValue.toLocaleString()} G！`, 'card', 'text-rose-400 font-bold');

      if (p.ghosts < 0) {
        p.isBankrupt = true;
        p.ghosts = 0;
        addLog(`💀 ${p.name} は怪異の呪縛により全財産を喪失し破産消滅した！`, 'bankruptcy', 'text-red-500 font-black');
      }
    }

    if (tributePaid && ownerName) {
      difference -= tributePaid;
      extraNote += ` (同盟主 ${ownerName} への進入貢納金 ${tributePaid.toLocaleString()} G 含む)`;
    }

    updated[playerIdx] = p;
    setPlayers(updated);
    playersRef.current = updated;

    if (card.type === 'lucky') {
      occultAudio.playCardReveal();
    } else {
      occultAudio.playDamage();
    }

    setCardModalData({
      card,
      player: p,
      is100PercentUnlucky,
      reason,
      resultInfo: {
        prevGhosts,
        newGhosts: p.ghosts,
        difference,
        extraNote
      },
      onConfirm: () => {
        setCardModalData(null);
        advanceToNextPlayer(playerIdx, updated);
      }
    });
  };

  // Evaluate Landing on a tile
  const evaluateTileLanding = (playerIdx: number, playersSnapshot: PlayerState[]) => {
    const currentPlayers = [...playersSnapshot];
    const p = currentPlayers[playerIdx];
    if (!p || p.isBankrupt) {
      advanceToNextPlayer(playerIdx, currentPlayers);
      return;
    }

    const tile = board[p.position];
    if (!tile) {
      advanceToNextPlayer(playerIdx, currentPlayers);
      return;
    }

    if (tile.type === 'start') {
      addLog(`${p.name} は魔王の祭壇に立ち止まった。静寂が霊力を保全する。`, 'system');
      setTileEventModalData({
        player: p,
        eventType: 'start',
        details: {
          title: '魔王の祭壇に到達',
          description: `${p.name} は魔王の祭壇に立ち止まりました。厳かな静寂が霊力を保全します。`
        },
        onConfirm: () => {
          setTileEventModalData(null);
          advanceToNextPlayer(playerIdx, currentPlayers);
        },
        isHuman: p.isHuman
      });
    } else if (tile.type === 'occult_rift') {
      addLog(`🌀 異界の特異点！ ${p.name} は時空を歪曲し前方へ2マス跳躍！`, 'system', 'text-indigo-400');
      setTileEventModalData({
        player: p,
        eventType: 'rift',
        details: {
          title: '異界の特異点',
          description: `${p.name} は時空の歪みに遭遇！ 前方へ2マス跳躍します！`
        },
        onConfirm: () => {
          setTileEventModalData(null);
          executeMovement(playerIdx, 2);
        },
        isHuman: p.isHuman
      });
    } else if (tile.type === 'blood_tax') {
      const tax = Math.max(100, Math.floor(p.ghosts * 0.05));
      const prevGhosts = p.ghosts;
      p.ghosts = Math.max(0, p.ghosts - tax);
      occultAudio.playCoin();
      addLog(`🩸 血税の生贄台！ ${p.name} は魔王へ霊血税 ${tax.toLocaleString()} G を強制献上した。`, 'system', 'text-rose-400');
      currentPlayers[playerIdx] = p;
      setPlayers(currentPlayers);
      playersRef.current = currentPlayers;

      setTileEventModalData({
        player: p,
        eventType: 'blood_tax',
        details: {
          title: '血税の生贄台',
          description: `${p.name} は魔王への血税として所持霊貨の5%を強制献上しました。`,
          amount: -tax,
          prevGhosts,
          newGhosts: p.ghosts
        },
        onConfirm: () => {
          setTileEventModalData(null);
          advanceToNextPlayer(playerIdx, currentPlayers);
        },
        isHuman: p.isHuman
      });
    } else if (tile.type === 'curse_relic') {
      const card = drawFateCard(p.isHuman, false);
      triggerCardEvent(playerIdx, card, 'relic', false, currentPlayers);
    } else if (tile.type === 'cryptid') {
      const cryptid = tile.cryptid!;
      const isOwned = tile.ownerId !== null;
      const isOwner = tile.ownerId === p.id;
      const isOwnedByOther = isOwned && !isOwner;

      if (isOwnedByOther) {
        // Requirement: ③ 他のプレイヤーとの同盟が結成されている場合は、怪異とのバトル（カードを引き、カード内容に従う。不運系１００％）
        const owner = currentPlayers.find(pl => pl.id === tile.ownerId);
        const tribute = cryptid.baseTribute;
        p.ghosts -= tribute;
        if (owner) owner.ghosts += tribute;

        addLog(
          `⚔️ 領域侵犯！ ${p.name} は ${owner?.name} の盟友【${cryptid.name}】に侵入！ 貢納 ${tribute.toLocaleString()} G と不運100%迎撃バトル！`,
          'battle',
          'text-red-400 font-bold'
        );

        const card = drawFateCard(p.isHuman, true); // Force 100% unlucky card!
        triggerCardEvent(playerIdx, card, 'invasion', true, currentPlayers, cryptid.name, owner?.name, tribute);
      } else if (!isOwned) {
        // Unallied Cryptid -> Choice: ① Alliance or ② Battle
        if (p.isHuman) {
          addLog(`📜 未契約の怪異【${cryptid.name}】(${cryptid.grade}) と遭遇！ 行動を選択してください。`, 'system', 'text-amber-200');
          setEncounterCryptid(cryptid);
        } else {
          // AI decision logic:
          const canAfford = p.ghosts >= cryptid.allianceCost;
          const isFavorable = cryptid.allianceCost <= p.ghosts * 0.45 && p.ghosts > 1500;

          if (canAfford && isFavorable) {
            handleAIFormAlliance(playerIdx, tile.index, currentPlayers);
          } else {
            const card = drawFateCard(false, false);
            triggerCardEvent(playerIdx, card, 'battle', false, currentPlayers, cryptid.name);
          }
        }
      } else if (isOwner) {
        addLog(`${p.name} は自らの盟友怪異【${cryptid.name}】の領域で安息を得た。`, 'system', 'text-purple-300');
        setTileEventModalData({
          player: p,
          eventType: 'safe_cryptid',
          details: {
            title: `盟友怪異【${cryptid.name}】の領域`,
            description: `${p.name} は自らの盟友怪異の領域で安息を得て、穏やかに霊力を保全しました。`
          },
          onConfirm: () => {
            setTileEventModalData(null);
            advanceToNextPlayer(playerIdx, currentPlayers);
          },
          isHuman: p.isHuman
        });
      }
    }
  };

  // AI Alliance Formation
  const handleAIFormAlliance = (playerIdx: number, tileIdx: number, currentPlayers: PlayerState[]) => {
    const updated = [...currentPlayers];
    const p = updated[playerIdx];
    const tile = board[tileIdx];
    const cryptid = tile.cryptid!;

    p.ghosts -= cryptid.allianceCost;
    p.alliancesCount += 1;

    setBoard(prev => {
      const b = [...prev];
      b[tileIdx] = { ...tile, ownerId: p.id };
      return b;
    });

    occultAudio.playAllianceFormed();
    addLog(
      `🤝 【AI同盟締結】${p.name} は魔王に費用 ${cryptid.allianceCost.toLocaleString()} G を払い、怪異【${cryptid.name}】と契約！`,
      'alliance',
      'text-purple-400 font-bold'
    );

    setPlayers(updated);
    playersRef.current = updated;

    setTileEventModalData({
      player: p,
      eventType: 'safe_cryptid',
      details: {
        title: `${p.name} が怪異と同盟締結！`,
        description: `悪魔 ${p.name} は怪異【${cryptid.name}】(${cryptid.grade}) と同盟を締結し、領地を獲得しました！`,
        amount: -cryptid.allianceCost,
        prevGhosts: p.ghosts + cryptid.allianceCost,
        newGhosts: p.ghosts
      },
      onConfirm: () => {
        setTileEventModalData(null);
        advanceToNextPlayer(playerIdx, updated);
      },
      isHuman: false
    });
  };

  // Human Choice ①: Form Alliance
  const handleHumanFormAlliance = () => {
    setEncounterCryptid(null);
    const currentPlayers = [...playersRef.current];
    const human = currentPlayers[0];
    const tile = board[human.position];
    const cryptid = tile.cryptid;
    if (!cryptid || human.ghosts < cryptid.allianceCost) return;

    human.ghosts -= cryptid.allianceCost;
    human.alliancesCount += 1;

    setBoard(prev => {
      const b = [...prev];
      b[human.position] = { ...tile, ownerId: human.id };
      return b;
    });

    occultAudio.playAllianceFormed();
    addLog(
      `🤝 【同盟締結】契約者 ${human.name} は魔王へ ${cryptid.allianceCost.toLocaleString()} G を納付し、怪異【${cryptid.name}】と同盟成立！`,
      'alliance',
      'text-emerald-400 font-black'
    );

    currentPlayers[0] = human;
    setPlayers(currentPlayers);
    playersRef.current = currentPlayers;

    setTileEventModalData({
      player: human,
      eventType: 'safe_cryptid',
      details: {
        title: `怪異【${cryptid.name}】と同盟締結！`,
        description: `契約料 ${cryptid.allianceCost.toLocaleString()} G を魔王へ納入し、このマスをあなたの支配領域としました。他者が進入した際は基本貢納金 +${cryptid.baseTribute.toLocaleString()} G を獲得します！`,
        amount: -cryptid.allianceCost,
        prevGhosts: human.ghosts + cryptid.allianceCost,
        newGhosts: human.ghosts
      },
      onConfirm: () => {
        setTileEventModalData(null);
        advanceToNextPlayer(0, currentPlayers);
      },
      isHuman: true
    });
  };

  // Human Choice ②: Battle with Cryptid (Fate card)
  const handleHumanBattleCryptid = () => {
    setEncounterCryptid(null);
    const currentPlayers = playersRef.current;
    const human = currentPlayers[0];
    const tile = board[human.position];
    const cryptid = tile.cryptid;

    addLog(`⚔️ 契約者 ${human.name} は怪異【${cryptid?.name}】にバトルを挑んだ！`, 'battle');
    const card = drawFateCard(true, false);
    triggerCardEvent(0, card, 'battle', false, currentPlayers, cryptid?.name);
  };

  // Pause / Resume / Quit game flow handlers
  const handlePauseGame = () => {
    setIsPaused(true);
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
    addLog('⏸ 【儀式一時中断】時の刻みが停止しました。', 'system', 'text-amber-300 font-bold');
  };

  const handleResumeGame = () => {
    setIsPaused(false);
    addLog('▶ 【儀式再開】時の刻みが動き出しました。', 'system', 'text-purple-300 font-bold');
  };

  const handleQuitGame = () => {
    setIsPaused(false);
    setIsGameStarted(false);
    setIsGameOver(false);
    setEncounterCryptid(null);
    setCardModalData(null);
    setTileEventModalData(null);

    occultAudio.stopOccultBGM();

    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
    addLog('◆ 儀式を破棄し、初期契約画面へ回帰しました。', 'system', 'text-white/60');
  };

  // AI Turn Execution Effect - Orchestrates 4 players rolling in strict sequence
  useEffect(() => {
    if (!isGameStarted || isGameOver || isPaused) return;

    const currentList = playersRef.current;
    const activePlayer = currentList[activePlayerIndex];
    if (!activePlayer || activePlayer.isHuman || activePlayer.isBankrupt) {
      return;
    }

    // AI rolls dice after 1.1s
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);

    aiTimerRef.current = setTimeout(() => {
      setIsRolling(true);
      occultAudio.playDiceRoll();

      aiTimerRef.current = setTimeout(() => {
        const roll = Math.floor(Math.random() * 6) + 1;
        setLastRoll(roll);
        setIsRolling(false);
        addLog(`🎲 ${activePlayer.name} がサイコロを振った: [${roll}]`, 'roll');
        executeMovement(activePlayerIndex, roll);
      }, 850);
    }, 1100);

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [activePlayerIndex, isGameStarted, isGameOver, isPaused]);

  // If on admin route, show Admin Panel
  if (currentRoute === 'admin') {
    return <AdminPanel onBackToGame={() => navigateTo('game')} />;
  }

  // If game not yet started, show Setup
  if (!isGameStarted) {
    return (
      <>
        <GameSetup
          onStartGame={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
        <MatchHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />
      </>
    );
  }

  const activePlayer = players[activePlayerIndex];
  const isHumanTurn = activePlayer?.isHuman && !isRolling;
  const currentTile = board[selectedTileIndex ?? activePlayer?.position ?? 0];
  const isLandedOnSelected = activePlayer && activePlayer.position === currentTile?.index;

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-white flex flex-col font-sans select-none">
      {/* Main Responsive Game Viewport: PC vs Tablet vs Mobile */}
      <div className="flex-1 w-full h-full flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center 3D Board Canvas (Eliminating dead margins) */}
        <div className="relative flex-1 h-[52vh] sm:h-[58vh] lg:h-full w-full bg-black/60 overflow-hidden">
          <Board3D
            board={board}
            players={players}
            activePlayerIndex={activePlayerIndex}
            selectedTileIndex={selectedTileIndex}
            onTileClick={idx => setSelectedTileIndex(idx)}
            deviceMode={deviceMode}
            cameraView={cameraView}
          />
        </div>

        {/* Right / Bottom Control Dock: Adapts seamlessly to PC, Tablet, and Mobile */}
        <div
          className={`flex flex-col border-t lg:border-t-0 lg:border-l border-purple-950 bg-slate-950/95 overflow-hidden p-2 sm:p-3 ${
            deviceMode === 'pc'
              ? 'w-full lg:w-[460px] xl:w-[500px] h-full justify-between'
              : deviceMode === 'tablet'
              ? 'w-full h-[48vh] sm:h-[42vh] grid grid-cols-2 gap-2 overflow-y-auto'
              : 'w-full h-[48vh] overflow-y-auto space-y-2'
          }`}
        >
          {/* Tile Inspector (Shows Cryptid details, lore, and tribute rates) */}
          <div className={`${deviceMode === 'tablet' ? 'h-full' : 'max-h-[300px] sm:max-h-[340px] flex-shrink-0'}`}>
            <TileInspector
              tile={currentTile}
              activePlayer={activePlayer}
              players={players}
              isHumanTurn={Boolean(isHumanTurn)}
              isLandedOn={Boolean(isLandedOnSelected)}
              onFormAlliance={handleHumanFormAlliance}
              onBattleCryptid={handleHumanBattleCryptid}
            />
          </div>

          {/* Player HUD & Controls Deck */}
          <div className={`${deviceMode === 'tablet' ? 'h-full' : 'flex-1 flex flex-col justify-end mt-2'}`}>
            <PlayerHUD
              players={players}
              activePlayerIndex={activePlayerIndex}
              isRolling={isRolling}
              canRoll={Boolean(canRoll && isHumanTurn && !isPaused)}
              onRollDice={handleRollDice}
              lastRoll={lastRoll}
              targetLaps={settings.targetLaps}
              gameLogs={gameLogs}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onOpenHistory={() => setIsHistoryOpen(true)}
              onOpenGithub={() => setIsGithubOpen(true)}
              onPause={handlePauseGame}
              deviceMode={deviceMode}
            />
          </div>
        </div>
      </div>

      {/* Unallied Cryptid Encounter Modal for Human */}
      {encounterCryptid && players[0] && (
        <CryptidEncounterModal
          cryptid={encounterCryptid}
          player={players[0]}
          onAlliance={handleHumanFormAlliance}
          onBattle={handleHumanBattleCryptid}
        />
      )}

      {/* Dramatic Occult Fate Card Modal (For BOTH Human & AI) */}
      {cardModalData && (
        <CardModal
          card={cardModalData.card}
          player={cardModalData.player}
          is100PercentUnlucky={cardModalData.is100PercentUnlucky}
          reason={cardModalData.reason}
          resultInfo={cardModalData.resultInfo}
          onConfirm={cardModalData.onConfirm}
        />
      )}

      {/* Tile Event Modal (Start altar, Blood tax, Safe territory, Rift) */}
      {tileEventModalData && (
        <TileEventModal
          player={tileEventModalData.player}
          eventType={tileEventModalData.eventType}
          details={tileEventModalData.details}
          onConfirm={tileEventModalData.onConfirm}
          isHuman={tileEventModalData.isHuman}
        />
      )}

      {/* Ritual Pause Modal (中断・再開・終了) */}
      <PauseModal
        isOpen={isPaused}
        players={players}
        settings={settings}
        roundsCount={roundsCount}
        onResume={handleResumeGame}
        onQuit={handleQuitGame}
      />

      {/* Game Over Modal */}
      {isGameOver && (
        <GameOverModal
          players={players}
          settings={settings}
          roundsCount={roundsCount}
          onRestart={() => {
            occultAudio.stopOccultBGM();
            setIsGameOver(false);
            setIsGameStarted(false);
          }}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      )}

      {/* Recent 30 Matches History Modal (Server Persisted) */}
      <MatchHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* GitHub Integration Modal */}
      <GitHubIntegrationModal
        isOpen={isGithubOpen}
        onClose={() => setIsGithubOpen(false)}
      />
    </div>
  );
}
