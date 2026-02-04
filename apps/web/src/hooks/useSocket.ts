import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import type { Notification, Message } from '@chirp/shared';

type SocketEvents = {
  'notification:new': (notification: Notification) => void;
  'message:new': (message: Message) => void;
  'message:read': (data: { readerId: string }) => void;
  'tweet:reaction': (data: { tweetId: string; reactionCounts: Record<string, number> }) => void;
};

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    socketRef.current = io({
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, token]);

  const on = useCallback(<K extends keyof SocketEvents>(
    event: K,
    callback: SocketEvents[K]
  ) => {
    if (socketRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socketRef.current.on(event, callback as any);
    }
    return () => {
      if (socketRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketRef.current.off(event, callback as any);
      }
    };
  }, []);

  const emit = useCallback((event: string, data?: unknown) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return { on, emit, socket: socketRef.current };
}
