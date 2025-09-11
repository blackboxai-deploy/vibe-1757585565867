'use client';

import { GameRoom, Player } from '@/types/game';
import { PlayerHand } from './PlayerHand';
import { DealerHand } from './DealerHand';
import { ControlPanel } from './ControlPanel';
import { BettingPanel } from './BettingPanel';

interface GameTableProps {
  room: GameRoom;
  currentPlayer: Player | null;
  isCurrentPlayerTurn: boolean;
  availableActions: string[];
  onAction: (action: string, amount?: number) => void;
  gameMessage: string;
}

export function GameTable({
  room,
  currentPlayer,
  isCurrentPlayerTurn,
  availableActions,
  onAction,
  gameMessage
}: GameTableProps) {
  const getPlayerPosition = (index: number, total: number) => {
    // Calculate player positions around the table
    const baseAngle = -180; // Start from bottom
    const angleStep = 360 / Math.max(6, total); // Distribute around circle, minimum 6 positions
    const angle = baseAngle + (index * angleStep);
    const radius = 200; // Distance from center
    
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    
    return { x, y, angle };
  };

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Game Table Background */}
      <div className="absolute inset-0 bg-gradient-radial from-green-800 via-green-900 to-green-950">
        {/* Table felt pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Main Game Area */}
      <div className="relative h-full flex flex-col">
        {/* Game Status Header */}
        <div className="bg-black/20 border-b border-green-700/30 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-white">{room.name}</h2>
              <div className="flex items-center space-x-2 text-sm text-green-200">
                <span>•</span>
                <span>{room.players.length}/{room.maxPlayers} Players</span>
                <span>•</span>
                <span>Bets: ${room.minBet}-${room.maxBet}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-semibold text-white">{gameMessage}</div>
              {currentPlayer && (
                <div className="text-sm text-green-200">
                  Chips: ${currentPlayer.chips.toLocaleString()}
                  {currentPlayer.currentBet > 0 && (
                    <span className="ml-2">• Bet: ${currentPlayer.currentBet}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Table */}
        <div className="flex-1 relative flex items-center justify-center p-8">
          <div className="relative w-full max-w-4xl h-96">
            {/* Table Oval */}
            <div className="absolute inset-0 bg-green-800 rounded-full border-8 border-yellow-600 shadow-2xl">
              <div className="absolute inset-4 bg-green-700 rounded-full border-2 border-yellow-500/30" />
            </div>

            {/* Dealer Position (Top Center) */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <DealerHand 
                dealer={room.dealer}
                gameState={room.gameState}
              />
            </div>

            {/* Player Positions */}
            {room.players.map((player, index) => {
              const position = getPlayerPosition(index, room.players.length);
              const isActive = room.currentPlayerIndex === index;
              const isCurrentPlayer = currentPlayer?.id === player.id;
              
              return (
                <div
                  key={player.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(50% + ${position.x}px)`,
                    top: `calc(50% + ${position.y}px)`,
                  }}
                >
                  <PlayerHand
                    player={player}
                    isActive={isActive}
                    isCurrentPlayer={isCurrentPlayer}
                    gameState={room.gameState}
                  />
                </div>
              );
            })}

            {/* Center Table Logo */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="text-2xl font-bold text-black">21</div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Areas */}
        <div className="bg-black/20 border-t border-green-700/30 p-4">
          <div className="max-w-7xl mx-auto">
            {currentPlayer && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Betting Panel */}
                {(room.gameState === 'waiting' || room.gameState === 'betting') && (
                  <BettingPanel
                    player={currentPlayer}
                    minBet={room.minBet}
                    maxBet={room.maxBet}
                    onPlaceBet={(amount) => onAction('bet', amount)}
                  />
                )}

                {/* Control Panel */}
                {room.gameState === 'playing' && isCurrentPlayerTurn && (
                  <ControlPanel
                    availableActions={availableActions}
                    onAction={onAction}
                    player={currentPlayer}
                  />
                )}
              </div>
            )}

            {/* Game Instructions */}
            {room.gameState === 'waiting' && (
              <div className="text-center py-8">
                <div className="text-lg text-white mb-2">Waiting for more players...</div>
                <div className="text-green-300">Game will start automatically when ready</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Turn Indicator */}
      {room.gameState === 'playing' && (
        <div className="absolute top-20 right-4 bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-green-600/30">
          <div className="text-sm text-green-200 mb-1">Current Turn:</div>
          <div className="text-lg font-semibold text-white">
            {room.players[room.currentPlayerIndex]?.name || 'Unknown'}
          </div>
          {isCurrentPlayerTurn && (
            <div className="text-xs text-yellow-400 mt-1 animate-pulse">
              Your turn!
            </div>
          )}
        </div>
      )}

      {/* Connection Status */}
      <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-green-600/30">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-sm text-green-200">Online</span>
      </div>
    </div>
  );
}