import { prisma } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import type { CreateTweetInput, ReactionInput } from '../validators/tweet.validator.js';
import { achievementService } from './achievement.service.js';
import type { ReactionType, VibeType } from '@chirp/shared';

export class TweetService {
  async create(authorId: string, input: CreateTweetInput) {
    const { content, vibe, hasCode, parentId, poll } = input;

    // Validate parent exists if replying
    if (parentId) {
      const parent = await prisma.tweet.findUnique({ where: { id: parentId } });
      if (!parent) {
        throw new NotFoundError('Parent tweet not found');
      }
    }

    // Create tweet
    const tweet = await prisma.tweet.create({
      data: {
        content,
        authorId,
        vibe,
        hasCode: hasCode || false,
        parentId,
        poll: poll
          ? {
              create: {
                question: poll.question,
                endsAt: poll.endsAt ? new Date(poll.endsAt) : new Date(Date.now() + 24 * 60 * 60 * 1000),
                options: {
                  create: poll.options.map((text) => ({ text })),
                },
              },
            }
          : undefined,
      },
      include: this.getTweetInclude(authorId),
    });

    // Update streak
    await achievementService.updateStreak(authorId);

    // Check achievements
    const newAchievements = await achievementService.checkPostAchievements(authorId);

    // Create notification for reply
    if (parentId) {
      const parent = await prisma.tweet.findUnique({
        where: { id: parentId },
        select: { authorId: true },
      });
      
      if (parent && parent.authorId !== authorId) {
        await prisma.notification.create({
          data: {
            type: 'reply',
            recipientId: parent.authorId,
            senderId: authorId,
            tweetId: tweet.id,
          },
        });

        // Check if original author gets conversation_starter achievement
        await achievementService.checkReplyAchievements(parent.authorId, parentId);
      }
    }

    return {
      tweet: this.formatTweet(tweet, authorId),
      newAchievements,
    };
  }

