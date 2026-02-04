import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import type { UpdateProfileInput } from '../validators/user.validator.js';
import { achievementService } from './achievement.service.js';

export class UserService {
  async getProfile(username: string, currentUserId?: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            tweets: { where: { parentId: null, retweetOfId: null } },
            followers: true,
            following: true,
          },
        },
        achievements: {
          include: { achievement: true },
        },
        followers: currentUserId
          ? { where: { followerId: currentUserId } }
          : false,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password: _, followers, ...userData } = user;
    return {
      ...userData,
      lastPostDate: user.lastPostDate?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      followersCount: user._count.followers,
      followingCount: user._count.following,
      tweetsCount: user._count.tweets,
      isFollowing: currentUserId ? (followers as unknown[]).length > 0 : false,
      achievements: user.achievements.map((ua) => ({
        ...ua.achievement,
        unlockedAt: ua.unlockedAt.toISOString(),
      })),
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        banner: true,
        location: true,
        website: true,
        streak: true,
        lastPostDate: true,
        totalReactions: true,
        soundEnabled: true,
        focusMode: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: { avatar: true },
    });
  }

  async updateBanner(userId: string, bannerUrl: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { banner: bannerUrl },
      select: { banner: true },
    });
  }

  async follow(followerId: string, username: string) {
    const userToFollow = await prisma.user.findUnique({
      where: { username },
    });

    if (!userToFollow) {
      throw new NotFoundError('User not found');
    }

    if (userToFollow.id === followerId) {
      throw new Error('Cannot follow yourself');
    }

    await prisma.follow.create({
      data: {
        followerId,
        followingId: userToFollow.id,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'follow',
        recipientId: userToFollow.id,
        senderId: followerId,
      },
    });

    // Check achievements
    await achievementService.checkFollowAchievements(followerId);

    return { message: 'Successfully followed user' };
  }

  async unfollow(followerId: string, username: string) {
    const userToUnfollow = await prisma.user.findUnique({
      where: { username },
    });

    if (!userToUnfollow) {
      throw new NotFoundError('User not found');
    }

    await prisma.follow.deleteMany({
      where: {
        followerId,
        followingId: userToUnfollow.id,
      },
    });

    return { message: 'Successfully unfollowed user' };
  }

  async getFollowers(username: string, currentUserId?: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        followers: {
          include: {
            follower: {
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
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!currentUserId) {
      return user.followers.map((f) => ({
        ...f.follower,
        isFollowing: false,
      }));
    }

    const following = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: user.followers.map((f) => f.follower.id) },
      },
    });

    const followingIds = new Set(following.map((f) => f.followingId));

    return user.followers.map((f) => ({
      ...f.follower,
      isFollowing: followingIds.has(f.follower.id),
    }));
  }

  async getFollowing(username: string, currentUserId?: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        following: {
          include: {
            following: {
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
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!currentUserId) {
      return user.following.map((f) => ({
        ...f.following,
        isFollowing: false,
      }));
    }

    const following = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: user.following.map((f) => f.following.id) },
      },
    });

    const followingIds = new Set(following.map((f) => f.followingId));

    return user.following.map((f) => ({
      ...f.following,
      isFollowing: followingIds.has(f.following.id),
    }));
  }

  async getSuggestedUsers(userId: string, limit = 5) {
    // Get users that the current user is not following
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    followingIds.push(userId); // Exclude self

    const users = await prisma.user.findMany({
      where: {
        id: { notIn: followingIds },
      },
      orderBy: [
        { followers: { _count: 'desc' } },
        { totalReactions: 'desc' },
      ],
      take: limit,
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        streak: true,
        _count: {
          select: { followers: true },
        },
      },
    });

    return users.map((u) => ({
      ...u,
      followersCount: u._count.followers,
    }));
  }
}

export const userService = new UserService();
