import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import TweetModal from './TweetModal';
import { VIBES, ACHIEVEMENTS } from '../utils/vibes';

const navItems = [
  { path: '/', icon: 'home', label: 'Home' },
  { path: '/explore', icon: 'explore', label: 'Explore' },
  { path: '/notifications', icon: 'notifications', label: 'Notifications' },
  { path: '/messages', icon: 'messages', label: 'Messages' },
  { path: '/leaderboard', icon: 'leaderboard', label: 'Leaderboard' },
];

const icons = {
  home: (active) => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      {active ? (
        <path d="M12 1.696L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM12 16.5c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5z" />
      ) : (
        <path d="M12 9c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm0 6c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm0-13.304L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM19 19.5c0 .276-.224.5-.5.5h-13c-.276 0-.5-.224-.5-.5V8.429l7-4.375 7 4.375V19.5z" />
      )}
    </svg>
  ),
  explore: (active) => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z" />
    </svg>
  ),
  notifications: (active) => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      {active ? (
        <path d="M11.996 2c-4.062 0-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958C19.48 5.017 16.054 2 11.996 2zM9.171 18h5.658c-.412 1.165-1.523 2-2.829 2s-2.417-.835-2.829-2z" />
      ) : (
        <path d="M19.993 9.042C19.48 5.017 16.054 2 11.996 2s-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958zM12 20c-1.306 0-2.417-.835-2.829-2h5.658c-.412 1.165-1.523 2-2.829 2zm-6.866-4l.847-6.698C6.364 6.272 8.941 4 11.996 4s5.627 2.268 6.013 5.295L18.864 16H5.134z" />
      )}
    </svg>
  ),
  messages: (active) => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z" />
    </svg>
  ),
  leaderboard: (active) => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  ),
  profile: (active) => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      {active ? (
        <path d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z" />
      ) : (
        <path d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z" />
      )}
    </svg>
  ),
};

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showTweetModal, setShowTweetModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-[260px] flex flex-col px-3 border-r border-white/[0.08]">
        <div className="p-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐦</span>
            <span className="text-xl font-semibold text-white">Chirp</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-4 px-4 py-3 rounded-full transition-colors ${
                  isActive 
                    ? 'font-semibold text-white' 
                    : 'text-[#e7e9ea] hover:bg-white/[0.06]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {icons[item.icon](isActive)}
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
          
          <NavLink
            to={`/${user?.username}`}
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-3 rounded-full transition-colors ${
                isActive 
                  ? 'font-semibold text-white' 
                  : 'text-[#e7e9ea] hover:bg-white/[0.06]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {icons.profile(isActive)}
                <span>Profile</span>
              </>
            )}
          </NavLink>

          <button
            onClick={() => setShowTweetModal(true)}
            className="mt-4 w-full btn-primary py-3"
          >
            Chirp
          </button>
        </nav>

        <div className="relative mb-4">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 p-3 rounded-full hover:bg-white/[0.06] transition-colors w-full"
          >
            <img 
              src={user?.avatar} 
              alt={user?.displayName}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 text-left min-w-0">
              <div className="font-medium text-sm text-white truncate flex items-center gap-1">
                {user?.displayName}
                {user?.streak >= 7 && (
                  <span className="text-orange-400 text-xs">🔥</span>
                )}
              </div>
              <div className="text-[#71767b] text-sm truncate">@{user?.username}</div>
            </div>
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#71767b]" fill="currentColor">
              <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
            </svg>
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute bottom-full left-0 mb-2 w-[280px] glass rounded-2xl border border-white/[0.08] z-20 overflow-hidden">
                <div className="p-4 border-b border-white/[0.08]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#71767b]">Streak</span>
                    <span className="font-medium text-white flex items-center gap-1">
                      {user?.streak || 0} days
                      {user?.streak >= 7 && <span className="text-orange-400">🔥</span>}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-white/[0.06] text-[#e7e9ea] transition-colors"
                >
                  Log out @{user?.username}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {showTweetModal && (
        <TweetModal 
          onClose={() => setShowTweetModal(false)}
          onTweetCreated={() => {
            setShowTweetModal(false);
            navigate('/');
          }}
        />
      )}
    </>
  );
}

