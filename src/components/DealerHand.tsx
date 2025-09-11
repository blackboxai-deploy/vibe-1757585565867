'use client';

import { Dealer, GameState } from '@/types/game';
import { SUIT_SYMBOLS, SUIT_COLORS } from '@/lib/cardUtils';

interface DealerHandProps {
  dealer: Dealer;
  gameState: GameState;
}

export function DealerHand({ dealer, gameState }: DealerHandProps) {
  const hasCards = dealer.hand.cards.length > 0;
  const shouldShowHoleCard = dealer.holeCardRevealed || gameState === 'results' || gameState === 'finished';

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Dealer Label */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 rounded-lg border border-gray-600 shadow-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-white">DEALER</div>
          {gameState === 'dealer' && (
            <div className="text-xs text-yellow-400 animate-pulse">Playing...</div>
          )}
        </div>
      </div>

      {/* Cards Display */}
      {hasCards && (
        <div className="flex flex-col items-center space-y-2">
          {/* Cards */}
          <div className="flex -space-x-4">
            {dealer.hand.cards.map((card, index) => {
              const isHoleCard = index === 1 && !shouldShowHoleCard;
              
              return (
                <div
                  key={isHoleCard ? 'hole-card' : card.id}
                  className={`
                    relative w-16 h-24 rounded-lg border shadow-lg transform transition-all duration-500
                    ${isHoleCard ? 'bg-gradient-to-br from-red-800 to-red-900' : 'bg-white'}
                    ${index > 0 ? 'hover:translate-y-[-4px]' : ''}
                    ${isHoleCard && shouldShowHoleCard ? 'animate-flip' : ''}
                  `}
                  style={{ zIndex: index }}
                >
                  {isHoleCard ? (
                    // Hole card (face down)
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-xl">🂠</div>
                    </div>
                  ) : (
                    // Face up card
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className={`text-lg font-bold ${SUIT_COLORS[card.suit]}`}>
                          {card.rank}
                        </div>
                        <div className={`text-2xl ${SUIT_COLORS[card.suit]}`}>
                          {SUIT_SYMBOLS[card.suit]}
                        </div>
                        <div className={`text-lg font-bold ${SUIT_COLORS[card.suit]} transform rotate-180`}>
                          {card.rank}
                        </div>
                      </div>
                      
                      {/* Corner symbols */}
                      <div className={`absolute top-1 left-1 text-xs font-bold ${SUIT_COLORS[card.suit]}`}>
                        <div>{card.rank}</div>
                        <div className="text-sm">{SUIT_SYMBOLS[card.suit]}</div>
                      </div>
                      <div className={`absolute bottom-1 right-1 text-xs font-bold ${SUIT_COLORS[card.suit]} transform rotate-180`}>
                        <div>{card.rank}</div>
                        <div className="text-sm">{SUIT_SYMBOLS[card.suit]}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Hand Value */}
          <div className="text-center">
            {shouldShowHoleCard ? (
              <div className={`
                text-lg font-bold px-3 py-1 rounded-lg inline-block shadow-md
                ${dealer.hand.isBust ? 'bg-red-600 text-white' : 
                  dealer.hand.isBlackjack ? 'bg-yellow-500 text-black' : 
                  'bg-gray-800 text-white border border-gray-600'}
              `}>
                {dealer.hand.isBust ? 'BUST' : 
                 dealer.hand.isBlackjack ? 'BLACKJACK!' : 
                 `${dealer.hand.value}${dealer.hand.isSoft && dealer.hand.value !== 21 ? ' (soft)' : ''}`}
              </div>
            ) : (
              <div className="bg-gray-800 text-white text-lg font-bold px-3 py-1 rounded-lg border border-gray-600 shadow-md">
                {dealer.hand.cards.length > 0 ? `${dealer.hand.cards[0].value} + ?` : '?'}
              </div>
            )}
          </div>

          {/* Dealer Status */}
          {gameState === 'results' && (
            <div className="text-center">
              {dealer.hand.isBust ? (
                <div className="text-red-400 font-semibold">Dealer Busts!</div>
              ) : dealer.hand.isBlackjack ? (
                <div className="text-yellow-400 font-semibold">Dealer Blackjack!</div>
              ) : (
                <div className="text-green-400 font-semibold">Dealer Stands on {dealer.hand.value}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasCards && gameState !== 'waiting' && (
        <div className="w-32 h-20 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-sm">No Cards</div>
        </div>
      )}

      {/* Game Rules Reminder */}
      {gameState === 'waiting' && (
        <div className="bg-black/20 rounded-lg p-3 border border-gray-600/30 backdrop-blur-sm">
          <div className="text-xs text-gray-300 text-center max-w-48">
            Dealer hits on 16 and below, stands on 17 and above
          </div>
        </div>
      )}
    </div>
  );
}

/* Custom CSS for card flip animation */
const styles = `
  @keyframes flip {
    0% { transform: rotateY(0deg); }
    50% { transform: rotateY(90deg); }
    100% { transform: rotateY(0deg); }
  }
  
  .animate-flip {
    animation: flip 0.6s ease-in-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}