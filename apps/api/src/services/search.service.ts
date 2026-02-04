import { prisma } from '../config/database.js';

export class SearchService {
  async search(query: string, userId?: string, type = 'all', limit = 20) {
    const results: {
      users: any[];
      tweets: any[];
      hashtags: { tag: string; count: number }[];
    } = {
      users: [],
      tweets: [],
      hashtags: [],
    };

    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          bio: true,
          streak: true,
        },
        take: limit,
      });
      results.users = users;
    }

    if (type === 'all' || type === 'tweets') {
      const tweets = await prisma.tweet.findMany({
        where: {
          content: { contains: query, mode: 'insensitive' },
          parentId: null,
        },
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
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      results.tweets = tweets.map((tweet) => {
        const reactionCounts = {
          fire: 0,
          rocket: 0,
          insightful: 0,
          love: 0,
          funny: 0,
          mindblown: 0,
        };

        tweet.reactions.forEach((r) => {
          if (reactionCounts[r.type as keyof typeof reactionCounts] !== undefined) {
            reactionCounts[r.type as keyof typeof reactionCounts]++;
          }
        });

        return {
          id: tweet.id,
          content: tweet.content,
          authorId: tweet.authorId,
          author: tweet.author,
          vibe: tweet.vibe,
          hasCode: tweet.hasCode,
          media: tweet.media,
          reactionCounts,
          totalReactions: Object.values(reactionCounts).reduce((a, b) => a + b, 0),
          userReaction: userId
            ? tweet.reactions.find((r) => r.userId === userId)?.type ?? null
            : null,
          repliesCount: tweet._count.replies,
          retweetsCount: tweet._count.retweets,
          createdAt: tweet.createdAt.toISOString(),
          updatedAt: tweet.updatedAt.toISOString(),
        };
      });
    }

    if (type === 'all' || type === 'hashtags') {
      // Extract hashtags from tweets
      const tweetsWithHashtags = await prisma.tweet.findMany({
        where: {
          content: { contains: '#' },
        },
        select: { content: true },
      });

      const hashtagCounts = new Map<string, number>();
      const hashtagRegex = /#(\w+)/g;

      for (const tweet of tweetsWithHashtags) {
        let match;
        while ((match = hashtagRegex.exec(tweet.content)) !== null) {
          const tag = match[1].toLowerCase();
          if (tag.includes(query.toLowerCase().replace('#', ''))) {
            hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
          }
        }
      }

      results.hashtags = Array.from(hashtagCounts.entries())
        .map(([tag, count]) => ({ tag: `#${tag}`, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    }

    return results;
  }

  async getTrending(limit = 10) {
    // Get tweets from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const tweets = await prisma.tweet.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        content: { contains: '#' },
      },
      select: { content: true },
    });

    const hashtagCounts = new Map<string, number>();
    const hashtagRegex = /#(\w+)/g;

    for (const tweet of tweets) {
      let match;
      while ((match = hashtagRegex.exec(tweet.content)) !== null) {
        const tag = match[1].toLowerCase();
        hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
      }
    }

    return Array.from(hashtagCounts.entries())
      .map(([tag, count], index) => ({
        tag: `#${tag}`,
        count,
        rank: index + 1,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }

  async getLeaderboard(limit = 20) {
    const users = await prisma.user.findMany({
      orderBy: [
        { totalReactions: 'desc' },
        { streak: 'desc' },
      ],
      take: limit,
      include: {
        achievements: {
          include: { achievement: true },
        },
      },
    });

    return users.map((user, index) => ({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        streak: user.streak,
      },
      totalReactions: user.totalReactions,
      streak: user.streak,
      achievements: user.achievements.map((ua) => ({
        ...ua.achievement,
        unlockedAt: ua.unlockedAt.toISOString(),
      })),
      rank: index + 1,
    }));
  }

  async getDailyChallenge() {
    // Generate a daily challenge based on the date
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    const challenges = [
      { prompt: "What's one thing you learned today?", vibe: 'learning' },
      { prompt: "Share a hot take about your tech stack", vibe: 'rant' },
      { prompt: "What are you celebrating this week?", vibe: 'celebration' },
      { prompt: "Share a code snippet you're proud of", vibe: 'hype' },
      { prompt: "What's your unpopular opinion about coding?", vibe: 'thoughtful' },
      { prompt: "What's helping you stay motivated?", vibe: 'chill' },
      { prompt: "Share a debugging tip that saved your day", vibe: 'learning' },
    ];

    const challenge = challenges[seed % challenges.length];

    return {
      id: `challenge-${seed}`,
      ...challenge,
      date: today.toISOString().split('T')[0],
    };
  }
}

export const searchService = new SearchService();