  async delete(tweetId: string, userId: string) {
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId },
    });

    if (!tweet) {
      throw new NotFoundError('Tweet not found');
    }

    if (tweet.authorId !== userId) {
      throw new ForbiddenError('Not authorized to delete this tweet');
    }

    await prisma.tweet.delete({ where: { id: tweetId } });

    return { message: 'Tweet deleted' };
  }

  async getById(tweetId: string, userId?: string) {
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId },
      include: this.getTweetInclude(userId),
    });

    if (!tweet) {
      throw new NotFoundError('Tweet not found');
    }

    return this.formatTweet(tweet, userId);
  }

  async getReplies(tweetId: string, userId?: string, cursor?: string, limit = 20) {
    const tweets = await prisma.tweet.findMany({
      where: { parentId: tweetId },
      include: this.getTweetInclude(userId),
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    const hasMore = tweets.length > limit;
    const data = tweets.slice(0, limit).map((t) => this.formatTweet(t, userId));

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id : null,
      hasMore,
    };
  }

  async getFeed(userId: string, cursor?: string, limit = 20, type: 'for_you' | 'following' = 'for_you') {
    let whereClause = {};

    if (type === 'following') {
      const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      const followingIds = following.map((f) => f.followingId);
      followingIds.push(userId);

      whereClause = {
        authorId: { in: followingIds },
        parentId: null,
      };
    } else {
      whereClause = {
        parentId: null,
      };
    }

    const tweets = await prisma.tweet.findMany({
      where: whereClause,
      include: this.getTweetInclude(userId),
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    const hasMore = tweets.length > limit;
    const data = tweets.slice(0, limit).map((t) => this.formatTweet(t, userId));

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id : null,
      hasMore,
    };
  }

  async getUserTweets(username: string, userId?: string, cursor?: string, limit = 20) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const tweets = await prisma.tweet.findMany({
      where: {
        authorId: user.id,
        parentId: null,
      },
      include: this.getTweetInclude(userId),
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    const hasMore = tweets.length > limit;
    const data = tweets.slice(0, limit).map((t) => this.formatTweet(t, userId));

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id : null,
      hasMore,
    };
  }

  async getByVibe(vibe: VibeType, userId?: string, cursor?: string, limit = 20) {
    const tweets = await prisma.tweet.findMany({
      where: {
        vibe,
        parentId: null,
      },
      include: this.getTweetInclude(userId),
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    const hasMore = tweets.length > limit;
    const data = tweets.slice(0, limit).map((t) => this.formatTweet(t, userId));

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id : null,
      hasMore,
    };
  }

  async react(tweetId: string, userId: string, input: ReactionInput) {
    const tweet = await prisma.tweet.findUnique({ where: { id: tweetId } });
    if (!tweet) {
      throw new NotFoundError('Tweet not found');
    }

    // Check existing reaction
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        userId_tweetId: { userId, tweetId },
      },
    });

    if (existingReaction) {
      if (existingReaction.type === input.type) {
        // Remove reaction
        await prisma.reaction.delete({
          where: { id: existingReaction.id },
        });

        // Update author's total reactions
        await prisma.user.update({
          where: { id: tweet.authorId },
          data: { totalReactions: { decrement: 1 } },
        });

        return { action: 'removed', type: input.type };
      } else {
        // Update reaction
        await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { type: input.type },
        });

        return { action: 'updated', type: input.type };
      }
    }

    // Create new reaction
    await prisma.reaction.create({
      data: {
        type: input.type,
        userId,
        tweetId,
      },
    });

    // Update author's total reactions
    await prisma.user.update({
      where: { id: tweet.authorId },
      data: { totalReactions: { increment: 1 } },
    });

    // Create notification (if not self-reaction)
    if (tweet.authorId !== userId) {
      await prisma.notification.create({
        data: {
          type: 'reaction',
          recipientId: tweet.authorId,
          senderId: userId,
          tweetId,
          reactionType: input.type,
        },
      });
    }

    return { action: 'added', type: input.type };
  }

  async retweet(tweetId: string, userId: string) {
    const originalTweet = await prisma.tweet.findUnique({ where: { id: tweetId } });
    if (!originalTweet) {
      throw new NotFoundError('Tweet not found');
    }

    // Check if already retweeted
    const existingRetweet = await prisma.tweet.findFirst({
      where: {
        authorId: userId,
        retweetOfId: tweetId,
      },
    });

    if (existingRetweet) {
      // Undo retweet
      await prisma.tweet.delete({ where: { id: existingRetweet.id } });
      return { action: 'removed' };
    }

    // Create retweet
    await prisma.tweet.create({
      data: {
        content: '',
        authorId: userId,
        retweetOfId: tweetId,
      },
    });

    // Create notification
    if (originalTweet.authorId !== userId) {
      await prisma.notification.create({
        data: {
          type: 'retweet',
          recipientId: originalTweet.authorId,
          senderId: userId,
          tweetId,
        },
      });
    }

    return { action: 'added' };
  }

  async vote(tweetId: string, userId: string, optionId: string) {
    const poll = await prisma.poll.findUnique({
      where: { tweetId },
      include: { options: true },
    });

    if (!poll) {
      throw new NotFoundError('Poll not found');
    }

    if (new Date() > poll.endsAt) {
      throw new ForbiddenError('Poll has ended');
    }

    const option = poll.options.find((o) => o.id === optionId);
    if (!option) {
      throw new NotFoundError('Option not found');
    }

    // Check if already voted
    const existingVote = await prisma.pollVote.findUnique({
      where: {
        userId_pollId: { userId, pollId: poll.id },
      },
    });

    if (existingVote) {
      // Update vote
      await prisma.pollVote.update({
        where: { id: existingVote.id },
        data: { optionId },
      });
    } else {
      // Create vote
      await prisma.pollVote.create({
        data: {
          userId,
          optionId,
          pollId: poll.id,
        },
      });
    }

    return { message: 'Vote recorded' };
  }

  private getTweetInclude(userId?: string) {
    return {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          bio: true,
          streak: true,
        },
      },
      reactions: true,
      _count: {
        select: {
          replies: true,
          retweets: true,
        },
      },
      poll: {
        include: {
          options: {
            include: {
              _count: { select: { votes: true } },
              votes: userId ? { where: { userId } } : false,
            },
          },
        },
      },
      retweetOf: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              bio: true,
              streak: true,
            },
          },
          reactions: true,
          _count: {
            select: {
              replies: true,
              retweets: true,
            },
          },
        },
      },
    } as const;
  }

  private formatTweet(tweet: any, userId?: string) {
    const reactionCounts: Record<ReactionType, number> = {
      fire: 0,
      rocket: 0,
      insightful: 0,
      love: 0,
      funny: 0,
      mindblown: 0,
    };

    tweet.reactions?.forEach((r: { type: ReactionType }) => {
      if (reactionCounts[r.type] !== undefined) {
        reactionCounts[r.type]++;
      }
    });

    const userReaction = userId
      ? tweet.reactions?.find((r: { userId: string }) => r.userId === userId)?.type ?? null
      : null;

    const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

    // Format poll
    let pollWithResults = null;
    if (tweet.poll) {
      const totalVotes = tweet.poll.options.reduce(
        (sum: number, opt: any) => sum + (opt._count?.votes ?? 0),
        0
      );
      
      pollWithResults = {
        id: tweet.poll.id,
        question: tweet.poll.question,
        endsAt: tweet.poll.endsAt.toISOString(),
        createdAt: tweet.poll.createdAt.toISOString(),
        totalVotes,
        userVotedOptionId: userId
          ? tweet.poll.options.find((o: any) => o.votes?.length > 0)?.id ?? null
          : null,
        options: tweet.poll.options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          votesCount: opt._count?.votes ?? 0,
          percentage: totalVotes > 0 ? Math.round(((opt._count?.votes ?? 0) / totalVotes) * 100) : 0,
        })),
      };
    }

    // Check if user retweeted
    const isRetweeted = userId
      ? tweet.retweets?.some((r: { authorId: string }) => r.authorId === userId) ?? false
      : false;

    return {
      id: tweet.id,
      content: tweet.content,
      authorId: tweet.authorId,
      author: tweet.author,
      vibe: tweet.vibe as VibeType | null,
      hasCode: tweet.hasCode,
      media: tweet.media,
      parentId: tweet.parentId,
      retweetOfId: tweet.retweetOfId,
      retweetOf: tweet.retweetOf ? this.formatTweet(tweet.retweetOf, userId) : undefined,
      reactionCounts,
      totalReactions,
      userReaction,
      repliesCount: tweet._count?.replies ?? 0,
      retweetsCount: tweet._count?.retweets ?? 0,
      isRetweeted,
      poll: pollWithResults,
      createdAt: tweet.createdAt.toISOString(),
      updatedAt: tweet.updatedAt.toISOString(),
    };
  }
}

export const tweetService = new TweetService();
