'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GameRoom, GameAction, GameEvent } from '@/types/game';
import { useGameState } from '@/hooks/useGameState';
import { useGameSocket } from '@/hooks/useGameSocket';
import { GameTable } from './GameTable';
import { Button } from '@/components/ui/button';

export function GameEngine() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const [playerInfo, setPlayerInfo] = useState<{ id: string; name: string; isRoomCreator: boolean } | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load player info from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('blackjack_player');
    if (stored) {
      try {
        const info = JSON.parse(stored);
        setPlayerInfo(info);
      } catch (error) {
        console.error('Failed to parse player info:', error);
        router.push('/');
        return;
      }
    } else {
      router.push('/');
      return;
    }
    setIsLoading(false);
  }, [router]);

  // Initialize game state
  const {
    room,
    currentPlayer,
    isCurrentPlayerTurn,
    availableActions,
    gameMessage,
    processAction,
    processEvent,
    initializeRoom,
    error: gameError,
    clearError
  } = useGameState({
    playerId: playerInfo?.id || '',
    playerName: playerInfo?.name || ''
  });

  // Handle game actions
  const handleGameAction = useCallback((actionType: string, amount?: number) => {
    if (!playerInfo) return;
    
    const action: GameAction = {
      type: actionType as any,
      playerId: playerInfo.id,
      amount,
      handIndex: 0
    };
    
    processAction(action);
    sendAction(action);
  }, [playerInfo, processAction]);

  // Handle room updates from WebSocket
  const handleRoomUpdate = useCallback((updatedRoom: GameRoom) => {
    // In a real implementation, this would update the room state
    console.log('Room updated:', updatedRoom);
  }, []);

  // Handle game events from WebSocket
  const handleGameEvent = useCallback((event: GameEvent) => {
    processEvent(event);
  }, [processEvent]);

  // Handle connection errors
  const handleConnectionError = useCallback((error: string) => {
    setConnectionError(error);
  }, []);

  // WebSocket connection
  const { isConnected, sendAction, reconnect } = useGameSocket({
    roomId,
    playerId: playerInfo?.id || '',
    onRoomUpdate: handleRoomUpdate,
    onGameEvent: handleGameEvent,
    onError: handleConnectionError
  });

  // Initialize room when component loads
  useEffect(() => {
    if (playerInfo && !room) {
      if (playerInfo.isRoomCreator) {
        initializeRoom(`${playerInfo.name}'s Game`);
      } else {
        // In a real implementation, this would fetch the existing room
        initializeRoom('Existing Game');
      }
    }
  }, [playerInfo, room, initializeRoom]);

  // Handle leaving the game
  const handleLeaveGame = useCallback(() => {
    if (currentPlayer) {
      handleGameAction('leave');
    }
    localStorage.removeItem('blackjack_player');
    router.push('/');
  }, [currentPlayer, handleGameAction, router]);

  // Audio effects (placeholder for future implementation)
  const playSound = useCallback((soundType: string) => {
    // In a real implementation, this would play audio effects
    console.log(`Playing sound: ${soundType}`);
  }, []);

  // Play sounds based on game events
  useEffect(() => {
    if (room?.gameState === 'dealing') {
      playSound('cardDeal');
    }
  }, [room?.gameState, playSound]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xl text-white">Loading game...</div>
        </div>
      </div>
    );
  }

  if (!playerInfo) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-xl text-red-400">Player information not found</div>
          <Button onClick={() => router.push('/')} variant="outline">
            Return to Lobby
          </Button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xl text-white">Setting up game room...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Error Messages */}
      {(gameError || connectionError) && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <span>⚠️</span>
            <span>{gameError || connectionError}</span>
            <button 
              onClick={() => {
                clearError();
                setConnectionError(null);
              }}
              className="ml-2 text-red-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
            <span>Reconnecting...</span>
            <button 
              onClick={reconnect}
              className="ml-2 text-yellow-200 hover:text-white underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Game Interface */}
      <GameTable
        room={room}
        currentPlayer={currentPlayer}
        isCurrentPlayerTurn={isCurrentPlayerTurn}
        availableActions={availableActions}
        onAction={handleGameAction}
        gameMessage={gameMessage}
      />

      {/* Game Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <Button
          onClick={handleLeaveGame}
          variant="outline"
          className="bg-black/40 backdrop-blur-sm border-red-600/50 text-red-400 hover:bg-red-600/20"
        >
          Leave Game
        </Button>
        
        {/* Settings Button (placeholder for future implementation) */}
        <Button
          variant="outline"
          className="bg-black/40 backdrop-blur-sm border-gray-600/50 text-gray-400 hover:bg-gray-600/20"
        >
          ⚙️
        </Button>
      </div>

      {/* Mobile Controls Helper */}
      <div className="md:hidden absolute top-20 right-4 bg-black/40 backdrop-blur-sm rounded-lg p-2 border border-gray-600/30">
        <div className="text-xs text-gray-300">
          Tap cards and buttons to play
        </div>
      </div>

      {/* Game Statistics (overlay for results) */}
      {room.gameState === 'results' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 max-w-md w-full mx-4 border border-gray-600 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Round Results</h3>
            
            <div className="space-y-4">
              {room.players.map(player => {
                const hand = player.hands[0];
                const isWinner = !hand.isBust && (room.dealer.hand.isBust || hand.value > room.dealer.hand.value);
                const isBlackjack = hand.isBlackjack && !room.dealer.hand.isBlackjack;
                
                return (
                  <div key={player.id} className={`
                    p-3 rounded-lg border ${
                      player.id === playerInfo.id ? 'border-yellow-400 bg-yellow-900/20' : 'border-gray-600 bg-gray-800/50'
                    }
                  `}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">{player.name}</span>
                      <div className="text-right">
                        <div className={`
                          font-bold ${
                            hand.isBust ? 'text-red-400' :
                            isBlackjack ? 'text-yellow-400' :
                            isWinner ? 'text-green-400' :
                            'text-gray-400'
                          }
                        `}>
                          {hand.isBust ? 'BUST' :
                           isBlackjack ? 'BLACKJACK!' :
                           isWinner ? 'WIN' :
                           'LOSE'}
                        </div>
                        <div className="text-sm text-gray-300">
                          {hand.value} vs {room.dealer.hand.value}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-400 mb-4">
                New round starting automatically...
              </div>
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}