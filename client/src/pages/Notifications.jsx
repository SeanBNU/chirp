import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import api from '../utils/api';
import { REACTIONS } from '../utils/vibes';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.get('/notifications');
      setNotifications(data);
      // Mark all as read
      await api.put('/notifications/read');
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'reaction':
        const reaction = REACTIONS[notification.reaction];
        return `reacted ${reaction?.emoji || '❤️'} to your chirp`;
      case 'retweet':
        return 'rechirped your post';
      case 'follow':
        return 'followed you';
      case 'reply':
        return 'replied to your chirp';
      case 'mention':
        return 'mentioned you in a chirp';
      default:
        return 'interacted with you';
    }
  };

  const getNotificationIcon = (notification) => {
    switch (notification.type) {
      case 'reaction':
        const reaction = REACTIONS[notification.reaction];
        return (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: `${reaction?.color || '#ec4899'}20` }}
          >
            {reaction?.emoji || '❤️'}
          </div>
        );
      case 'retweet':
        return (
          <div className="w-8 h-8 rounded-full bg-twitter-green/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-twitter-green" fill="currentColor">
              <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
            </svg>
          </div>
        );
      case 'follow':
        return (
          <div className="w-8 h-8 rounded-full bg-twitter-blue/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-twitter-blue" fill="currentColor">
              <path d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z" />
            </svg>
          </div>
        );
      case 'reply':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-purple-500" fill="currentColor">
              <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01z" />
            </svg>
          </div>
        );
      case 'mention':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
            @
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-twitter-blue/20 flex items-center justify-center">
            🐦
          </div>
        );
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === 'follow') {
      navigate(`/${notification.fromUser?.username}`);
    } else if (notification.tweet) {
      navigate(`/${notification.fromUser?.username}/status/${notification.tweetId}`);
    }
  };

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-twitter-lightGray z-10 p-4">
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-twitter-blue"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-5xl mb-4">🔔</div>
          <h2 className="text-2xl font-bold mb-2">Nothing to see here — yet</h2>
          <p className="text-twitter-gray">
            From reactions to rechirps and a whole lot more, this is where all the action happens.
          </p>
        </div>
      ) : (
        <div>
          {notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 border-b border-twitter-lightGray hover:bg-white/[0.03] cursor-pointer transition-colors ${
                !notification.read ? 'bg-twitter-blue/5' : ''
              }`}
            >
              <div className="flex gap-3">
                {getNotificationIcon(notification)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={notification.fromUser?.avatar}
                      alt={notification.fromUser?.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                  <p>
                    <span className="font-bold">{notification.fromUser?.displayName}</span>
                    {' '}{getNotificationText(notification)}
                  </p>
                  {notification.tweet && (
                    <p className="text-twitter-gray mt-1 line-clamp-2">
                      {notification.tweet.content}
                    </p>
                  )}
                  <span className="text-twitter-gray text-sm">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
