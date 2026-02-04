import { useState, useEffect } from 'react';
import api from '../utils/api';
import Tweet from '../components/Tweet';
import ComposeTweet from '../components/ComposeTweet';

export default function Home() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('foryou');

  useEffect(() => {
    loadTweets();
  }, [activeTab]);

  const loadTweets = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'following' ? '/tweets/feed' : '/tweets';
      const data = await api.get(endpoint);
      setTweets(data);
    } catch (error) {
      console.error('Error loading chirps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTweetCreated = (tweet) => {
    setTweets(prev => [tweet, ...prev]);
  };

  const handleTweetUpdate = (updatedTweet, tweetId) => {
    if (updatedTweet === null) {
      setTweets(prev => prev.filter(t => t.id !== tweetId));
    } else {
      setTweets(prev => prev.map(t => t.id === updatedTweet.id ? updatedTweet : t));
    }
  };

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-white/[0.08] z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-semibold text-white">Home</h1>
        </div>
        <div className="flex">
          <button
            onClick={() => setActiveTab('foryou')}
            className={`flex-1 tab ${activeTab === 'foryou' ? 'active' : ''}`}
          >
            For you
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 tab ${activeTab === 'following' ? 'active' : ''}`}
          >
            Following
          </button>
        </div>
      </div>

      <ComposeTweet onTweetCreated={handleTweetCreated} />

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#a855f7] border-t-transparent"></div>
        </div>
      ) : tweets.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-4xl mb-4">🐦</div>
          {activeTab === 'following' ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">Welcome to your timeline</h2>
              <p className="text-[#71767b]">When you follow people, their chirps will show up here.</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">No chirps yet</h2>
              <p className="text-[#71767b]">Be the first to share something.</p>
            </>
          )}
        </div>
      ) : (
        <div className="fade-in">
          {tweets.map(tweet => (
            <Tweet 
              key={tweet.id} 
              tweet={tweet} 
              onUpdate={(updated) => handleTweetUpdate(updated, tweet.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