function RightSidebar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [trending, setTrending] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [challenge, setChallenge] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/hashtags/trending').then(setTrending).catch(console.error);
    api.get('/challenge').then(setChallenge).catch(console.error);
    if (user) {
      api.get('/users/suggestions/list').then(setSuggestions).catch(console.error);
    }
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleFollow = async (username) => {
    try {
      await api.post(`/users/${username}/follow`);
      setSuggestions(prev => prev.filter(u => u.username !== username));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-[340px] px-6 py-3 overflow-y-auto border-l border-white/[0.08]">
      <form onSubmit={handleSearch} className="sticky top-0 bg-black pb-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-white/[0.04] text-[#e7e9ea] placeholder-[#71767b] rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-[#a855f7] focus:bg-transparent transition-all"
          />
          <svg viewBox="0 0 24 24" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#71767b]" fill="currentColor">
            <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z" />
          </svg>
        </div>
      </form>

      {/* Daily Challenge - subtle card */}
      {challenge && (
        <div className="card p-4 mb-4">
          <h2 className="text-sm font-medium text-[#71767b] mb-2">Daily Challenge</h2>
          <p className="text-[15px] text-[#e7e9ea]">{challenge.prompt}</p>
          <div className="mt-3">
            <span 
              className="badge"
              style={{ 
                background: `${VIBES[challenge.vibe]?.color}15`, 
                color: VIBES[challenge.vibe]?.color 
              }}
            >
              {VIBES[challenge.vibe]?.emoji} {VIBES[challenge.vibe]?.label}
            </span>
          </div>
        </div>
      )}

      {/* Vibe filters - minimal pills */}
      <div className="card p-4 mb-4">
        <h2 className="text-sm font-medium text-[#71767b] mb-3">Browse by Vibe</h2>
        <div className="flex flex-wrap gap-2">
          {Object.values(VIBES).map(vibe => (
            <button
              key={vibe.id}
              onClick={() => navigate(`/vibe/${vibe.id}`)}
              className="badge hover:opacity-80 transition-opacity"
              style={{ background: `${vibe.color}15`, color: vibe.color }}
            >
              {vibe.emoji} {vibe.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trending - clean list */}
      <div className="card mb-4">
        <h2 className="text-lg font-semibold text-[#e7e9ea] p-4 pb-2">Trending</h2>
        {trending.length === 0 ? (
          <div className="px-4 pb-4 text-[#71767b] text-sm">No trends yet</div>
        ) : (
          trending.slice(0, 5).map((trend, index) => (
            <div
              key={trend.tag}
              onClick={() => navigate(`/hashtag/${trend.tag.slice(1)}`)}
              className="px-4 py-3 hover:bg-white/[0.03] cursor-pointer transition-colors"
            >
              <div className="text-[#71767b] text-xs">{index + 1} · Trending</div>
              <div className="font-medium text-[#e7e9ea]">{trend.tag}</div>
              <div className="text-[#71767b] text-xs">{trend.count} chirps</div>
            </div>
          ))
        )}
      </div>

      {/* Who to follow - minimal */}
      {suggestions.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-[#e7e9ea] p-4 pb-2">Who to follow</h2>
          {suggestions.slice(0, 3).map(suggestedUser => (
            <div
              key={suggestedUser.id}
              className="px-4 py-3 hover:bg-white/[0.03] transition-colors flex items-center gap-3"
            >
              <img
                src={suggestedUser.avatar}
                alt={suggestedUser.displayName}
                className="w-10 h-10 rounded-full cursor-pointer"
                onClick={() => navigate(`/${suggestedUser.username}`)}
              />
              <div 
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate(`/${suggestedUser.username}`)}
              >
                <div className="font-medium text-[#e7e9ea] text-sm truncate hover:underline">
                  {suggestedUser.displayName}
                </div>
                <div className="text-[#71767b] text-sm truncate">@{suggestedUser.username}</div>
              </div>
              <button
                onClick={() => handleFollow(suggestedUser.username)}
                className="bg-white text-black font-semibold py-1.5 px-4 rounded-full text-sm hover:bg-white/90 transition-colors"
              >
                Follow
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 text-[#71767b] text-xs">
        Chirp © 2026
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <main className="ml-[260px] mr-[340px] min-h-screen border-r border-white/[0.08]">
        <Outlet />
      </main>
      <RightSidebar />
    </div>
  );
}
