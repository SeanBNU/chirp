import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tweetApi } from '../services/api';
import type { Tweet, CreateTweetInput, ReactionType, VibeType } from '@chirp/shared';

export function useFeed(type: 'for_you' | 'following' = 'for_you') {
  return useInfiniteQuery({
    queryKey: ['feed', type],
    queryFn: ({ pageParam }) => tweetApi.getFeed(type, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useUserTweets(username: string) {
  return useInfiniteQuery({
    queryKey: ['tweets', 'user', username],
    queryFn: ({ pageParam }) => tweetApi.getUserTweets(username, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useVibetweets(vibe: VibeType) {
  return useInfiniteQuery({
    queryKey: ['tweets', 'vibe', vibe],
    queryFn: ({ pageParam }) => tweetApi.getByVibe(vibe, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useReplies(tweetId: string) {
  return useInfiniteQuery({
    queryKey: ['tweets', tweetId, 'replies'],
    queryFn: ({ pageParam }) => tweetApi.getReplies(tweetId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useCreateTweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTweetInput & { media?: File[] }) => tweetApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
    },
  });
}

export function useDeleteTweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tweetApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
    },
  });
}

export function useReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tweetId, type }: { tweetId: string; type: ReactionType }) =>
      tweetApi.react(tweetId, type),
    onMutate: async ({ tweetId, type }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      
      const updateTweet = (tweet: Tweet): Tweet => {
        if (tweet.id !== tweetId) return tweet;
        
        const newCounts = { ...tweet.reactionCounts };
        if (tweet.userReaction === type) {
          // Remove reaction
          newCounts[type] = Math.max(0, (newCounts[type] || 0) - 1);
          return { ...tweet, reactionCounts: newCounts, userReaction: null, totalReactions: tweet.totalReactions - 1 };
        } else {
          // Add/change reaction
          if (tweet.userReaction) {
            newCounts[tweet.userReaction] = Math.max(0, (newCounts[tweet.userReaction] || 0) - 1);
          }
          newCounts[type] = (newCounts[type] || 0) + 1;
          const delta = tweet.userReaction ? 0 : 1;
          return { ...tweet, reactionCounts: newCounts, userReaction: type, totalReactions: tweet.totalReactions + delta };
        }
      };

      queryClient.setQueriesData({ queryKey: ['feed'] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map(updateTweet),
          })),
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useRetweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tweetApi.retweet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tweetId, optionId }: { tweetId: string; optionId: string }) =>
      tweetApi.vote(tweetId, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
