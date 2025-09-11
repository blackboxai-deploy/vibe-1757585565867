import { Player, Dealer, Hand, GameRoom, BettingChip } from '@/types/game';
import { 
  createDeck, 
  shuffleDeck, 
  dealCard, 
  calculateHandValue, 
  isBlackjack, 
  isBust,
  canSplit,
  compareHands,
  shouldReshuffleDeck
} from './cardUtils';

export const BETTING_CHIPS: BettingChip[] = [
  { value: 10, color: 'bg-blue-500', label: '$10' },
  { value: 25, color: 'bg-green-500', label: '$25' },
  { value: 50, color: 'bg-purple-500', label: '$50' },
  { value: 100, color: 'bg-red-500', label: '$100' },
  { value: 250, color: 'bg-yellow-500', label: '$250' },
  { value: 500, color: 'bg-black', label: '$500' },
];

/**
 * Create a new game room
 */
export function createGameRoom(name: string, maxPlayers: number = 6): GameRoom {
  return {
    id: generateRoomId(),
    name,
    players: [],
    dealer: createDealer(),
    deck: shuffleDeck(createDeck()),
    gameState: 'waiting',
    currentPlayerIndex: -1,
    maxPlayers,
    minBet: 10,
    maxBet: 500,
    createdAt: new Date(),
    isStarted: false
  };
}

/**
 * Create a new player
 */
export function createPlayer(id: string, name: string): Player {
  return {
    id,
    name,
    chips: 1000, // Starting chips
    currentBet: 0,
    hands: [],
    activeHandIndex: 0,
    hasDoubledDown: false,
    hasSplit: false,
    isActive: false,
    hasStood: false,
    avatar: `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/d720e263-8ae4-4b88-af9f-55ed6f94e71b.png}`
  };
}

/**
 * Create a new dealer
 */
export function createDealer(): Dealer {
  return {
    hand: { cards: [], value: 0, isSoft: false, isBust: false, isBlackjack: false },
    isActive: false,
    holeCardRevealed: false
  };
}

/**
 * Create an empty hand
 */
export function createHand(): Hand {
  return {
    cards: [],
    value: 0,
    isSoft: false,
    isBust: false,
    isBlackjack: false
  };
}

/**
 * Update hand values after adding/removing cards
 */
export function updateHand(hand: Hand): Hand {
  const { value, isSoft } = calculateHandValue(hand.cards);
  return {
    ...hand,
    value,
    isSoft,
    isBust: isBust(hand.cards),
    isBlackjack: isBlackjack(hand.cards)
  };
}

/**
 * Add a player to the game room
 */
export function addPlayerToRoom(room: GameRoom, player: Player): GameRoom {
  if (room.players.length >= room.maxPlayers) {
    throw new Error('Room is full');
  }
  
  if (room.players.some(p => p.id === player.id)) {
    throw new Error('Player already in room');
  }
  
  return {
    ...room,
    players: [...room.players, player]
  };
}

/**
 * Remove a player from the game room
 */
export function removePlayerFromRoom(room: GameRoom, playerId: string): GameRoom {
  return {
    ...room,
    players: room.players.filter(p => p.id !== playerId)
  };
}

/**
 * Place a bet for a player
 */
export function placeBet(room: GameRoom, playerId: string, amount: number): GameRoom {
  const player = room.players.find(p => p.id === playerId);
  if (!player) throw new Error('Player not found');
  
  if (amount < room.minBet || amount > room.maxBet) {
    throw new Error(`Bet must be between $${room.minBet} and $${room.maxBet}`);
  }
  
  if (amount > player.chips) {
    throw new Error('Insufficient chips');
  }
  
  const updatedPlayers = room.players.map(p => 
    p.id === playerId 
      ? { ...p, currentBet: amount, chips: p.chips - amount }
      : p
  );
  
  return { ...room, players: updatedPlayers };
}

/**
 * Start a new game round
 */
