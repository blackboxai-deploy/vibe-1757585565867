'use client';

import { useState } from 'react';
import { Player } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BETTING_CHIPS } from '@/lib/gameLogic';

interface BettingPanelProps {
  player: Player;
  minBet: number;
  maxBet: number;
  onPlaceBet: (amount: number) => void;
}

export function BettingPanel({ player, minBet, maxBet, onPlaceBet }: BettingPanelProps) {
  const [selectedBet, setSelectedBet] = useState(minBet);
  const [customBet, setCustomBet] = useState('');

  const availableChips = BETTING_CHIPS.filter(chip => 
    chip.value >= minBet && chip.value <= maxBet && chip.value <= player.chips
  );

  const handleChipClick = (amount: number) => {
    setSelectedBet(amount);
    setCustomBet('');
  };

  const handleCustomBetChange = (value: string) => {
    setCustomBet(value);
    const numValue = parseInt(value) || 0;
    if (numValue >= minBet && numValue <= maxBet && numValue <= player.chips) {
      setSelectedBet(numValue);
    }
  };

  const handlePlaceBet = () => {
    const betAmount = customBet ? parseInt(customBet) || 0 : selectedBet;
    if (betAmount >= minBet && betAmount <= maxBet && betAmount <= player.chips) {
      onPlaceBet(betAmount);
    }
  };

  const isValidBet = () => {
    const betAmount = customBet ? parseInt(customBet) || 0 : selectedBet;
    return betAmount >= minBet && betAmount <= maxBet && betAmount <= player.chips;
  };

  if (player.currentBet > 0) {
    return (
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
        <div className="text-center space-y-3">
          <div className="text-lg font-semibold text-white">Bet Placed!</div>
          <div className="text-2xl font-bold text-green-400">${player.currentBet}</div>
          <div className="text-sm text-gray-300">
            Waiting for other players to place their bets...
          </div>
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">Place Your Bet</h3>
          <div className="text-sm text-gray-300">
            Available: ${player.chips.toLocaleString()} • Range: ${minBet} - ${maxBet}
          </div>
        </div>

        {/* Betting Chips */}
        <div className="space-y-3">
          <div className="text-sm text-gray-400">Select Chip Amount:</div>
          <div className="grid grid-cols-3 gap-3">
            {availableChips.map((chip) => (
              <button
                key={chip.value}
                onClick={() => handleChipClick(chip.value)}
                className={`
                  relative p-4 rounded-full aspect-square flex items-center justify-center
                  text-white font-bold text-sm shadow-lg transform transition-all duration-200
                  hover:scale-110 active:scale-95 border-2
                  ${selectedBet === chip.value && !customBet
                    ? 'ring-4 ring-yellow-400 ring-opacity-50 scale-110'
                    : 'hover:shadow-xl'
                  }
                  ${chip.color}
                `}
                style={{
                  background: chip.value === selectedBet && !customBet 
                    ? `linear-gradient(135deg, ${chip.color.replace('bg-', '')}, ${chip.color.replace('bg-', '')})` 
                    : undefined
                }}
              >
                <div className="text-center">
                  <div className="text-xs opacity-80">$</div>
                  <div className="font-bold">{chip.value}</div>
                </div>
                
                {/* Chip shine effect */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
              </button>
            ))}
          </div>
        </div>

        {/* Custom Bet Input */}
        <div className="space-y-2">
          <div className="text-sm text-gray-400">Or enter custom amount:</div>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder={`${minBet} - ${maxBet}`}
              value={customBet}
              onChange={(e) => handleCustomBetChange(e.target.value)}
              min={minBet}
              max={Math.min(maxBet, player.chips)}
              className="bg-black/20 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          {customBet && parseInt(customBet) > 0 && (
            <div className="text-xs text-gray-400">
              {parseInt(customBet) < minBet ? `Minimum bet is $${minBet}` :
               parseInt(customBet) > maxBet ? `Maximum bet is $${maxBet}` :
               parseInt(customBet) > player.chips ? 'Insufficient chips' :
               `Betting $${parseInt(customBet)}`}
            </div>
          )}
        </div>

        {/* Selected Bet Display */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Current Bet:</span>
            <span className="text-2xl font-bold text-white">
              ${(customBet ? parseInt(customBet) || 0 : selectedBet).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-gray-400">Remaining after bet:</span>
            <span className="text-green-400">
              ${(player.chips - (customBet ? parseInt(customBet) || 0 : selectedBet)).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handlePlaceBet}
            disabled={!isValidBet()}
            className={`
              flex-1 py-3 text-lg font-semibold transition-all duration-200 transform
              ${isValidBet() 
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-105 active:scale-95'
                : 'bg-gray-600 cursor-not-allowed'
              }
              text-white shadow-lg
            `}
          >
            Place Bet
          </Button>
          
          <Button
            onClick={() => {
              setSelectedBet(minBet);
              setCustomBet('');
            }}
            variant="outline"
            className="px-4 py-3 border-gray-600 text-gray-300 hover:bg-gray-700/50"
          >
            Clear
          </Button>
        </div>

        {/* Quick Bet Options */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <button
            onClick={() => handleChipClick(minBet)}
            className="p-2 bg-gray-800/30 hover:bg-gray-700/50 rounded text-gray-300 transition-colors"
          >
            Min<br/>${minBet}
          </button>
          <button
            onClick={() => handleChipClick(Math.min(Math.floor(maxBet / 2), player.chips))}
            className="p-2 bg-gray-800/30 hover:bg-gray-700/50 rounded text-gray-300 transition-colors"
          >
            Half Max<br/>${Math.min(Math.floor(maxBet / 2), player.chips)}
          </button>
          <button
            onClick={() => handleChipClick(Math.min(maxBet, player.chips))}
            className="p-2 bg-gray-800/30 hover:bg-gray-700/50 rounded text-gray-300 transition-colors"
          >
            Max<br/>${Math.min(maxBet, player.chips)}
          </button>
        </div>

        {/* Betting Tips */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
          <div className="text-xs text-blue-300">
            💰 <strong>Betting Tips:</strong> Start conservative and increase bets when you're winning. 
            Blackjack pays 3:2, so a $100 bet wins $150 plus your original bet back.
          </div>
        </div>
      </div>
    </div>
  );
}