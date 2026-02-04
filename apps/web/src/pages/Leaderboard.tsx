import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../services/api';
import { ACHIEVEMENTS } from '@chirp/shared';

export function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => searchApi.getLeaderboard(20),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const topThree = leaderboard?.slice(0, 3) || [];
  const rest = leaderboard?.slice(3) || [];

  return (
    <div>
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 px-4 py-3 border-b border-white/[0.08]">
        <h1 className="text-xl font-semibold">Leaderboard</h1>
      </header>

      {/* Podium */}
      <div className="p-6 border-b border-white/[0.08]">
        <div className="flex items-end justify-center gap-4">
          {/* 2nd Place */}
          {topThree[1] && (
            <Link
              to={`/${topThree[1].user.username}`}
              className="text-center"
            >
              <div className="text-3xl mb-2">🥈</div>
              <img
                src={topThree[1].user.avatar || ''}
                alt={topThree[1].user.name}
                className="w-16 h-16 rounded-full mx-auto mb-2"
              />
              <div className="font-semibold">{topThree[1].user.name}</div>
              <div className="text-sm text-[#71767b]">{topThree[1].totalReactions} reactions</div>
            </Link>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <Link
              to={`/${topThree[0].user.username}`}
              className="text-center -mt-4"
            >
              <div className="text-4xl mb-2">🥇</div>
              <img
                src={topThree[0].user.avatar || ''}
                alt={topThree[0].user.name}
                className="w-20 h-20 rounded-full mx-auto mb-2 ring-4 ring-yellow-500/30"
              />
              <div className="font-bold text-lg">{topThree[0].user.name}</div>
              <div className="text-sm text-[#71767b]">{topThree[0].totalReactions} reactions</div>
            </Link>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <Link
              to={`/${topThree[2].user.username}`}
              className="text-center"
            >
              <div className="text-3xl mb-2">🥉</div>
              <img
                src={topThree[2].user.avatar || ''}
                alt={topThree[2].user.name}
                className="w-16 h-16 rounded-full mx-auto mb-2"
              />
              <div className="font-semibold">{topThree[2].user.name}</div>
              <div className="text-sm text-[#71767b]">{topThree[2].totalReactions} reactions</div>
            </Link>
          )}
        </div>
      </div>

      {/* Rest of Leaderboard */}
      <div>
        {rest.map((entry) => (
          <Link
            key={entry.user.id}
            to={`/${entry.user.username}`}
            className="flex items-center gap-4 p-4 border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors"
          >
            <span className="w-8 text-center font-semibold text-[#71767b]">
              {entry.rank}
            </span>
            <img
              src={entry.user.avatar || ''}
              alt={entry.user.name}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="font-semibold flex items-center gap-2">
                {entry.user.name}
                {entry.streak > 0 && (
                  <span className="text-orange-400 text-sm">🔥 {entry.streak}d</span>
                )}
              </div>
              <div className="text-sm text-[#71767b]">@{entry.user.username}</div>
              {entry.achievements.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.achievements.slice(0, 3).map((a) => (
                    <span
                      key={a.id}
                      className="text-xs"
                      title={ACHIEVEMENTS[a.id as keyof typeof ACHIEVEMENTS]?.name}
                    >
                      {a.emoji}
                    </span>
                  ))}
                  {entry.achievements.length > 3 && (
                    <span className="text-xs text-[#71767b]">
                      +{entry.achievements.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="font-semibold">{entry.totalReactions}</div>
              <div className="text-xs text-[#71767b]">reactions</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Achievements Legend */}
      <div className="p-4 border-t border-white/[0.08]">
        <h3 className="font-semibold mb-3">Achievements</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(ACHIEVEMENTS).map((achievement) => (
            <div key={achievement.id} className="card p-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{achievement.emoji}</span>
                <div>
                  <div className="font-medium text-sm">{achievement.name}</div>
                  <div className="text-xs text-[#71767b]">{achievement.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
