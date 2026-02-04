import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Tweet from '../components/Tweet';

export default function Explore() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [latestTweets, setLatestTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trendingData, tweetsData] = await Promise.all([
        api.get('/hashtags/trending'),
        api.get('/tweets')
      ]);
      setTrending(trendingData);
      setLatestTweets(tweetsData.slice(0, 20));
    } catch (error) {
      console.error('Error loading explore data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-twitter-lightGray z-10 p-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-twitter-darkGray text-white placeholder-twitter-gray rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:bg-black"
            />
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-twitter-gray"
              fill="currentColor"
            >
              <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z" />
            </svg>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-twitter-blue"></div>
        </div>
      ) : (
        <>
          {trending.length > 0 && (
            <div className="border-b border-twitter-lightGray">
              <h2 className="text-xl font-bold p-4">Trending</h2>
              {trending.map((trend, index) => (
                <div
                  key={trend.tag}
                  onClick={() => navigate(`/hashtag/${trend.tag.slice(1)}`)}
                  className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="text-twitter-gray text-sm">{index + 1} · Trending</div>
                  <div className="font-bold">{trend.tag}</div>
                  <div className="text-twitter-gray text-sm">{trend.count} posts</div>
                </div>
              ))}
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold p-4">Latest Posts</h2>
            {latestTweets.map(tweet => (
              <Tweet key={tweet.id} tweet={tweet} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
