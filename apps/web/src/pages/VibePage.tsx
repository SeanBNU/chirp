import { useParams, Link } from 'react-router-dom';
import { useVibetweets } from '../hooks/useTweets';
import { Tweet } from '../components/Tweet';
import { VIBES, type VibeType } from '../utils/vibes';

export function VibePage() {
  const { vibe } = useParams<{ vibe: string }>();
  const vibeInfo = VIBES[vibe as VibeType];
  
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useVibetweets(vibe as VibeType);
  const tweets = data?.pages.flatMap((page) => page.data) || [];

  if (!vibeInfo) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">Vibe not found</h2>
      </div>
    );
  }

  return (
    <div>
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-white/[0.08]">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link to="/" className="p-2 rounded-full hover:bg-white/[0.1]">
            ←
          </Link>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              {vibeInfo.emoji} {vibeInfo.label}
            </h1>
            <p className="text-sm text-[#71767b]">{vibeInfo.description}</p>
          </div>
        </div>

        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {Object.values(VIBES).map((v) => (
            <Link
              key={v.id}
              to={`/vibe/${v.id}`}
              className={`badge whitespace-nowrap ${
                v.id === vibe 
                  ? 'bg-[#a855f7]/20 text-[#a855f7] ring-1 ring-[#a855f7]/50' 
                  : 'badge-subtle hover:bg-white/[0.1]'
              }`}
            >
              {v.emoji} {v.label}
            </Link>
          ))}
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tweets.length > 0 ? (
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
      ) : (
        <div className="p-8 text-center text-[#71767b]">
          No {vibeInfo.label.toLowerCase()} chirps yet. Be the first!
        </div>
      )}
    </div>
  );
}
