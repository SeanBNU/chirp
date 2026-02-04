import { Link } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { notificationApi } from '../services/api';
import { REACTIONS } from '../utils/vibes';
import type { Notification as NotificationType } from '@chirp/shared';

function getNotificationText(notification: NotificationType): string {
  switch (notification.type) {
    case 'follow':
      return 'followed you';
    case 'reaction': {
      const emoji = notification.reactionType ? REACTIONS[notification.reactionType]?.emoji : '';
      return `reacted ${emoji} to your chirp`;
    }
    case 'reply':
      return 'replied to your chirp';
    case 'retweet':
      return 'rechirped your chirp';
    case 'mention':
      return 'mentioned you';
    default:
      return '';
  }
}

function getNotificationIcon(type: string): string {
  switch (type) {
    case 'follow':
      return '👤';
    case 'reaction':
      return '❤️';
    case 'reply':
      return '💬';
    case 'retweet':
      return '🔁';
    case 'mention':
      return '@';
    default:
      return '🔔';
  }
}

export function Notifications() {
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) => notificationApi.getAll(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const markAllRead = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div>
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 px-4 py-3 flex items-center justify-between border-b border-white/[0.08]">
        <h1 className="text-xl font-semibold">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={() => markAllRead.mutate()}
            className="text-sm text-[#a855f7] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </header>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length > 0 ? (
        <>
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              to={
                notification.tweetId
                  ? `/${notification.sender.username}/status/${notification.tweetId}`
                  : `/${notification.sender.username}`
              }
              className={`flex gap-3 p-4 border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors ${
                !notification.read ? 'bg-white/[0.02]' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                notification.type === 'follow' ? 'bg-[#a855f7]/20' :
                notification.type === 'reaction' ? 'bg-red-500/20' :
                notification.type === 'retweet' ? 'bg-green-500/20' :
                'bg-blue-500/20'
              }`}>
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <img
                    src={notification.sender.avatar || ''}
                    alt={notification.sender.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-semibold">{notification.sender.name}</span>
                  <span className="text-[#71767b]">{getNotificationText(notification)}</span>
                </div>
                <div className="text-sm text-[#71767b] mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </div>
                {notification.tweet && (
                  <div className="mt-2 text-sm text-[#71767b] line-clamp-2">
                    {notification.tweet.content}
                  </div>
                )}
              </div>
            </Link>
          ))}

          {hasNextPage && (
            <div className="py-4 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="btn-secondary"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center text-[#71767b]">
          No notifications yet
        </div>
      )}
    </div>
  );
}
