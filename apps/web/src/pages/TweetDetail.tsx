import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tweetApi } from '../services/api';
import { useReplies } from '../hooks/useTweets';
import { Tweet } from '../components/Tweet';
import { ComposeTweet } from '../components/ComposeTweet';

export function TweetDetail() {
  const { tweetId } = useParams<{ tweetId: string }>();
  
  const { data: tweet, isLoading } = useQuery({
    queryKey: ['tweet', tweetId],
    queryFn: () => tweetApi.getById(tweetId!),
    enabled: !!tweetId,
  });

  const { data: replies, fetchNextPage, hasNextPage, isFetchingNextPage } = useReplies(tweetId!);
  const replyList = replies?.pages.flatMap((page) => page.data) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tweet) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">Chirp not found</h2>
      </div>
    );
  }

  return (
    <div>
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 px-4 py-3 flex items-center gap-4">
        <Link to="/" className="p-2 rounded-full hover:bg-white/[0.1]">
          ←
        </Link>
        <h1 className="text-xl font-semibold">Chirp</h1>
      </header>

      <Tweet tweet={tweet} showActions={true} />

      <div className="border-b border-white/[0.08]">
        <ComposeTweet 
          parentId={tweet.id}
          placeholder="Post your reply"
        />
      </div>

      {replyList.length > 0 ? (
        <>
          {replyList.map((reply) => (
            <Tweet key={reply.id} tweet={reply} />
          ))}
          
          {hasNextPage && (
            <div className="py-4 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="btn-secondary"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load more replies'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center text-[#71767b]">
          No replies yet. Be the first to reply!
        </div>
      )}
    </div>
  );
}
