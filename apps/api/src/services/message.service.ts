import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import type { SendMessageInput } from '../validators/message.validator.js';

export class MessageService {
  async getConversations(userId: string) {
    // Get all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
            streak: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
            streak: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner
    const conversationsMap = new Map<string, {
      user: any;
      lastMessage: any;
      unreadCount: number;
    }>();

    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;

      if (!conversationsMap.has(partnerId)) {
        const unreadCount = await prisma.message.count({
          where: {
            senderId: partnerId,
            receiverId: userId,
            read: false,
          },
        });

        conversationsMap.set(partnerId, {
          user: partner,
          lastMessage: {
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            sender: msg.sender,
            receiverId: msg.receiverId,
            receiver: msg.receiver,
            read: msg.read,
            createdAt: msg.createdAt.toISOString(),
          },
          unreadCount,
        });
      }
    }

    return Array.from(conversationsMap.values());
  }

  async getConversation(userId: string, username: string, cursor?: string, limit = 50) {
    const otherUser = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        streak: true,
      },
    });

    if (!otherUser) {
      throw new NotFoundError('User not found');
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUser.id },
          { senderId: otherUser.id, receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
            streak: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
            streak: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUser.id,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    });

    const hasMore = messages.length > limit;
    const data = messages.slice(0, limit).map((m) => ({
      id: m.id,
      content: m.content,
      senderId: m.senderId,
      sender: m.sender,
      receiverId: m.receiverId,
      receiver: m.receiver,
      read: m.read,
      createdAt: m.createdAt.toISOString(),
    }));

    return {
      user: otherUser,
      data: data.reverse(), // Return in chronological order
      nextCursor: hasMore ? data[0]?.id : null,
      hasMore,
    };
  }

  async sendMessage(senderId: string, input: SendMessageInput) {
    const receiver = await prisma.user.findUnique({
      where: { id: input.receiverId },
    });

    if (!receiver) {
      throw new NotFoundError('Receiver not found');
    }

    const message = await prisma.message.create({
      data: {
        content: input.content,
        senderId,
        receiverId: input.receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
            streak: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
            streak: true,
          },
        },
      },
    });

    return {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      sender: message.sender,
      receiverId: message.receiverId,
      receiver: message.receiver,
      read: message.read,
      createdAt: message.createdAt.toISOString(),
    };
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        read: false,
      },
    });

    return { count };
  }
}

export const messageService = new MessageService();
