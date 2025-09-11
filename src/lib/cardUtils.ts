import { Card, Suit, Rank } from '@/types/game';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

export const SUIT_COLORS = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-black',
  spades: 'text-black'
};

/**
 * Create a standard 52-card deck
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        value: getCardValue(rank),
        id: `${suit}-${rank}`
      });
    }
  }
  
  return deck;
}

/**
 * Get the base value of a card (Ace = 1, Face cards = 10)
 */
export function getCardValue(rank: Rank): number {
  if (rank === 'A') return 1;
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank);
}

/**
 * Shuffle deck using Fisher-Yates algorithm
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Deal a card from the deck
 */
export function dealCard(deck: Card[]): { card: Card | null, remainingDeck: Card[] } {
  if (deck.length === 0) {
    return { card: null, remainingDeck: [] };
  }
  
  const [card, ...remainingDeck] = deck;
  return { card, remainingDeck };
}

/**
 * Calculate hand value with optimal ace handling
 */
export function calculateHandValue(cards: Card[]): { value: number, isSoft: boolean } {
  let value = 0;
  let aces = 0;
  
  // Count non-aces first
  for (const card of cards) {
    if (card.rank === 'A') {
      aces++;
    } else {
      value += card.value;
    }
  }
  
  // Handle aces optimally
  let isSoft = false;
  for (let i = 0; i < aces; i++) {
    if (value + 11 + (aces - i - 1) <= 21) {
      value += 11;
      isSoft = true;
    } else {
      value += 1;
    }
  }
  
  return { value, isSoft };
}

/**
 * Check if hand is blackjack (21 with 2 cards)
 */
export function isBlackjack(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  const { value } = calculateHandValue(cards);
  return value === 21;
}

/**
 * Check if hand is bust (over 21)
 */
export function isBust(cards: Card[]): boolean {
  const { value } = calculateHandValue(cards);
  return value > 21;
}

/**
 * Check if hand can be split (two cards of same rank)
 */
export function canSplit(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  return cards[0].rank === cards[1].rank;
}

/**
 * Get card display name
 */
export function getCardDisplay(card: Card): string {
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
}

/**
 * Get card image path (for future image implementation)
 */
export function getCardImagePath(card: Card): string {
  return `/cards/${card.suit}-${card.rank.toLowerCase()}.svg`;
}

/**
 * Create a new shuffled deck when running low
 */
export function shouldReshuffleDeck(deck: Card[], threshold: number = 13): boolean {
  return deck.length <= threshold; // Reshuffle when less than 25% remaining
}

/**
 * Get hand display string for debugging
 */
export function getHandDisplay(cards: Card[]): string {
  return cards.map(getCardDisplay).join(' ');
}

/**
 * Compare two hands for winner determination
 */
export function compareHands(playerHand: Card[], dealerHand: Card[]): 'player' | 'dealer' | 'push' {
  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);
  
  const playerBust = playerValue.value > 21;
  const dealerBust = dealerValue.value > 21;
  const playerBlackjack = isBlackjack(playerHand);
  const dealerBlackjack = isBlackjack(dealerHand);
  
  // Both bust - dealer wins
  if (playerBust && dealerBust) return 'dealer';
  
  // Player bust - dealer wins
  if (playerBust) return 'dealer';
  
  // Dealer bust - player wins
  if (dealerBust) return 'player';
  
  // Both blackjack - push
  if (playerBlackjack && dealerBlackjack) return 'push';
  
  // Player blackjack - player wins
  if (playerBlackjack) return 'player';
  
  // Dealer blackjack - dealer wins
  if (dealerBlackjack) return 'dealer';
  
  // Compare values
  if (playerValue.value > dealerValue.value) return 'player';
  if (playerValue.value < dealerValue.value) return 'dealer';
  
  return 'push';
}