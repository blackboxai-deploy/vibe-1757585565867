'use client';

import { useState, useCallback, useEffect } from 'react';
import { GameRoom, Player, GameAction, GameEvent } from '@/types/game';
import {
  createGameRoom,
  createPlayer,
  addPlayerToRoom,
  removePlayerFromRoom,
  placeBet,
  startNewRound,
  dealInitialCards,
  playerHit,
  playerStand,
  playerDouble,
  playerSplit,
  dealerPlay,
  calculatePayouts,
  allPlayersFinished,
  getNextPlayerIndex
} from '@/lib/gameLogic';

interface UseGameStateProps {
  playerId: string;
  playerName: string;
}

interface UseGameStateReturn {
  room: GameRoom | null;
  currentPlayer: Player | null;
  isCurrentPlayerTurn: boolean;
  availableActions: string[];
  gameMessage: string;
  processAction: (action: GameAction) => void;
  processEvent: (event: GameEvent) => void;
  initializeRoom: (roomName?: string) => void;
  joinRoom: (existingRoom: GameRoom) => void;
  error: string | null;
  clearError: () => void;
}

export function useGameState({
  playerId,
  playerName
}: UseGameStateProps): UseGameStateReturn {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPlayer = room?.players.find(p => p.id === playerId) || null;
  const isCurrentPlayerTurn = room ? room.currentPlayerIndex === room.players.findIndex(p => p.id === playerId) : false;

  const clearError = useCallback(() => setError(null), []);

  const getAvailableActions = useCallback((): string[] => {
    if (!room || !currentPlayer || !isCurrentPlayerTurn) return [];
    if (room.gameState !== 'playing') return [];

    const currentHand = currentPlayer.hands[currentPlayer.activeHandIndex];
    if (!currentHand || currentHand.isBust || currentHand.isBlackjack || currentPlayer.hasStood) {
      return [];
    }

    const actions = ['hit', 'stand'];

    // Can double down on first two cards only
    if (currentHand.cards.length === 2 && !currentPlayer.hasDoubledDown) {
      if (currentPlayer.chips >= currentPlayer.currentBet) {
        actions.push('double');
      }
    }

    // Can split pairs on first two cards only
    if (currentHand.cards.length === 2 && !currentPlayer.hasSplit) {
      if (currentHand.cards[0].rank === currentHand.cards[1].rank) {
        if (currentPlayer.chips >= currentPlayer.currentBet) {
          actions.push('split');
        }
      }
    }

    return actions;
  }, [room, currentPlayer, isCurrentPlayerTurn]);

  const getGameMessage = useCallback((): string => {
    if (!room) return 'Loading...';

    switch (room.gameState) {
      case 'waiting':
        return `Waiting for players (${room.players.length}/${room.maxPlayers})`;
      case 'betting':
        return 'Place your bets';
      case 'dealing':
        return 'Dealing cards...';
      case 'playing':
        if (isCurrentPlayerTurn) {
          return "It's your turn!";
        }
        const currentPlayerName = room.players[room.currentPlayerIndex]?.name || 'Unknown';
        return `${currentPlayerName}'s turn`;
      case 'dealer':
        return 'Dealer is playing...';
      case 'results':
        return 'Round complete!';
      case 'finished':
        return 'Game finished';
      default:
        return '';
    }
  }, [room, isCurrentPlayerTurn]);

  const processAction = useCallback((action: GameAction) => {
    if (!room) return;

    try {
      let updatedRoom = { ...room };

      switch (action.type) {
        case 'bet':
          if (action.amount) {
            updatedRoom = placeBet(updatedRoom, action.playerId, action.amount);
            
            // Check if all players have placed bets
            const allBetsPlaced = updatedRoom.players.every(p => p.currentBet > 0);
            if (allBetsPlaced && updatedRoom.gameState === 'betting') {
              updatedRoom = startNewRound(updatedRoom);
              updatedRoom = dealInitialCards(updatedRoom);
            }
          }
          break;

        case 'hit':
          updatedRoom = playerHit(updatedRoom, action.playerId, action.handIndex || 0);
          
          // Check if player busted or got blackjack
          const player = updatedRoom.players.find(p => p.id === action.playerId);
          const hand = player?.hands[action.handIndex || 0];
          
          if (hand?.isBust || hand?.isBlackjack) {
            updatedRoom = playerStand(updatedRoom, action.playerId);
          }
          break;

        case 'stand':
          updatedRoom = playerStand(updatedRoom, action.playerId);
          break;

        case 'double':
          updatedRoom = playerDouble(updatedRoom, action.playerId, action.handIndex || 0);
          break;

        case 'split':
          updatedRoom = playerSplit(updatedRoom, action.playerId);
          break;

        case 'join':
          // Handle player joining (this would typically be managed server-side)
          break;

        case 'leave':
          updatedRoom = removePlayerFromRoom(updatedRoom, action.playerId);
          break;
      }

      // Check if we need to advance to next player or dealer
      if (updatedRoom.gameState === 'playing') {
        if (allPlayersFinished(updatedRoom)) {
          // All players finished, dealer's turn
          updatedRoom = dealerPlay(updatedRoom);
          updatedRoom = calculatePayouts(updatedRoom);
          
          // Reset for next round after a delay
          setTimeout(() => {
            setRoom(prev => prev ? { ...prev, gameState: 'betting' } : null);
          }, 5000);
        } else {
          // Move to next player
          const nextPlayerIndex = getNextPlayerIndex(updatedRoom);
          if (nextPlayerIndex >= 0) {
            updatedRoom.currentPlayerIndex = nextPlayerIndex;
          }
        }
      }

      setRoom(updatedRoom);
      clearError();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [room, clearError]);

  const processEvent = useCallback((event: GameEvent) => {
    if (!room) return;

    switch (event.type) {
      case 'player-joined':
        if (event.playerId && event.data) {
          const newPlayer = createPlayer(event.playerId, event.data.name);
          try {
            const updatedRoom = addPlayerToRoom(room, newPlayer);
            setRoom(updatedRoom);
          } catch (err) {
            console.warn('Failed to add player:', err);
          }
        }
        break;

      case 'player-left':
        if (event.playerId) {
          const updatedRoom = removePlayerFromRoom(room, event.playerId);
          setRoom(updatedRoom);
        }
        break;

      case 'bet-placed':
      case 'card-dealt':
      case 'hand-completed':
      case 'game-ended':
        // These events are handled through action processing
        break;
    }
  }, [room]);

  const initializeRoom = useCallback((roomName: string = 'Blackjack Game') => {
    const newRoom = createGameRoom(roomName);
    const player = createPlayer(playerId, playerName);
    
    try {
      const roomWithPlayer = addPlayerToRoom(newRoom, player);
      setRoom(roomWithPlayer);
      clearError();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    }
  }, [playerId, playerName, clearError]);

  const joinRoom = useCallback((existingRoom: GameRoom) => {
    const player = createPlayer(playerId, playerName);
    
    try {
      const roomWithPlayer = addPlayerToRoom(existingRoom, player);
      setRoom(roomWithPlayer);
      clearError();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    }
  }, [playerId, playerName, clearError]);

  // Auto-start betting phase when minimum players join
  useEffect(() => {
    if (room && room.gameState === 'waiting' && room.players.length >= 1) {
      // Start betting phase
      setRoom(prev => prev ? { ...prev, gameState: 'betting' } : null);
    }
  }, [room?.players.length, room?.gameState]);

  return {
    room,
    currentPlayer,
    isCurrentPlayerTurn,
    availableActions: getAvailableActions(),
    gameMessage: getGameMessage(),
    processAction,
    processEvent,
    initializeRoom,
    joinRoom,
    error,
    clearError
  };
}