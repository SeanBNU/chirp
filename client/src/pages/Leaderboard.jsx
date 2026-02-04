import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ACHIEVEMENTS } from '../utils/vibes';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await api.get('/leaderboard');
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  };

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-white/[0.08] z-10 p-4">
        <h1 className="text-xl font-semibold text-white">Leaderboard</h1>
        <p className="text-[#71767b] text-sm">Top chirpers by reactions</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#a855f7] border-t-transparent"></div>
        </div>
      ) : (
        <div>
          {/* Top 3 */}
          <div className="p-6 flex justify-center items-end gap-6 border-b border-white/[0.08]">
            {/* Second place */}
            {leaderboard[1] && (
              <div 
                className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/${leaderboard[1].username}`)}
              >
                <img 
                  src={leaderboard[1].avatar} 
                  alt={leaderboard[1].displayName}
                  className="w-14 h-14 rounded-full mx-auto border-2 border-[#71767b]"
                />
                <div className="mt-2 font-medium text-sm text-[#e7e9ea] truncate max-w-[80px]">{leaderboard[1].displayName}</div>
                <div className="text-xl mt-1">🥈</div>
                <div className="text-[#71767b] text-xs">{leaderboard[1].totalReactions}</div>
              </div>
            )}
            
            {/* First place */}
            {leaderboard[0] && (
              <div 
                className="text-center cursor-pointer hover:opacity-80 transition-opacity -mb-2"
                onClick={() => navigate(`/${leaderboard[0].username}`)}
              >
                <img 
                  src={leaderboard[0].avatar} 
                  alt={leaderboard[0].displayName}
                  className="w-16 h-16 rounded-full mx-auto border-2 border-yellow-500"
                />
                <div className="mt-2 font-medium text-[#e7e9ea] truncate max-w-[100px]">{leaderboard[0].displayName}</div>
                <div className="text-2xl mt-1">🥇</div>
                <div className="text-[#71767b] text-sm">{leaderboard[0].totalReactions}</div>
              </div>
            )}
            
            {/* Third place */}
            {leaderboard[2] && (
              <div 
                className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/${leaderboard[2].username}`)}
              >
                <img 
                  src={leaderboard[2].avatar} 
                  alt={leaderboard[2].displayName}
                  className="w-12 h-12 rounded-full mx-auto border-2 border-amber-700"
                />
                <div className="mt-2 font-medium text-sm text-[#e7e9ea] truncate max-w-[80px]">{leaderboard[2].displayName}</div>
                <div className="text-lg mt-1">🥉</div>
                <div className="text-[#71767b] text-xs">{leaderboard[2].totalReactions}</div>
              </div>
            )}
          </div>

          {/* Full list */}
          <div>
            {leaderboard.map((user, index) => (
              <div
                key={user.id}
                onClick={() => navigate(`/${user.username}`)}
                className="px-4 py-3 border-b border-white/[0.08] hover:bg-white/[0.02] cursor-pointer transition-colors flex items-center gap-4"
              >
                <div className="w-8 text-center font-medium text-[#71767b]">
                  {getMedalEmoji(index) || `${index + 1}`}
                </div>
                
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#e7e9ea] flex items-center gap-1">
                    {user.displayName}
                    {user.streak >= 7 && <span className="text-orange-400 text-xs">🔥</span>}
                  </div>
                  <div className="text-[#71767b] text-sm">@{user.username}</div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium text-[#e7e9ea]">{user.totalReactions}</div>
                  <div className="text-[#71767b] text-xs">reactions</div>
                </div>
                
                <div className="text-right w-16">
                  <div className="font-medium text-[#e7e9ea] flex items-center justify-end gap-1">
                    {user.streak}
                    {user.streak >= 7 && <span className="text-xs">🔥</span>}
                  </div>
                  <div className="text-[#71767b] text-xs">streak</div>
                </div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="p-4">
            <h2 className="text-sm font-medium text-[#71767b] mb-4">Achievements</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(ACHIEVEMENTS).map(achievement => (
                <div 
                  key={achievement.id}
                  className="p-3 card flex items-center gap-3"
                >
                  <span className="text-xl">{achievement.emoji}</span>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-[#e7e9ea]">{achievement.name}</div>
                    <div className="text-[#71767b] text-xs truncate">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
