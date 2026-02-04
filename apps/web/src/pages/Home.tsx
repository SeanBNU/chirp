import { useState } from 'react';
import { useFeed } from '../hooks/useTweets';
import { Tweet } from '../components/Tweet';
import { ComposeTweet } from '../components/ComposeTweet';

export function Home() {
  const [feedType, setFeedType] = useState<'for_you' | 'following'>('for_you');
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed(feedType);

  const tweets = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div>
      <header className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-white/[0.08] z-10">
        <h1 className="px-4 py-3 text-xl font-semibold">Home</h1>
        <div className="flex">
          <button
            onClick={() => setFeedType('for_you')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              feedType === 'for_you' ? 'text-white' : 'text-[#71767b]'
            }`}
          >
            For you
            {feedType === 'for_you' && (
              <div className="h-1 bg-[#a855f7] rounded-full w-14 mx-auto mt-3" />
            )}
          </button>
          <button
            onClick={() => setFeedType('following')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              feedType === 'following' ? 'text-white' : 'text-[#71767b]'
            }`}
          >
            Following
            {feedType === 'following' && (
              <div className="h-1 bg-[#a855f7] rounded-full w-14 mx-auto mt-3" />
            )}
          </button>
        </div>
      </header>

      <ComposeTweet />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {tweets.map((tweet) => (
            <Tweet key={tweet.id} tweet={tweet} />
          ))}
          
          {hasNextPage && (
            <div className="py-4 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="btn-secondary"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
