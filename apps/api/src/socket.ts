import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

// Store connected users
const connectedUsers = new Map<string, string>(); // userId -> socketId

export function setupSocketHandlers(io: Server) {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    connectedUsers.set(userId, socket.id);
    
    logger.debug(`User ${userId} connected`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      logger.debug(`User ${userId} disconnected`);
    });

    // Mark messages as read
    socket.on('message:read', async (data: { senderId: string }) => {
      // Emit to the sender that their messages were read
      const senderSocketId = connectedUsers.get(data.senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('message:read', { readerId: userId });
      }
    });
  });
}

// Helper functions to emit events
export function emitNotification(io: Server, userId: string, notification: unknown) {
  io.to(`user:${userId}`).emit('notification:new', notification);
}

export function emitMessage(io: Server, userId: string, message: unknown) {
  io.to(`user:${userId}`).emit('message:new', message);
}

export function emitReaction(io: Server, tweetAuthorId: string, data: unknown) {
  io.to(`user:${tweetAuthorId}`).emit('tweet:reaction', data);
}
