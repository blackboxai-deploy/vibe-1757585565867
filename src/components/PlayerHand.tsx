'use client';

import { Player, GameState } from '@/types/game';
import { SUIT_SYMBOLS, SUIT_COLORS } from '@/lib/cardUtils';

interface PlayerHandProps {
  player: Player;
  isActive: boolean;
  isCurrentPlayer: boolean;
  gameState: GameState;
}

export function PlayerHand({ player, isActive, isCurrentPlayer, gameState }: PlayerHandProps) {
  const primaryHand = player.hands[0];
  const hasCards = primaryHand && primaryHand.cards.length > 0;

  return (
    <div className={`relative transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
      {/* Player Info Card */}
      <div className={`
        bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 min-w-[140px] 
        border-2 shadow-lg backdrop-blur-sm
        ${isCurrentPlayer ? 'border-yellow-400 bg-yellow-900/20' : 'border-gray-600'}
        ${isActive ? 'ring-2 ring-green-400 ring-opacity-50' : ''}
      `}>
        {/* Player Avatar and Name */}
        <div className="flex items-center space-x-2 mb-2">
          <div className="relative">
            <img
              src={player.avatar || `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ed6f0949-fde9-4247-a1e5-e1e7b40297bf.png}`}
              alt={player.name}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"
            />
            {isActive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-white truncate max-w-[80px]">
              {player.name}
            </div>
            <div className="text-xs text-gray-400">
              ${player.chips.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Current Bet */}
        {player.currentBet > 0 && (
          <div className="mb-2 text-center">
            <div className="bg-red-600 text-white text-xs px-2 py-1 rounded-full inline-block">
              Bet: ${player.currentBet}
            </div>
          </div>
        )}

        {/* Hand Display */}
        {hasCards && (
          <div className="space-y-2">
            {/* Cards */}
            <div className="flex justify-center">
              <div className="flex -space-x-3">
                {primaryHand.cards.map((card, index) => (
                  <div
                    key={card.id}
                    className={`
                      relative w-12 h-16 bg-white rounded border shadow-md transform transition-all duration-300
                      ${index > 0 ? 'hover:translate-y-[-4px]' : ''}
                    `}
                    style={{ zIndex: index }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-xs">
                      <div className={`font-bold ${SUIT_COLORS[card.suit]}`}>
                        {card.rank}
                      </div>
                      <div className={`text-lg ${SUIT_COLORS[card.suit]}`}>
                        {SUIT_SYMBOLS[card.suit]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hand Value */}
            <div className="text-center">
              <div className={`
                text-sm font-bold px-2 py-1 rounded inline-block
                ${primaryHand.isBust ? 'bg-red-600 text-white' : 
                  primaryHand.isBlackjack ? 'bg-yellow-500 text-black' : 
                  'bg-gray-700 text-white'}
              `}>
                {primaryHand.isBust ? 'BUST' : 
                 primaryHand.isBlackjack ? 'BLACKJACK!' : 
                 `${primaryHand.value}${primaryHand.isSoft && primaryHand.value !== 21 ? ' (soft)' : ''}`}
              </div>
            </div>

            {/* Split Hands */}
            {player.hasSplit && player.hands.length > 1 && (
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="text-xs text-gray-400 mb-1">Split Hand:</div>
                <div className="flex justify-center">
                  <div className="flex -space-x-2">
                    {player.hands[1].cards.map((card, index) => (
                      <div
                        key={card.id}
                        className="relative w-10 h-12 bg-white rounded border shadow-sm"
                        style={{ zIndex: index }}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-xs">
                          <div className={`font-bold ${SUIT_COLORS[card.suit]}`}>
                            {card.rank}
                          </div>
                          <div className={`text-sm ${SUIT_COLORS[card.suit]}`}>
                            {SUIT_SYMBOLS[card.suit]}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center mt-1">
                  <div className={`
                    text-xs px-1 py-0.5 rounded inline-block
                    ${player.hands[1].isBust ? 'bg-red-600 text-white' : 
                      player.hands[1].isBlackjack ? 'bg-yellow-500 text-black' : 
                      'bg-gray-700 text-white'}
                  `}>
                    {player.hands[1].isBust ? 'BUST' : 
                     player.hands[1].isBlackjack ? 'BJ!' : 
                     player.hands[1].value}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Indicators */}
        <div className="flex flex-wrap gap-1 mt-2 justify-center">
          {player.hasStood && (
            <div className="bg-blue-600 text-white text-xs px-1 py-0.5 rounded">
              STAND
            </div>
          )}
          {player.hasDoubledDown && (
            <div className="bg-purple-600 text-white text-xs px-1 py-0.5 rounded">
              DOUBLE
            </div>
          )}
          {player.hasSplit && (
            <div className="bg-orange-600 text-white text-xs px-1 py-0.5 rounded">
              SPLIT
            </div>
          )}
        </div>

        {/* Empty State */}
        {!hasCards && gameState !== 'waiting' && (
          <div className="text-center py-4">
            <div className="text-xs text-gray-400">
              Waiting for cards...
            </div>
          </div>
        )}
      </div>

      {/* Turn Indicator */}
      {isActive && gameState === 'playing' && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse">
            Your Turn
          </div>
        </div>
      )}

      {/* Current Player Indicator */}
      {isCurrentPlayer && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
        </div>
      )}
    </div>
  );
}