'use client';

import { Player } from '@/types/game';
import { Button } from '@/components/ui/button';

interface ControlPanelProps {
  availableActions: string[];
  onAction: (action: string) => void;
  player: Player;
}

export function ControlPanel({ availableActions, onAction, player }: ControlPanelProps) {
  const currentHand = player.hands[player.activeHandIndex];
  const canDouble = availableActions.includes('double');
  const canSplit = availableActions.includes('split');
  const canHit = availableActions.includes('hit');
  const canStand = availableActions.includes('stand');

  const getActionButtonStyle = (action: string) => {
    const baseClasses = "px-6 py-3 font-semibold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg";
    
    switch (action) {
      case 'hit':
        return `${baseClasses} bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white`;
      case 'stand':
        return `${baseClasses} bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white`;
      case 'double':
        return `${baseClasses} bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white`;
      case 'split':
        return `${baseClasses} bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white`;
      default:
        return `${baseClasses} bg-gray-600 hover:bg-gray-700 text-white`;
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'hit':
        return 'Take another card';
      case 'stand':
        return 'Keep your current hand';
      case 'double':
        return `Double your bet (${player.currentBet * 2}) and take one card`;
      case 'split':
        return `Split your pair into two hands (${player.currentBet})`;
      default:
        return '';
    }
  };

  if (availableActions.length === 0) {
    return (
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
        <div className="text-center">
          <div className="text-lg text-gray-400 mb-2">Waiting for other players...</div>
          <div className="text-sm text-gray-500">Your turn will come up soon</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
      <div className="space-y-4">
        {/* Current Hand Info */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white">Your Turn</h3>
            <div className="text-sm text-green-400">
              Hand Value: {currentHand.value}
              {currentHand.isSoft && currentHand.value !== 21 && ' (soft)'}
            </div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-300">
            <span>Current Bet: ${player.currentBet}</span>
            <span>Chips: ${player.chips.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {canHit && (
            <div className="space-y-1">
              <Button 
                onClick={() => onAction('hit')}
                className={getActionButtonStyle('hit')}
                size="lg"
              >
                HIT
              </Button>
              <div className="text-xs text-gray-400 text-center">
                {getActionDescription('hit')}
              </div>
            </div>
          )}
          
          {canStand && (
            <div className="space-y-1">
              <Button 
                onClick={() => onAction('stand')}
                className={getActionButtonStyle('stand')}
                size="lg"
              >
                STAND
              </Button>
              <div className="text-xs text-gray-400 text-center">
                {getActionDescription('stand')}
              </div>
            </div>
          )}
          
          {canDouble && (
            <div className="space-y-1">
              <Button 
                onClick={() => onAction('double')}
                className={getActionButtonStyle('double')}
                size="lg"
                disabled={player.chips < player.currentBet}
              >
                DOUBLE
              </Button>
              <div className="text-xs text-gray-400 text-center">
                {getActionDescription('double')}
              </div>
            </div>
          )}
          
          {canSplit && (
            <div className="space-y-1">
              <Button 
                onClick={() => onAction('split')}
                className={getActionButtonStyle('split')}
                size="lg"
                disabled={player.chips < player.currentBet}
              >
                SPLIT
              </Button>
              <div className="text-xs text-gray-400 text-center">
                {getActionDescription('split')}
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-gray-800/30 rounded p-2">
            <div className="text-gray-400">Cards</div>
            <div className="text-white font-semibold">{currentHand.cards.length}</div>
          </div>
          <div className="bg-gray-800/30 rounded p-2">
            <div className="text-gray-400">Bust Risk</div>
            <div className={`font-semibold ${currentHand.value > 16 ? 'text-red-400' : currentHand.value > 11 ? 'text-yellow-400' : 'text-green-400'}`}>
              {currentHand.value > 16 ? 'HIGH' : currentHand.value > 11 ? 'MED' : 'LOW'}
            </div>
          </div>
          <div className="bg-gray-800/30 rounded p-2">
            <div className="text-gray-400">Soft</div>
            <div className={`font-semibold ${currentHand.isSoft ? 'text-blue-400' : 'text-gray-400'}`}>
              {currentHand.isSoft ? 'YES' : 'NO'}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
          <div className="text-xs text-blue-300">
            💡 <strong>Tip:</strong> {
              currentHand.value < 12 ? "Low risk - consider hitting" :
              currentHand.value < 17 ? "Medium risk - dealer's up card matters" :
              currentHand.value < 21 ? "High risk - consider standing" :
              currentHand.value === 21 ? "Perfect! You have 21" :
              "Bust! Hand is over 21"
            }
          </div>
        </div>
      </div>
    </div>
  );
}