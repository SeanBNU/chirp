import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { userApi } from '../services/api';
import { useUserTweets } from '../hooks/useTweets';
import { useAuthStore } from '../stores/authStore';
import { Tweet } from '../components/Tweet';
import { ACHIEVEMENTS } from '@chirp/shared';

export function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'tweets' | 'replies' | 'likes'>('tweets');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => userApi.getProfile(username!),
    enabled: !!username,
  });

  const { data: tweets } = useUserTweets(username!);
  const tweetList = tweets?.pages.flatMap((page) => page.data) || [];

  const followMutation = useMutation({
    mutationFn: () => 
      profile?.isFollowing 
        ? userApi.unfollow(username!) 
        : userApi.follow(username!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
    },
  });

  const isOwnProfile = currentUser?.username === username;

  if (profileLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">User not found</h2>
      </div>
    );
  }

  return (
    <div>
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 px-4 py-2 flex items-center gap-4">
        <Link to="/" className="p-2 rounded-full hover:bg-white/[0.1]">
          ←
        </Link>
        <div>
          <h1 className="font-semibold">{profile.name}</h1>
          <p className="text-sm text-[#71767b]">{profile.tweetsCount} chirps</p>
        </div>
      </header>

      {/* Banner */}
      <div className="h-32 bg-white/[0.06]">
        {profile.banner && (
          <img src={profile.banner} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4 border-b border-white/[0.08]">
        <div className="flex justify-between items-start -mt-12 mb-4">
          <img
            src={profile.avatar || ''}
            alt={profile.name}
            className="w-24 h-24 rounded-full border-4 border-black"
          />
          
          {isOwnProfile ? (
            <button className="btn-secondary mt-14">
              Edit profile
            </button>
          ) : (
            <button
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className={`mt-14 ${profile.isFollowing ? 'btn-secondary' : 'bg-white text-black font-semibold px-4 py-2 rounded-full'}`}
            >
              {profile.isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        <h2 className="text-xl font-bold flex items-center gap-2">
          {profile.name}
          {profile.streak > 0 && (
            <span className="text-orange-400 text-base">🔥 {profile.streak}d</span>
          )}
        </h2>
        <p className="text-[#71767b]">@{profile.username}</p>
        
        {profile.bio && <p className="mt-2">{profile.bio}</p>}

        <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#71767b]">
          {profile.location && (
            <span>📍 {profile.location}</span>
          )}
          {profile.website && (
            <a href={profile.website} className="text-[#a855f7] hover:underline">
              🔗 {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          <span>📅 Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}</span>
        </div>

        <div className="flex gap-4 mt-3">
          <Link to={`/${username}/following`} className="hover:underline">
            <strong>{profile.followingCount}</strong>
            <span className="text-[#71767b]"> Following</span>
          </Link>
          <Link to={`/${username}/followers`} className="hover:underline">
            <strong>{profile.followersCount}</strong>
            <span className="text-[#71767b]"> Followers</span>
          </Link>
        </div>

        {profile.achievements && profile.achievements.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.achievements.map((achievement) => (
              <span
                key={achievement.id}
                className="badge badge-subtle"
                title={ACHIEVEMENTS[achievement.id as keyof typeof ACHIEVEMENTS]?.description}
              >
                {achievement.emoji} {achievement.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.08]">
        {(['tweets', 'replies', 'likes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-center capitalize transition-colors ${
              activeTab === tab ? 'font-semibold' : 'text-[#71767b]'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="h-1 bg-[#a855f7] rounded-full w-14 mx-auto mt-3" />
            )}
          </button>
        ))}
      </div>

      {/* Tweets */}
      {activeTab === 'tweets' && (
        tweetList.length > 0 ? (
          tweetList.map((tweet) => (
            <Tweet key={tweet.id} tweet={tweet} />
          ))
        ) : (
          <div className="p-8 text-center text-[#71767b]">
            No chirps yet
          </div>
        )
      )}
    </div>
  );
}
