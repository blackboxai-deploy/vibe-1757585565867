'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameRoom } from '@/types/game';

interface LobbyProps {
  onCreateRoom: (roomName: string, playerName: string) => void;
  onJoinRoom: (room: GameRoom, playerName: string) => void;
}

// Mock rooms for demonstration
const mockRooms: GameRoom[] = [
  {
    id: 'room-1',
    name: 'High Rollers Table',
    players: [
      { id: '1', name: 'Alice', chips: 2500, currentBet: 0, hands: [], activeHandIndex: 0, hasDoubledDown: false, hasSplit: false, isActive: false, hasStood: false },
      { id: '2', name: 'Bob', chips: 1800, currentBet: 0, hands: [], activeHandIndex: 0, hasDoubledDown: false, hasSplit: false, isActive: false, hasStood: false },
      { id: '3', name: 'Charlie', chips: 3200, currentBet: 0, hands: [], activeHandIndex: 0, hasDoubledDown: false, hasSplit: false, isActive: false, hasStood: false }
    ],
    dealer: {
      hand: { cards: [], value: 0, isSoft: false, isBust: false, isBlackjack: false },
      isActive: false,
      holeCardRevealed: false
    },
    deck: [],
    gameState: 'waiting',
    currentPlayerIndex: -1,
    maxPlayers: 6,
    minBet: 25,
    maxBet: 1000,
    createdAt: new Date(),
    isStarted: false
  },
  {
    id: 'room-2',
    name: 'Beginner Friendly',
    players: [
      { id: '4', name: 'Diana', chips: 1000, currentBet: 0, hands: [], activeHandIndex: 0, hasDoubledDown: false, hasSplit: false, isActive: false, hasStood: false }
    ],
    dealer: {
      hand: { cards: [], value: 0, isSoft: false, isBust: false, isBlackjack: false },
      isActive: false,
      holeCardRevealed: false
    },
    deck: [],
    gameState: 'waiting',
    currentPlayerIndex: -1,
    maxPlayers: 4,
    minBet: 10,
    maxBet: 100,
    createdAt: new Date(),
    isStarted: false
  }
];

export function Lobby({ onCreateRoom, onJoinRoom }: LobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateRoom = () => {
    if (!roomName.trim() || !playerName.trim()) return;
    onCreateRoom(roomName.trim(), playerName.trim());
  };

  const handleJoinRoom = (room: GameRoom) => {
    if (!playerName.trim()) return;
    onJoinRoom(room, playerName.trim());
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="max-w-6xl w-full space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Welcome to Blackjack
          </h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Join up to 6 players in real-time multiplayer blackjack. Test your skills, place your bets, and beat the dealer!
          </p>
        </div>

        {/* Player Name Input */}
        <Card className="max-w-md mx-auto bg-black/20 border-green-700/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-white">Enter Your Name</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Your name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-black/20 border-green-600/50 text-white placeholder-green-300/70 focus:border-green-400"
              maxLength={20}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        {playerName.trim() && (
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 text-lg font-semibold"
            >
              Create New Room
            </Button>
            <div className="text-green-300">or</div>
            <div className="text-lg text-green-100 font-medium">Join an existing room below</div>
          </div>
        )}

        {/* Create Room Form */}
        {showCreateForm && playerName.trim() && (
          <Card className="max-w-md mx-auto bg-black/20 border-green-700/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center text-white">Create New Room</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="Room name..."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="bg-black/20 border-green-600/50 text-white placeholder-green-300/70 focus:border-green-400"
                maxLength={30}
              />
              <div className="flex gap-3">
                <Button 
                  onClick={handleCreateRoom}
                  disabled={!roomName.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Create Room
                </Button>
                <Button 
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="border-green-600/50 text-green-300 hover:bg-green-600/10"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Rooms */}
        {playerName.trim() && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-white">Available Rooms</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockRooms.map((room) => (
                <Card key={room.id} className="bg-black/20 border-green-700/30 backdrop-blur-sm hover:bg-black/30 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{room.name}</CardTitle>
                      <Badge 
                        variant={room.players.length < room.maxPlayers ? "default" : "destructive"}
                        className={room.players.length < room.maxPlayers ? "bg-green-600" : "bg-red-600"}
                      >
                        {room.players.length}/{room.maxPlayers}
                      </Badge>
                    </div>
                    <CardDescription className="text-green-200">
                      Bets: ${room.minBet} - ${room.maxBet}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm text-green-100">Players:</div>
                      <div className="flex flex-wrap gap-1">
                        {room.players.map((player) => (
                          <Badge key={player.id} variant="outline" className="border-green-600/50 text-green-300 text-xs">
                            {player.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleJoinRoom(room)}
                      disabled={room.players.length >= room.maxPlayers}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:from-gray-600 disabled:to-gray-600"
                    >
                      {room.players.length >= room.maxPlayers ? 'Room Full' : 'Join Room'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {mockRooms.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎲</div>
                <h3 className="text-xl font-semibold text-white mb-2">No rooms available</h3>
                <p className="text-green-200">Be the first to create a room and start playing!</p>
              </div>
            )}
          </div>
        )}

        {/* Game Rules Summary */}
        <Card className="max-w-4xl mx-auto bg-black/10 border-green-700/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-white">Quick Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-green-100">
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Objective:</h4>
                <p className="text-sm">Get your hand value as close to 21 as possible without going over, while beating the dealer's hand.</p>
                
                <h4 className="font-semibold text-white mt-4">Card Values:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Number cards: Face value (2-10)</li>
                  <li>• Face cards: 10 points each</li>
                  <li>• Aces: 1 or 11 (whichever is better)</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Actions:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Hit:</strong> Take another card</li>
                  <li>• <strong>Stand:</strong> Keep your current hand</li>
                  <li>• <strong>Double:</strong> Double your bet and take one card</li>
                  <li>• <strong>Split:</strong> Split pairs into two hands</li>
                </ul>
                
                <h4 className="font-semibold text-white mt-4">Winning:</h4>
                <p className="text-sm">Blackjack (21 with 2 cards) pays 3:2. Regular wins pay 1:1.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}