export function startNewRound(room: GameRoom): GameRoom {
  // Check if deck needs reshuffling
  let deck = room.deck;
  if (shouldReshuffleDeck(deck)) {
    deck = shuffleDeck(createDeck());
  }
  
  // Reset all players and dealer
  const resetPlayers = room.players.map(player => ({
    ...player,
    hands: [createHand()],
    activeHandIndex: 0,
    hasDoubledDown: false,
    hasSplit: false,
    isActive: false,
    hasStood: false
  }));
  
  const resetDealer = createDealer();
  
  return {
    ...room,
    players: resetPlayers,
    dealer: resetDealer,
    deck,
    gameState: 'dealing',
    currentPlayerIndex: 0,
    isStarted: true
  };
}

/**
 * Deal initial cards (2 to each player and dealer)
 */
export function dealInitialCards(room: GameRoom): GameRoom {
  let deck = [...room.deck];
  let players = [...room.players];
  let dealer = { ...room.dealer };
  
  // Deal first card to each player
  for (let i = 0; i < players.length; i++) {
    const { card, remainingDeck } = dealCard(deck);
    if (!card) throw new Error('Not enough cards in deck');
    
    deck = remainingDeck;
    players[i] = {
      ...players[i],
      hands: [{
        ...players[i].hands[0],
        cards: [...players[i].hands[0].cards, card]
      }]
    };
  }
  
  // Deal first card to dealer (face up)
  const { card: dealerCard1, remainingDeck: deck1 } = dealCard(deck);
  if (!dealerCard1) throw new Error('Not enough cards in deck');
  deck = deck1;
  dealer.hand = { ...dealer.hand, cards: [dealerCard1] };
  
  // Deal second card to each player
  for (let i = 0; i < players.length; i++) {
    const { card, remainingDeck } = dealCard(deck);
    if (!card) throw new Error('Not enough cards in deck');
    
    deck = remainingDeck;
    players[i] = {
      ...players[i],
      hands: [{
        ...players[i].hands[0],
        cards: [...players[i].hands[0].cards, card]
      }]
    };
    // Update hand values
    players[i].hands[0] = updateHand(players[i].hands[0]);
  }
  
  // Deal second card to dealer (hole card)
  const { card: dealerCard2, remainingDeck: finalDeck } = dealCard(deck);
  if (!dealerCard2) throw new Error('Not enough cards in deck');
  dealer.hand = updateHand({ ...dealer.hand, cards: [dealerCard1, dealerCard2] });
  
  return {
    ...room,
    players,
    dealer,
    deck: finalDeck,
    gameState: 'playing'
  };
}

/**
 * Player hits (takes another card)
 */
export function playerHit(room: GameRoom, playerId: string, handIndex: number = 0): GameRoom {
  const playerIndex = room.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) throw new Error('Player not found');
  
  const { card, remainingDeck } = dealCard(room.deck);
  if (!card) throw new Error('No more cards in deck');
  
  const updatedPlayers = [...room.players];
  const player = { ...updatedPlayers[playerIndex] };
  const hand = { ...player.hands[handIndex] };
  
  hand.cards = [...hand.cards, card];
  player.hands[handIndex] = updateHand(hand);
  updatedPlayers[playerIndex] = player;
  
  return {
    ...room,
    players: updatedPlayers,
    deck: remainingDeck
  };
}

/**
 * Player stands (ends their turn)
 */
export function playerStand(room: GameRoom, playerId: string): GameRoom {
  const updatedPlayers = room.players.map(p => 
    p.id === playerId ? { ...p, hasStood: true, isActive: false } : p
  );
  
  return { ...room, players: updatedPlayers };
}

/**
 * Player doubles down
 */
