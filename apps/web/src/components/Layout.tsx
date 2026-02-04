import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { searchApi } from '../services/api';
import { TweetModal } from './TweetModal';
import { VIBES } from '../utils/vibes';

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/explore', label: 'Explore', icon: '🔍' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/messages', label: 'Messages', icon: '✉️' },
  { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
];

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { composeModalOpen, openComposeModal, closeComposeModal } = useUIStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: () => searchApi.getTrending(5),
    staleTime: 1000 * 60 * 5,
  });

  const { data: challenge } = useQuery({
    queryKey: ['challenge'],
    queryFn: searchApi.getDailyChallenge,
    staleTime: 1000 * 60 * 60,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[260px] border-r border-white/[0.08] p-4 flex flex-col">
        <div className="mb-4">
          <span className="text-xl font-semibold">🐦 Chirp</span>
        </div>

        <nav className="flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-full text-base transition-colors hover:bg-white/[0.06] ${
                  isActive ? 'font-semibold' : ''
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <NavLink
            to={`/${user?.username}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-full text-base transition-colors hover:bg-white/[0.06] ${
                isActive ? 'font-semibold' : ''
              }`
            }
          >
            <span>👤</span>
            <span>Profile</span>
          </NavLink>
        </nav>

        <button onClick={openComposeModal} className="btn-primary w-full mb-4">
          Chirp
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 w-full p-3 rounded-full hover:bg-white/[0.06] transition-colors"
          >
            <img
              src={user?.avatar || ''}
              alt={user?.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm flex items-center gap-1">
                {user?.name}
                {user?.streak && user.streak > 0 && (
                  <span className="text-orange-400">🔥</span>
                )}
              </div>
              <div className="text-[#71767b] text-sm">@{user?.username}</div>
            </div>
            <span className="text-[#71767b]">•••</span>
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 glass rounded-2xl overflow-hidden shadow-lg border border-white/[0.08]">
              <div className="p-4 border-b border-white/[0.08]">
                <div className="text-sm text-[#71767b]">Streak</div>
                <div className="font-semibold">{user?.streak || 0} days 🔥</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full p-4 text-left hover:bg-white/[0.06] text-red-400"
              >
                Log out @{user?.username}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[260px] mr-[340px] min-h-screen border-r border-white/[0.08]">
        {children}
      </main>

      {/* Right Sidebar */}
      <aside className="fixed right-0 top-0 h-full w-[340px] p-4 overflow-y-auto">
        <form onSubmit={handleSearch} className="mb-4">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.04] rounded-full py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
          />
        </form>

        {challenge && (
          <div className="card p-4 mb-4">
            <h3 className="font-semibold mb-2">Daily Challenge</h3>
            <p className="text-sm text-[#e7e9ea] mb-2">{challenge.prompt}</p>
            <span className="badge badge-subtle">
              {VIBES[challenge.vibe as keyof typeof VIBES]?.emoji}{' '}
              {VIBES[challenge.vibe as keyof typeof VIBES]?.label}
            </span>
          </div>
        )}

        <div className="card p-4 mb-4">
          <h3 className="font-semibold mb-3">Browse by Vibe</h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(VIBES).map((vibe) => (
              <NavLink
                key={vibe.id}
                to={`/vibe/${vibe.id}`}
                className="badge badge-subtle hover:bg-white/[0.1] transition-colors"
              >
                {vibe.emoji} {vibe.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="card p-4 mb-4">
          <h3 className="font-semibold mb-3">Trending</h3>
          {trending && trending.length > 0 ? (
            <div className="space-y-3">
              {trending.map((tag, i) => (
                <NavLink
                  key={tag.tag}
                  to={`/explore?q=${encodeURIComponent(tag.tag)}`}
                  className="block hover:bg-white/[0.03] -mx-2 px-2 py-1 rounded"
                >
                  <div className="text-xs text-[#71767b]">{i + 1} · Trending</div>
                  <div className="font-semibold">{tag.tag}</div>
                  <div className="text-xs text-[#71767b]">{tag.count} chirps</div>
                </NavLink>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#71767b]">No trends yet</p>
          )}
        </div>

        <footer className="text-xs text-[#71767b] mt-4">
          Chirp © {new Date().getFullYear()}
        </footer>
      </aside>

      {composeModalOpen && <TweetModal onClose={closeComposeModal} />}
    </div>
  );
}
