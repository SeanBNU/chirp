import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Tweet from '../components/Tweet';
import { VIBES } from '../utils/vibes';

export default function VibePage() {
  const { vibe } = useParams();
  const navigate = useNavigate();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  const vibeInfo = VIBES[vibe];

  useEffect(() => {
    if (!vibeInfo) {
      navigate('/');
      return;
    }
    loadTweets();
  }, [vibe]);

  const loadTweets = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/vibes/${vibe}`);
      setTweets(data);
    } catch (error) {
      console.error('Error loading vibe tweets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!vibeInfo) return null;

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-white/[0.08] z-10 p-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/[0.06] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#e7e9ea]" fill="currentColor">
            <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <span>{vibeInfo.emoji}</span>
            {vibeInfo.label}
          </h1>
          <p className="text-[#71767b] text-sm">{vibeInfo.description}</p>
        </div>
      </div>

      {/* Vibe selector */}
      <div className="p-4 border-b border-white/[0.08]">
        <div className="flex flex-wrap gap-2">
          {Object.values(VIBES).map(v => (
            <button
              key={v.id}
              onClick={() => navigate(`/vibe/${v.id}`)}
              className={`badge transition-all ${v.id === vibe ? 'ring-1 ring-offset-1 ring-offset-black' : 'opacity-60 hover:opacity-100'}`}
              style={{ 
                background: `${v.color}${v.id === vibe ? '30' : '15'}`, 
                color: v.color,
                ringColor: v.color
              }}
            >
              {v.emoji} {v.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#a855f7] border-t-transparent"></div>
        </div>
      ) : tweets.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-3xl mb-4">{vibeInfo.emoji}</div>
          <h2 className="text-xl font-semibold text-white mb-2">No {vibeInfo.label.toLowerCase()} chirps yet</h2>
          <p className="text-[#71767b]">Be the first to share this vibe</p>
        </div>
      ) : (
        <div className="fade-in">
          {tweets.map(tweet => (
            <Tweet key={tweet.id} tweet={tweet} />
          ))}
        </div>
      )}
    </div>
  );
}
