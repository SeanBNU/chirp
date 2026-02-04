import { prisma } from '../config/database.js';
import type { AchievementId } from '@chirp/shared';

export class AchievementService {
  async checkPostAchievements(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tweets: { where: { parentId: null } },
        achievements: true,
      },
    });

    if (!user) return [];

    const newAchievements: AchievementId[] = [];
    const existingIds = new Set(user.achievements.map((a) => a.achievementId));
    const userTweets = user.tweets;

    // First chirp
    if (userTweets.length >= 1 && !existingIds.has('first_chirp')) {
      newAchievements.push('first_chirp');
    }

    // Prolific (50 chirps)
    if (userTweets.length >= 50 && !existingIds.has('prolific')) {
      newAchievements.push('prolific');
    }

    // Code wizard (10 code snippets)
    const codeChirps = userTweets.filter((t) => t.hasCode);
    if (codeChirps.length >= 10 && !existingIds.has('code_wizard')) {
      newAchievements.push('code_wizard');
    }

    // Poll master (5 polls)
    const pollCount = await prisma.poll.count({
      where: { tweet: { authorId: userId } },
    });
    if (pollCount >= 5 && !existingIds.has('poll_master')) {
      newAchievements.push('poll_master');
    }

    // Time-based achievements
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 0 && hour < 6 && !existingIds.has('night_owl')) {
      newAchievements.push('night_owl');
    }
    
    if (hour >= 5 && hour < 7 && !existingIds.has('early_bird')) {
      newAchievements.push('early_bird');
    }

    // Award new achievements
    await this.awardAchievements(userId, newAchievements);
    return newAchievements;
  }

  async checkStreakAchievements(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { achievements: true },
    });

    if (!user) return [];

    const newAchievements: AchievementId[] = [];
    const existingIds = new Set(user.achievements.map((a) => a.achievementId));

    if (user.streak >= 7 && !existingIds.has('streak_week')) {
      newAchievements.push('streak_week');
    }

    if (user.streak >= 30 && !existingIds.has('streak_month')) {
      newAchievements.push('streak_month');
    }

    await this.awardAchievements(userId, newAchievements);
    return newAchievements;
  }

  async checkFollowAchievements(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        following: true,
        followers: true,
        achievements: true,
      },
    });

    if (!user) return [];

    const newAchievements: AchievementId[] = [];
    const existingIds = new Set(user.achievements.map((a) => a.achievementId));

    // Social butterfly (50 following)
    if (user.following.length >= 50 && !existingIds.has('social_butterfly')) {
      newAchievements.push('social_butterfly');
    }

    // Influencer (100 followers)
    if (user.followers.length >= 100 && !existingIds.has('influencer')) {
      newAchievements.push('influencer');
    }

    await this.awardAchievements(userId, newAchievements);
    return newAchievements;
  }

  async checkReplyAchievements(tweetAuthorId: string, tweetId: string) {
    const repliesCount = await prisma.tweet.count({
      where: { parentId: tweetId },
    });

    if (repliesCount < 10) return [];

    const user = await prisma.user.findUnique({
      where: { id: tweetAuthorId },
      include: { achievements: true },
    });

    if (!user) return [];

    const existingIds = new Set(user.achievements.map((a) => a.achievementId));
    
    if (!existingIds.has('conversation_starter')) {
      await this.awardAchievements(tweetAuthorId, ['conversation_starter']);
      return ['conversation_starter' as AchievementId];
    }

    return [];
  }

  async updateStreak(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastPostDate: true, streak: true },
    });

    if (!user) return 0;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let newStreak = 1;
    
    if (user.lastPostDate) {
      const lastPost = new Date(user.lastPostDate);
      const lastPostDay = new Date(
        lastPost.getFullYear(),
        lastPost.getMonth(),
        lastPost.getDate()
      );
      
      const diffDays = Math.floor(
        (today.getTime() - lastPostDay.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        // Same day, no change
        return user.streak;
      } else if (diffDays === 1) {
        // Consecutive day
        newStreak = user.streak + 1;
      }
      // If diffDays > 1, streak resets to 1
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        lastPostDate: now,
      },
    });

    // Check streak achievements
    await this.checkStreakAchievements(userId);

    return newStreak;
  }

  private async awardAchievements(userId: string, achievementIds: AchievementId[]) {
    if (achievementIds.length === 0) return;

    await prisma.userAchievement.createMany({
      data: achievementIds.map((id) => ({
        userId,
        achievementId: id,
      })),
      skipDuplicates: true,
    });
  }
}

export const achievementService = new AchievementService();