export function playerDouble(room: GameRoom, playerId: string, handIndex: number = 0): GameRoom {
  const playerIndex = room.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) throw new Error('Player not found');
  
  const player = room.players[playerIndex];
  if (player.chips < player.currentBet) {
    throw new Error('Insufficient chips to double down');
  }
  
  // Double the bet and deal one more card
  let updatedRoom = {
    ...room,
    players: room.players.map(p => 
      p.id === playerId 
        ? { ...p, currentBet: p.currentBet * 2, chips: p.chips - p.currentBet, hasDoubledDown: true }
        : p
    )
  };
  
  // Deal one card and force stand
  updatedRoom = playerHit(updatedRoom, playerId, handIndex);
  updatedRoom = playerStand(updatedRoom, playerId);
  
  return updatedRoom;
}

/**
 * Player splits their hand
 */
export function playerSplit(room: GameRoom, playerId: string): GameRoom {
  const playerIndex = room.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) throw new Error('Player not found');
  
  const player = room.players[playerIndex];
  const hand = player.hands[0];
  
  if (!canSplit(hand.cards)) {
    throw new Error('Cannot split this hand');
  }
  
  if (player.chips < player.currentBet) {
    throw new Error('Insufficient chips to split');
  }
  
  // Create two hands from the split
  const firstHand = createHand();
  firstHand.cards = [hand.cards[0]];
  
  const secondHand = createHand();
  secondHand.cards = [hand.cards[1]];
  
  const updatedPlayers = [...room.players];
  updatedPlayers[playerIndex] = {
    ...player,
    hands: [updateHand(firstHand), updateHand(secondHand)],
    chips: player.chips - player.currentBet,
    hasSplit: true
  };
  
  return { ...room, players: updatedPlayers };
}

/**
 * Dealer plays their hand
 */
export function dealerPlay(room: GameRoom): GameRoom {
  let deck = [...room.deck];
  let dealer = { ...room.dealer, holeCardRevealed: true, isActive: true };
  
  // Dealer hits on 16 and below, stands on 17 and above
  while (dealer.hand.value < 17) {
    const { card, remainingDeck } = dealCard(deck);
    if (!card) break;
    
    deck = remainingDeck;
    dealer.hand = updateHand({
      ...dealer.hand,
      cards: [...dealer.hand.cards, card]
    });
  }
  
  dealer.isActive = false;
  
  return {
    ...room,
    dealer,
    deck,
    gameState: 'results'
  };
}

/**
 * Calculate payouts and update player chips
 */
export function calculatePayouts(room: GameRoom): GameRoom {
  const updatedPlayers = room.players.map(player => {
    let totalPayout = 0;
    
    player.hands.forEach(hand => {
      const result = compareHands(hand.cards, room.dealer.hand.cards);
      
      if (result === 'player') {
        if (hand.isBlackjack && !room.dealer.hand.isBlackjack) {
          // Blackjack pays 3:2
          totalPayout += player.currentBet * 2.5;
        } else {
          // Regular win pays 1:1
          totalPayout += player.currentBet * 2;
        }
      } else if (result === 'push') {
        // Push returns original bet
        totalPayout += player.currentBet;
      }
      // Loss pays nothing (bet already deducted)
    });
    
    return {
      ...player,
      chips: player.chips + totalPayout,
      currentBet: 0
    };
  });
  
  return { ...room, players: updatedPlayers };
}

/**
 * Check if all players have finished their turns
 */
export function allPlayersFinished(room: GameRoom): boolean {
  return room.players.every(player => 
    player.hasStood || 
    player.hands.some(hand => hand.isBust) ||
    player.hands.every(hand => hand.isBlackjack)
  );
}

/**
 * Get next player index
 */
export function getNextPlayerIndex(room: GameRoom): number {
  const currentIndex = room.currentPlayerIndex;
  
  for (let i = 1; i < room.players.length; i++) {
    const nextIndex = (currentIndex + i) % room.players.length;
    const player = room.players[nextIndex];
    
    if (!player.hasStood && !player.hands.some(hand => hand.isBust || hand.isBlackjack)) {
      return nextIndex;
    }
  }
  
  return -1; // No more active players
}

/**
 * Generate a unique room ID
 */
function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}