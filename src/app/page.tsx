'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Lobby } from '@/components/Lobby';
import { GameRoom } from '@/types/game';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = useCallback(async (roomName: string, playerName: string) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would make an API call to create a room
      // For demo purposes, we'll simulate room creation and redirect
      
      const roomId = 'room_' + Math.random().toString(36).substring(2, 15);
      
      // Store player info in localStorage for the game session
      localStorage.setItem('blackjack_player', JSON.stringify({
        name: playerName,
        id: 'player_' + Math.random().toString(36).substring(2, 15),
        isRoomCreator: true
      }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to the game room
      router.push(`/game/${roomId}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      // In a real app, show error toast
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleJoinRoom = useCallback(async (room: GameRoom, playerName: string) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would make an API call to join the room
      // For demo purposes, we'll simulate joining and redirect
      
      // Store player info in localStorage for the game session
      localStorage.setItem('blackjack_player', JSON.stringify({
        name: playerName,
        id: 'player_' + Math.random().toString(36).substring(2, 15),
        isRoomCreator: false
      }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to the game room
      router.push(`/game/${room.id}`);
    } catch (error) {
      console.error('Failed to join room:', error);
      // In a real app, show error toast
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xl text-white">Setting up your game...</div>
          <div className="text-green-300">Please wait while we prepare the table</div>
        </div>
      </div>
    );
  }

  return <Lobby onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />;
}