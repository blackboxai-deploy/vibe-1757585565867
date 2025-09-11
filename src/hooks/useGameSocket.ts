'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameRoom, GameAction, GameEvent } from '@/types/game';

interface UseGameSocketProps {
  roomId: string;
  playerId: string;
  onRoomUpdate: (room: GameRoom) => void;
  onGameEvent: (event: GameEvent) => void;
  onError: (error: string) => void;
}

interface UseGameSocketReturn {
  isConnected: boolean;
  sendAction: (action: GameAction) => void;
  disconnect: () => void;
  reconnect: () => void;
}

export function useGameSocket({
  roomId,
  playerId,
  onRoomUpdate,
  onGameEvent,
  onError
}: UseGameSocketProps): UseGameSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      // In a real implementation, this would be a WebSocket server URL
      // For now, we'll simulate WebSocket functionality
      const wsUrl = `ws://localhost:3001/game/${roomId}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        
        // Send initial join message
        ws.send(JSON.stringify({
          type: 'join',
          playerId,
          roomId
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'room-update':
              onRoomUpdate(data.room);
              break;
            case 'game-event':
              onGameEvent(data.event);
              break;
            case 'error':
              onError(data.message);
              break;
            default:
              console.warn('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            connect();
          }, delay);
        } else {
          onError('Failed to reconnect to game server');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError('Connection error occurred');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      // Fallback to simulated multiplayer for demo purposes
      simulateConnection();
    }
  }, [roomId, playerId, onRoomUpdate, onGameEvent, onError]);

  const simulateConnection = useCallback(() => {
    // Simulate connection for demo purposes when WebSocket server is not available
    console.log('Using simulated multiplayer connection');
    setIsConnected(true);
    
    // Simulate periodic game events
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        onGameEvent({
          type: 'player-joined',
          playerId: 'bot-' + Math.random().toString(36).substring(7),
          data: { name: 'Bot Player' },
          timestamp: new Date()
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [onGameEvent]);

  const sendAction = useCallback((action: GameAction) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'action',
        action,
        roomId,
        timestamp: new Date().toISOString()
      }));
    } else {
      // Fallback for demo - simulate action processing
      console.log('Simulating action:', action);
      
      // In a real implementation, actions would be processed server-side
      // For demo, we'll trigger events locally
      setTimeout(() => {
        onGameEvent({
          type: 'bet-placed',
          playerId: action.playerId,
          data: { amount: action.amount },
          timestamp: new Date()
        });
      }, 100);
    }
  }, [roomId, onGameEvent]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Heartbeat to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const heartbeatInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [isConnected]);

  return {
    isConnected,
    sendAction,
    disconnect,
    reconnect
  };
}