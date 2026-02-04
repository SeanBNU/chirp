import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../services/api';
import { Tweet } from '../components/Tweet';

export function Explore() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: () => searchApi.search(searchTerm),
    enabled: searchTerm.length > 0,
  });

  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: () => searchApi.getTrending(10),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
  };

  return (
    <div>
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 p-4">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search Chirp"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/[0.04] rounded-full py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
          />
        </form>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : searchTerm ? (
        <div>
          {results?.users && results.users.length > 0 && (
            <div className="p-4 border-b border-white/[0.08]">
              <h2 className="font-semibold mb-3">People</h2>
              {results.users.map((user) => (
                <a
                  key={user.id}
                  href={`/${user.username}`}
                  className="flex items-center gap-3 p-3 -mx-3 rounded-lg hover:bg-white/[0.03]"
                >
                  <img
                    src={user.avatar || ''}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm text-[#71767b]">@{user.username}</div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {results?.tweets && results.tweets.length > 0 && (
            <div>
              <h2 className="font-semibold p-4 border-b border-white/[0.08]">Chirps</h2>
              {results.tweets.map((tweet) => (
                <Tweet key={tweet.id} tweet={tweet as any} />
              ))}
            </div>
          )}

          {(!results?.users?.length && !results?.tweets?.length) && (
            <div className="p-8 text-center text-[#71767b]">
              No results found for "{searchTerm}"
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          <h2 className="font-semibold mb-4">Trending</h2>
          {trending && trending.length > 0 ? (
            <div className="space-y-3">
              {trending.map((tag, i) => (
                <button
                  key={tag.tag}
                  onClick={() => {
                    setQuery(tag.tag);
                    setSearchTerm(tag.tag);
                  }}
                  className="block w-full text-left hover:bg-white/[0.03] p-3 -mx-3 rounded-lg"
                >
                  <div className="text-xs text-[#71767b]">{i + 1} · Trending</div>
                  <div className="font-semibold">{tag.tag}</div>
                  <div className="text-xs text-[#71767b]">{tag.count} chirps</div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[#71767b]">No trends yet</p>
          )}
        </div>
      )}
    </div>
  );
}
