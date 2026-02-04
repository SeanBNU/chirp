import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Tweet from '../components/Tweet';

export default function HashtagPage() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTweets();
  }, [tag]);

  const loadTweets = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/hashtags/${tag}`);
      setTweets(data);
    } catch (error) {
      console.error('Error loading hashtag tweets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-twitter-lightGray z-10 p-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-twitter-lightGray/50 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold">#{tag}</h1>
          <p className="text-twitter-gray text-sm">{tweets.length} posts</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-twitter-blue"></div>
        </div>
      ) : tweets.length === 0 ? (
        <div className="p-8 text-center text-twitter-gray">
          <p>No posts with #{tag} yet</p>
        </div>
      ) : (
        <div>
          {tweets.map(tweet => (
            <Tweet key={tweet.id} tweet={tweet} />
          ))}
        </div>
      )}
    </div>
  );
}
