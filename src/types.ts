export type DeviceMode = 'pc' | 'tablet' | 'mobile';

export type GameDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type CryptidGrade = '特級' | '1級' | '2級' | '3級';

export interface Cryptid {
  id: number;
  name: string;
  nameEn: string;
  country: string;
  grade: CryptidGrade;
  allianceCost: number; // Cost paid to Demon King to form alliance
  baseTribute: number;  // Base tribute when another player lands on tile
  description: string;
  curseType: string;
  avatarIcon: string;
  themeColor: string;
}

export type TileType = 
  | 'start'        // Demon King Altar (魔王の祭壇)
  | 'cryptid'      // Yokai/Cryptid Habitat
  | 'occult_rift'  // Warp / Rift (異界の歪み)
  | 'blood_tax'    // Blood sacrifice tax to Demon King (血税の儀式)
  | 'curse_relic'; // Occult sanctuary / Fate drawing (呪物収蔵庫)

export interface BoardTile {
  index: number;
  type: TileType;
  name: string;
  nameSub?: string;
  cryptid?: Cryptid;
  ownerId: string | null; // Player ID who formed alliance
  allianceLevel: number;  // 1 to 3
}

export interface PlayerCharacter {
  id: string;
  name: string;
  role: string;
  origin: string;
  description: string;
  color: string;
  modelType: 'exorcist' | 'onmyoji' | 'medium' | 'alchemist';
}

export interface AICharacter {
  id: string;
  name: string;
  title: string;
  origin: string;
  personality: string;
  color: string;
  modelType: 'baphomet' | 'beelzebub' | 'asmodeus';
}

export interface PlayerState {
  id: string;
  isHuman: boolean;
  name: string;
  title: string;
  characterId: string;
  modelType: string;
  color: string;
  position: number; // 0 to 19
  ghosts: number;   // Starts with 10,000 borrowed from Demon King
  laps: number;     // Completed rounds
  isBankrupt: boolean;
  alliancesCount: number;
  lastDiceRoll?: number;
  debtAccumulated: number; // Total interest paid to Demon King
}

export interface OccultCard {
  id: string;
  title: string;
  cryptidName: string;
  type: 'lucky' | 'unlucky';
  category: 'divine_grace' | 'curse' | 'teleport' | 'plunder' | 'alliance_boost';
  description: string;
  fluffQuote: string;
  effectValue: number;
}

export interface GameLog {
  id: string;
  timestamp: string;
  round: number;
  text: string;
  type: 'roll' | 'alliance' | 'battle' | 'interest' | 'bankruptcy' | 'card' | 'system';
  color?: string;
}

export interface GameSettings {
  targetLaps: number;
  difficulty: GameDifficulty;
  playerNickname: string;
  playerCharacterId: string;
}

export interface MatchParticipant {
  name: string;
  isHuman: boolean;
  ghosts: number;
  alliances: number;
  isBankrupt: boolean;
}

export interface ServerMatchRecord {
  id: string;
  timestamp: string;
  playerName: string;
  playerCharacter: string;
  difficulty: GameDifficulty;
  targetLaps: number;
  winnerName: string;
  isPlayerWinner: boolean;
  playerFinalGhosts: number;
  playerRank: number;
  roundsCount: number;
  alliancesCount: number;
  participants: MatchParticipant[];
}
