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
import { GameSetup } from './components/GameSetup';
import { GameOverModal } from './components/GameOverModal';
import { MatchHistoryModal } from './components/MatchHistoryModal';
import { PauseModal } from './components/PauseModal';
import { AdminPanel } from './components/AdminPanel';
import { GitHubIntegrationModal } from './components/GitHubIntegrationModal';
import { occultAudio } from './utils/occultAudio';

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
  const [currentCard, setCurrentCard] = useState<OccultCard | null>(null);
  const [isCard100PercentUnlucky, setIsCard100PercentUnlucky] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGithubOpen, setIsGithubOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraView, setCameraView] = useState<'dynamic' | 'overview' | 'topdown'>('dynamic');

  // Logs
  const [gameLogs, setGameLogs] = useState<GameLog[]>([]);

  // Ref to track game loop timeout for cleanup
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    submitMatchToServer(finalPlayers);
    const winner = [...finalPlayers].sort((a, b) => b.ghosts - a.ghosts)[0];
    addLog(`【儀式終了】勝者: ${winner?.name}！ 全記録はサーバーに保存されました。`, 'system', 'text-amber-400 font-black');
  }, [submitMatchToServer, addLog]);

  // Switch Turn to Next Living Player
  const advanceToNextPlayer = useCallback((updatedPlayers: PlayerState[]) => {
    if (checkGameOverCondition(updatedPlayers)) {
      triggerGameOver(updatedPlayers);
      return;
    }

    let nextIdx = (activePlayerIndex + 1) % updatedPlayers.length;
    let attempts = 0;
    while (updatedPlayers[nextIdx].isBankrupt && attempts < updatedPlayers.length) {
      nextIdx = (nextIdx + 1) % updatedPlayers.length;
      attempts++;
    }

    setActivePlayerIndex(nextIdx);
    setSelectedTileIndex(updatedPlayers[nextIdx].position);

    if (nextIdx === 0) {
      setRoundsCount(r => r + 1);
    }

    if (updatedPlayers[nextIdx].isHuman) {
      setCanRoll(true);
    }
  }, [activePlayerIndex, checkGameOverCondition, triggerGameOver]);

  // Dice Roll Logic
  const handleRollDice = () => {
    if (!canRoll || isRolling || isPaused) return;

    setIsRolling(true);
    setCanRoll(false);
    occultAudio.playDiceRoll();

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setLastRoll(roll);
      setIsRolling(false);

      executeMovement(activePlayerIndex, roll);
    }, 900);
  };

  // Movement along the 20-tile board and lap interest logic
  const executeMovement = (playerIdx: number, steps: number) => {
    setPlayers(prev => {
      const updated = [...prev];
      const p = { ...updated[playerIdx] };
      const oldPos = p.position;
      const newPos = (oldPos + steps) % 20;

      p.position = newPos;
      p.lastDiceRoll = steps;
      setSelectedTileIndex(newPos);

      // Check if player passed or landed on START (tile 0) -> Completed a lap
      const passedStart = (oldPos + steps) >= 20;
      if (passedStart) {
        p.laps += 1;
        const interestDue = calculateLapInterest(p.laps);
        p.ghosts -= interestDue;
        p.debtAccumulated += interestDue;
        occultAudio.playBellToll();

        addLog(
          `${p.name} が第${p.laps}周を完了！ 魔王へ利息【${interestDue}ゴースト】を支払い (次周利息1.1倍に膨張)`,
          'interest',
          'text-rose-400'
        );

        if (p.ghosts < 0) {
          p.isBankrupt = true;
          p.ghosts = 0;
          addLog(`💀 ${p.name} は魔王への周回利息を支払えず破産・魂を回収された！`, 'bankruptcy', 'text-red-500 font-bold');
        }
      }

      updated[playerIdx] = p;
      return updated;
    });

    // Evaluate tile landed on after short delay
    setTimeout(() => {
      evaluateTileLanding(playerIdx);
    }, 600);
  };

  // Draw an Occult Card based on Difficulty and Cryptid Grade
  const drawFateCard = (isHuman: boolean, force100PercentUnlucky: boolean = false): OccultCard => {
    if (force100PercentUnlucky) {
      // 100% Unlucky
      const card = OCCULT_CARDS_UNLUCKY[Math.floor(Math.random() * OCCULT_CARDS_UNLUCKY.length)];
      return card;
    }

    // Determine luck ratio from requirements:
    // 初級 (Beginner): Human 80%, AI 20%
    // 中級 (Intermediate): Human 65%, AI 35%
    // 上級 (Advanced): Human 50%, AI 50%
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

  // Evaluate Landing on a tile
  const evaluateTileLanding = (playerIdx: number) => {
    const currentPlayers = [...players];
    const p = currentPlayers[playerIdx];
    if (p.isBankrupt) {
      advanceToNextPlayer(currentPlayers);
      return;
    }

    const tile = board[p.position];

    if (tile.type === 'start') {
      addLog(`${p.name} は魔王の祭壇に立ち止まった。静寂が霊力を保全する。`, 'system');
      if (!p.isHuman) {
        setTimeout(() => advanceToNextPlayer(currentPlayers), 800);
      }
    } else if (tile.type === 'occult_rift') {
      // Occult rift: warp forward 2 tiles
      addLog(`🌀 異界の特異点！ ${p.name} は時空を跳躍し前方のマスへ歪曲移動！`, 'system', 'text-indigo-400');
      setTimeout(() => {
        executeMovement(playerIdx, 2);
      }, 500);
    } else if (tile.type === 'blood_tax') {
      // 5% Tax to Demon King
      const tax = Math.max(100, Math.floor(p.ghosts * 0.05));
      p.ghosts = Math.max(0, p.ghosts - tax);
      occultAudio.playCoin();
      addLog(`🩸 血税の生贄台！ ${p.name} は魔王へ霊血税 ${tax} ゴーストを強制献上した。`, 'system', 'text-rose-400');
      setPlayers(currentPlayers);
      if (!p.isHuman) {
        setTimeout(() => advanceToNextPlayer(currentPlayers), 800);
      }
    } else if (tile.type === 'curse_relic') {
      // Relic: Draw a fate card directly
      const card = drawFateCard(p.isHuman, false);
      if (p.isHuman) {
        occultAudio.playCardReveal();
        setIsCard100PercentUnlucky(false);
        setCurrentCard(card);
      } else {
        applyCardEffect(playerIdx, card);
        setTimeout(() => advanceToNextPlayer(players), 900);
      }
    } else if (tile.type === 'cryptid') {
      const cryptid = tile.cryptid!;
      const isOwned = tile.ownerId !== null;
      const isOwner = tile.ownerId === p.id;
      const isOwnedByOther = isOwned && !isOwner;

      if (isOwnedByOther) {
        // Requirement: ③ 他のプレイヤーとの同盟が結成されている場合は、怪異とのバトル（カードを引き、カード内容に従う。不運不運系１００％）
        const owner = currentPlayers.find(pl => pl.id === tile.ownerId);
        addLog(
          `⚔️ 領域侵犯！ ${p.name} は ${owner?.name} の盟友【${cryptid.name}】の縄張りに侵入！ 不運100%の迎撃バトルが発生！`,
          'battle',
          'text-red-400 font-bold'
        );

        const card = drawFateCard(p.isHuman, true); // Force 100% unlucky card!

        if (p.isHuman) {
          occultAudio.playBattleClash();
          setIsCard100PercentUnlucky(true);
          setCurrentCard(card);
        } else {
          // AI pays tribute and penalty
          applyCardEffect(playerIdx, card);
          // Also pay tribute to owner
          const tribute = cryptid.baseTribute;
          p.ghosts -= tribute;
          if (owner) owner.ghosts += tribute;
          addLog(`${p.name} は同盟主 ${owner?.name} に貢納 ${tribute} ゴーストを納付。`, 'battle');
          setPlayers(currentPlayers);
          setTimeout(() => advanceToNextPlayer(currentPlayers), 1000);
        }
      } else if (!isOwned) {
        // Unallied Cryptid -> Choice: ① Alliance, ② Battle
        if (p.isHuman) {
          addLog(`📜 未契約の怪異【${cryptid.name}】(${cryptid.grade}) と遭遇！ ①同盟締結 か ②バトル を選択してください。`, 'system', 'text-amber-200');
          // Waits for Human button click in TileInspector
        } else {
          // AI self-interest decision logic:
          // "但し、AI３体は共同して人間を狙うことは禁止。各AIは、自身の勝利を目指す。"
          // Each AI evaluates:
          // If alliance cost <= 40% of their current ghosts and ghosts > 1500: forms alliance to secure income!
          // Otherwise battles cryptid to preserve liquidity.
          const canAfford = p.ghosts >= cryptid.allianceCost;
          const isFavorableInvestment = cryptid.allianceCost <= p.ghosts * 0.42 && p.ghosts > 1800;

          if (canAfford && isFavorableInvestment) {
            handleAIFormAlliance(playerIdx, tile.index);
          } else {
            handleAIBattle(playerIdx, cryptid.name);
          }
        }
      } else if (isOwner) {
        addLog(`${p.name} は自らの盟友怪異【${cryptid.name}】の領域で安息を得た。`, 'system', 'text-purple-300');
        if (!p.isHuman) {
          setTimeout(() => advanceToNextPlayer(currentPlayers), 800);
        }
      }
    }
  };

  // AI Alliance Formation
  const handleAIFormAlliance = (playerIdx: number, tileIdx: number) => {
    setBoard(prevBoard => {
      const updatedBoard = [...prevBoard];
      const targetTile = { ...updatedBoard[tileIdx] };
      const cryptid = targetTile.cryptid;
      if (!cryptid) return prevBoard;

      setPlayers(prevPlayers => {
        const updatedPlayers = [...prevPlayers];
        const ai = { ...updatedPlayers[playerIdx] };

        ai.ghosts -= cryptid.allianceCost;
        ai.alliancesCount += 1;
        targetTile.ownerId = ai.id;
        updatedBoard[tileIdx] = targetTile;

        occultAudio.playAllianceFormed();
        addLog(
          `🤝 【同盟締結】${ai.name} は魔王に費用 ${cryptid.allianceCost} G を払い、怪異【${cryptid.name}】と契約！`,
          'alliance',
          'text-purple-400 font-bold'
        );

        setTimeout(() => advanceToNextPlayer(updatedPlayers), 1100);
        return updatedPlayers;
      });

      return updatedBoard;
    });
  };

  // AI Battle
  const handleAIBattle = (playerIdx: number, cryptidName: string) => {
    addLog(`⚔️ ${players[playerIdx].name} は怪異【${cryptidName}】にバトルを挑んだ！`, 'battle');
    const card = drawFateCard(false, false);
    applyCardEffect(playerIdx, card);
    setTimeout(() => advanceToNextPlayer(players), 1100);
  };

  // Pause / Resume / Quit game flow handlers
  const handlePauseGame = () => {
    setIsPaused(true);
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
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
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    addLog('◆ 儀式を破棄し、初期契約画面へ回帰しました。', 'system', 'text-white/60');
  };

  // Human Choice ①: Form Alliance
  const handleHumanFormAlliance = () => {
    const p = players[0];
    const tile = board[p.position];
    const cryptid = tile.cryptid;
    if (!cryptid || p.ghosts < cryptid.allianceCost) return;

    setBoard(prevBoard => {
      const updatedBoard = [...prevBoard];
      const targetTile = { ...updatedBoard[p.position] };
      targetTile.ownerId = p.id;
      updatedBoard[p.position] = targetTile;
      return updatedBoard;
    });

    setPlayers(prevPlayers => {
      const updated = [...prevPlayers];
      const human = { ...updated[0] };
      human.ghosts -= cryptid.allianceCost;
      human.alliancesCount += 1;
      updated[0] = human;

      occultAudio.playAllianceFormed();
      addLog(
        `🤝 【同盟締結】契約者 ${human.name} はバンカー魔王へ ${cryptid.allianceCost} G を納付し、怪異【${cryptid.name}】と同盟成立！`,
        'alliance',
        'text-emerald-400 font-black'
      );

      advanceToNextPlayer(updated);
      return updated;
    });
  };

  // Human Choice ② & ③: Battle with Cryptid (Fate card)
  const handleHumanBattleCryptid = () => {
    const p = players[0];
    const tile = board[p.position];
    const isOwnedByOther = tile.ownerId !== null && tile.ownerId !== p.id;

    occultAudio.playBattleClash();
    const card = drawFateCard(true, isOwnedByOther);
    setIsCard100PercentUnlucky(isOwnedByOther);
    setCurrentCard(card);
  };

  // Apply Fate Card Effect
  const applyCardEffect = (playerIdx: number, card: OccultCard) => {
    setPlayers(prevPlayers => {
      const updated = [...prevPlayers];
      const p = { ...updated[playerIdx] };

      if (card.type === 'lucky') {
        if (card.category === 'plunder') {
          // Plunder from everyone else
          updated.forEach((other, oIdx) => {
            if (oIdx !== playerIdx && !other.isBankrupt) {
              const stealAmount = Math.min(other.ghosts, card.effectValue);
              other.ghosts -= stealAmount;
              p.ghosts += stealAmount;
            }
          });
          occultAudio.playCoin();
        } else if (card.category === 'teleport') {
          p.position = (p.position + card.effectValue) % 20;
        } else {
          p.ghosts += card.effectValue;
          occultAudio.playCoin();
        }
        addLog(`✨ 【幸運の加護】${p.name} は『${card.title}』により霊貨+${card.effectValue} G！`, 'card', 'text-emerald-400');
      } else {
        // Unlucky
        if (card.category === 'teleport') {
          p.position = (p.position + card.effectValue + 20) % 20;
        } else {
          p.ghosts -= card.effectValue;
        }
        addLog(`💀 【厄災の呪縛】${p.name} は『${card.title}』により損害-${card.effectValue} G！`, 'card', 'text-rose-400');

        if (p.ghosts < 0) {
          p.isBankrupt = true;
          p.ghosts = 0;
          addLog(`💀 ${p.name} は怪異の呪縛により全財産を喪失し破産消滅した！`, 'bankruptcy', 'text-red-500 font-bold');
        }
      }

      updated[playerIdx] = p;
      return updated;
    });
  };

  // Close Card Modal and Proceed Turn
  const handleCardModalConfirm = () => {
    if (!currentCard) return;
    const card = currentCard;
    setCurrentCard(null);

    applyCardEffect(0, card);

    // Check if tribute needed if tile was owned by other
    const tile = board[players[0].position];
    if (tile.ownerId && tile.ownerId !== players[0].id && tile.cryptid) {
      setPlayers(prev => {
        const updated = [...prev];
        const human = { ...updated[0] };
        const owner = updated.find(pl => pl.id === tile.ownerId);
        const tribute = tile.cryptid!.baseTribute;

        human.ghosts -= tribute;
        if (owner) owner.ghosts += tribute;
        addLog(`領域侵犯の賠償として同盟主 ${owner?.name} へ貢納 ${tribute} G を支払いました。`, 'battle', 'text-red-300');

        if (human.ghosts < 0) {
          human.isBankrupt = true;
          human.ghosts = 0;
          addLog(`💀 契約者 ${human.name} は貢納金を払えず破産した！`, 'bankruptcy', 'text-red-500 font-black');
        }

        updated[0] = human;
        advanceToNextPlayer(updated);
        return updated;
      });
    } else {
      setTimeout(() => advanceToNextPlayer(players), 300);
    }
  };

  // AI Turn Execution Effect
  useEffect(() => {
    if (!isGameStarted || isGameOver || isPaused) return;
    const activePlayer = players[activePlayerIndex];
    if (!activePlayer || activePlayer.isHuman || activePlayer.isBankrupt) return;

    // AI Turn automation with organic delay
    aiTimeoutRef.current = setTimeout(() => {
      // AI rolls dice
      setIsRolling(true);
      occultAudio.playDiceRoll();

      setTimeout(() => {
        const roll = Math.floor(Math.random() * 6) + 1;
        setLastRoll(roll);
        setIsRolling(false);
        addLog(`🎲 ${activePlayer.name} がサイコロを振った: [${roll}]`, 'roll');
        executeMovement(activePlayerIndex, roll);
      }, 800);
    }, 1200);

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
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
  const isLandedOnSelected = activePlayer && activePlayer.position === currentTile.index;

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
          {/* Tile Inspector (Shows Cryptid details, Alliance & Battle options) */}
          <div className={`${deviceMode === 'tablet' ? 'h-full' : 'max-h-[300px] sm:max-h-[340px] flex-shrink-0'}`}>
            <TileInspector
              tile={currentTile}
              activePlayer={activePlayer}
              players={players}
              isHumanTurn={Boolean(isHumanTurn)}
              isLandedOn={Boolean(isLandedOnSelected)}
              onFormAlliance={handleHumanFormAlliance}
              onBattleCryptid={handleHumanBattleCryptid}
              onPassSpecialTile={() => advanceToNextPlayer(players)}
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

      {/* Occult Fate Card Modal */}
      {currentCard && (
        <CardModal
          card={currentCard}
          is100PercentUnlucky={isCard100PercentUnlucky}
          onConfirm={handleCardModalConfirm}
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
          onRestart={() => setIsGameStarted(false)}
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
