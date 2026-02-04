import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Tweet from '../components/Tweet';

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('top');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (query) {
      search();
    }
  }, [query, activeTab]);

  const search = async () => {
    setLoading(true);
    try {
      const type = activeTab === 'people' ? 'users' : 'tweets';
      const data = await api.get(`/search?q=${encodeURIComponent(query)}&type=${type}`);
      setResults(data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10">
        <div className="p-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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

        {query && (
          <div className="flex border-b border-twitter-lightGray">
            {['top', 'latest', 'people'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-center hover:bg-white/5 transition-colors relative capitalize ${
                  activeTab === tab ? 'font-bold' : 'text-twitter-gray'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-twitter-blue rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {!query ? (
        <div className="p-8 text-center text-twitter-gray">
          <p>Try searching for people, topics, or keywords</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-twitter-blue"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">No results for "{query}"</h2>
          <p className="text-twitter-gray">
            Try searching for something else.
          </p>
        </div>
      ) : activeTab === 'people' ? (
        <div>
          {results.map(user => (
            <div
              key={user.id}
              onClick={() => navigate(`/${user.username}`)}
              className="p-4 hover:bg-white/[0.03] cursor-pointer transition-colors flex items-center gap-3"
            >
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{user.displayName}</div>
                <div className="text-twitter-gray truncate">@{user.username}</div>
                {user.bio && (
                  <p className="text-sm mt-1 line-clamp-2">{user.bio}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {results.map(tweet => (
            <Tweet key={tweet.id} tweet={tweet} />
          ))}
        </div>
      )}
    </div>
  );
}
