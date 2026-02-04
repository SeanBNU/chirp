import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Tweet from '../components/Tweet';
import { ACHIEVEMENTS } from '../utils/vibes';

export default function Profile({ tab: initialTab }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [activeTab, setActiveTab] = useState('chirps');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [followList, setFollowList] = useState([]);
  const [showFollowModal, setShowFollowModal] = useState(null);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    loadProfile();
  }, [username]);

  useEffect(() => {
    if (initialTab === 'followers' || initialTab === 'following') {
      loadFollowList(initialTab);
    }
  }, [initialTab, username]);

  useEffect(() => {
    if (profile) {
      loadTweets();
    }
  }, [profile, activeTab]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const userData = await api.get(`/users/${username}`);
      setProfile(userData);
      setIsFollowing(userData.followers.includes(currentUser?.id));
    } catch (error) {
      console.error('Error loading profile:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadTweets = async () => {
    try {
      let endpoint = `/users/${username}/tweets`;
      if (activeTab === 'reactions') {
        endpoint = `/users/${username}/likes`;
      }
      const data = await api.get(endpoint);
      setTweets(data);
    } catch (error) {
      console.error('Error loading tweets:', error);
    }
  };

  const loadFollowList = async (type) => {
    try {
      const data = await api.get(`/users/${username}/${type}`);
      setFollowList(data);
      setShowFollowModal(type);
    } catch (error) {
      console.error('Error loading follow list:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const result = await api.post(`/users/${username}/follow`);
      setIsFollowing(result.following);
      setProfile(prev => ({
        ...prev,
        followers: result.following 
          ? [...prev.followers, currentUser.id]
          : prev.followers.filter(id => id !== currentUser.id)
      }));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#a855f7] border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-[#71767b]">
        User not found
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-white/[0.08] z-10 p-4 flex items-center gap-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/[0.06] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#e7e9ea]" fill="currentColor">
            <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-1">
            {profile.displayName}
            {profile.streak >= 7 && <span className="text-orange-400 text-sm">🔥</span>}
          </h1>
          <p className="text-[#71767b] text-sm">{tweets.length} chirps</p>
        </div>
      </div>

      {/* Banner */}
      <div className="h-32 bg-white/[0.06]" />

      {/* Profile Info */}
      <div className="px-4 pb-4 border-b border-white/[0.08]">
        <div className="flex justify-between items-start -mt-16 mb-4">
          <img
            src={profile.avatar}
            alt={profile.displayName}
            className="w-28 h-28 rounded-full border-4 border-black"
          />
          {isOwnProfile ? (
            <button
              onClick={() => setShowEditModal(true)}
              className="mt-20 btn-secondary"
            >
              Edit profile
            </button>
          ) : (
            <button
              onClick={handleFollow}
              className={`mt-20 ${isFollowing ? 'btn-secondary hover:border-red-500/50 hover:text-red-400' : 'bg-white text-black font-semibold py-2 px-4 rounded-full hover:bg-white/90 transition-colors'}`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        <h2 className="text-xl font-semibold text-white flex items-center gap-1">
          {profile.displayName}
          {profile.achievements?.slice(0, 3).map(ach => {
            const achievement = ACHIEVEMENTS[ach];
            return achievement ? (
              <span key={ach} className="text-sm opacity-80" title={achievement.name}>
                {achievement.emoji}
              </span>
            ) : null;
          })}
        </h2>
        <p className="text-[#71767b]">@{profile.username}</p>
        
        {profile.bio && (
          <p className="mt-3 text-[#e7e9ea]">{profile.bio}</p>
        )}

        <div className="flex flex-wrap gap-4 mt-3 text-[#71767b] text-sm">
          {profile.location && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M12 7c-1.93 0-3.5 1.57-3.5 3.5S10.07 14 12 14s3.5-1.57 3.5-3.5S13.93 7 12 7zm0 5c-.827 0-1.5-.673-1.5-1.5S11.173 9 12 9s1.5.673 1.5 1.5S12.827 12 12 12zm0-10c-4.687 0-8.5 3.813-8.5 8.5 0 5.967 7.621 11.116 7.945 11.332l.555.37.555-.37c.324-.216 7.945-5.365 7.945-11.332C20.5 5.813 16.687 2 12 2zm0 17.77c-1.665-1.241-6.5-5.196-6.5-9.27C5.5 6.916 8.416 4 12 4s6.5 2.916 6.5 6.5c0 4.073-4.835 8.028-6.5 9.27z" />
              </svg>
              {profile.location}
            </span>
          )}
          {profile.website && (
            <a 
              href={profile.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#a855f7] hover:underline"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z" />
              </svg>
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-12C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5v12c0 .28.23.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zm0 6h2v-2H7v2zm0 4h2v-2H7v2zm4-4h2v-2h-2v2zm0 4h2v-2h-2v2zm4-4h2v-2h-2v2z" />
            </svg>
            Joined {format(new Date(profile.joinedAt), 'MMMM yyyy')}
          </span>
          {profile.streak > 0 && (
            <span className="flex items-center gap-1 text-orange-400">
              🔥 {profile.streak} day streak
            </span>
          )}
        </div>

        <div className="flex gap-4 mt-3">
          <button 
            onClick={() => loadFollowList('following')}
            className="hover:underline"
          >
            <span className="font-semibold text-[#e7e9ea]">{profile.following.length}</span>
            <span className="text-[#71767b]"> Following</span>
          </button>
          <button 
            onClick={() => loadFollowList('followers')}
            className="hover:underline"
          >
            <span className="font-semibold text-[#e7e9ea]">{profile.followers.length}</span>
            <span className="text-[#71767b]"> Followers</span>
          </button>
        </div>

        {/* Achievements */}
        {profile.achievements && profile.achievements.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.achievements.map(ach => {
              const achievement = ACHIEVEMENTS[ach];
              return achievement ? (
                <div 
                  key={ach}
                  className="badge badge-subtle"
                  title={achievement.description}
                >
                  <span>{achievement.emoji}</span>
                  <span>{achievement.name}</span>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.08]">
        {['chirps', 'replies', 'reactions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 tab ${activeTab === tab ? 'active' : ''} capitalize`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tweets */}
      <div className="fade-in">
        {tweets.length === 0 ? (
          <div className="p-8 text-center text-[#71767b]">
            {activeTab === 'reactions' ? 'No reactions yet' : 'No chirps yet'}
          </div>
        ) : (
          tweets.map(tweet => (
            <Tweet key={tweet.id} tweet={tweet} />
          ))
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updated) => {
            setProfile(updated);
            updateUser(updated);
            setShowEditModal(false);
          }}
        />
      )}

      {/* Follow List Modal */}
      {showFollowModal && (
        <FollowModal
          type={showFollowModal}
          users={followList}
          onClose={() => {
            setShowFollowModal(null);
            setFollowList([]);
          }}
        />
      )}
    </div>
  );
}

function EditProfileModal({ profile, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    displayName: profile.displayName,
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.uploadPut('/users/profile', formData);
      onUpdate(updated);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative glass rounded-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto border border-white/[0.08]">
        <div className="sticky top-0 glass p-4 flex items-center justify-between border-b border-white/[0.08]">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/[0.06] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#e7e9ea]" fill="currentColor">
                <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-white">Edit profile</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-white text-black font-semibold py-1.5 px-4 rounded-full hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        <form className="p-4 space-y-4">
          <div>
            <label className="block text-[#71767b] text-sm mb-1">Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="input-clean w-full"
            />
          </div>
          <div>
            <label className="block text-[#71767b] text-sm mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="input-clean w-full resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-[#71767b] text-sm mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="input-clean w-full"
            />
          </div>
          <div>
            <label className="block text-[#71767b] text-sm mb-1">Website</label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="input-clean w-full"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

function FollowModal({ type, users, onClose }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative glass rounded-2xl w-full max-w-[400px] max-h-[80vh] overflow-y-auto border border-white/[0.08]">
        <div className="sticky top-0 glass p-4 flex items-center gap-4 border-b border-white/[0.08]">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/[0.06] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#e7e9ea]" fill="currentColor">
              <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-white capitalize">{type}</h2>
        </div>

        <div>
          {users.length === 0 ? (
            <div className="p-8 text-center text-[#71767b]">
              No {type} yet
            </div>
          ) : (
            users.map(user => (
              <div
                key={user.id}
                onClick={() => {
                  navigate(`/${user.username}`);
                  onClose();
                }}
                className="p-4 hover:bg-white/[0.03] cursor-pointer transition-colors flex items-center gap-3"
              >
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#e7e9ea] truncate flex items-center gap-1">
                    {user.displayName}
                    {user.streak >= 7 && <span className="text-orange-400 text-xs">🔥</span>}
                  </div>
                  <div className="text-[#71767b] text-sm truncate">@{user.username}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
