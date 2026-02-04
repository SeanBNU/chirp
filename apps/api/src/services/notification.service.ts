import { prisma } from '../config/database.js';

export class NotificationService {
  async getNotifications(userId: string, cursor?: string, limit = 20) {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: userId },
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
        tweet: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    const hasMore = notifications.length > limit;
    const data = notifications.slice(0, limit).map((n) => ({
      id: n.id,
      type: n.type,
      recipientId: n.recipientId,
      sender: n.sender,
      tweetId: n.tweetId,
      tweet: n.tweet,
      reactionType: n.reactionType,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id : null,
      hasMore,
    };
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: {
        recipientId: userId,
        read: false,
      },
    });

    return { count };
  }

  async markAsRead(userId: string, notificationId?: string) {
    if (notificationId) {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          recipientId: userId,
        },
        data: { read: true },
      });
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: {
          recipientId: userId,
          read: false,
        },
        data: { read: true },
      });
    }

    return { message: 'Notifications marked as read' };
  }
}

export const notificationService = new NotificationService();
