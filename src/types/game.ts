export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // 1-11 for A, face value for others
  id: string;
}

export interface Hand {
  cards: Card[];
  value: number;
  isSoft: boolean; // Contains ace counted as 11
  isBust: boolean;
  isBlackjack: boolean;
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  currentBet: number;
  hands: Hand[];
  activeHandIndex: number;
  hasDoubledDown: boolean;
  hasSplit: boolean;
  isActive: boolean;
  hasStood: boolean;
  avatar?: string;
}

export interface Dealer {
  hand: Hand;
  isActive: boolean;
  holeCardRevealed: boolean;
}

export interface GameRoom {
  id: string;
  name: string;
  players: Player[];
  dealer: Dealer;
  deck: Card[];
  gameState: GameState;
  currentPlayerIndex: number;
  maxPlayers: number;
  minBet: number;
  maxBet: number;
  createdAt: Date;
  isStarted: boolean;
}

export type GameState = 
  | 'waiting'    // Waiting for players to join
  | 'betting'    // Players placing bets
  | 'dealing'    // Initial cards being dealt
  | 'playing'    // Players taking turns
  | 'dealer'     // Dealer playing
  | 'results'    // Showing results and payouts
  | 'finished';  // Game completed

export interface GameAction {
  type: 'hit' | 'stand' | 'double' | 'split' | 'bet' | 'join' | 'leave' | 'restart';
  playerId: string;
  amount?: number;
  handIndex?: number;
}

export interface GameEvent {
  type: 'player-joined' | 'player-left' | 'bet-placed' | 'card-dealt' | 'hand-completed' | 'game-ended';
  playerId?: string;
  data?: any;
  timestamp: Date;
}

export interface BettingChip {
  value: number;
  color: string;
  label: string;
}

export interface GameSettings {
  maxPlayers: number;
  minBet: number;
  maxBet: number;
  dealerStandsOnSoft17: boolean;
  allowDoubleAfterSplit: boolean;
  allowSurrender: boolean;
  blackjackPayout: number; // 1.5 for 3:2, 1.2 for 6:5
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalWinnings: number;
  bestStreak: number;
  currentStreak: number;
}

export interface AudioSettings {
  enabled: boolean;
  volume: number;
  effects: {
    cardDeal: boolean;
    chipBet: boolean;
    win: boolean;
    lose: boolean;
  };
}