import type {
  User,
  UserProfile,
  Tweet,
  Notification,
  Message,
  Conversation,
  AuthResponse,
  PaginatedResponse,
  LeaderboardEntry,
  DailyChallenge,
  TrendingHashtag,
  SearchResults,
  CreateTweetInput,
  ReactionType,
  VibeType,
} from '@chirp/shared';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new ApiError(response.status, error.message || error.error);
  }

  return response.json();
}

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (data: { username: string; email: string; password: string; name: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<User>('/auth/me'),
};

// Users
export const userApi = {
  getProfile: (username: string) =>
    request<UserProfile>(`/users/${username}`),

  updateProfile: (data: Partial<User>) =>
    request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return request<{ avatar: string }>('/users/avatar', {
      method: 'PUT',
      body: formData,
    });
  },

  updateBanner: (file: File) => {
    const formData = new FormData();
    formData.append('banner', file);
    return request<{ banner: string }>('/users/banner', {
      method: 'PUT',
      body: formData,
    });
  },

  follow: (username: string) =>
    request<{ message: string }>(`/users/${username}/follow`, { method: 'POST' }),

  unfollow: (username: string) =>
    request<{ message: string }>(`/users/${username}/follow`, { method: 'DELETE' }),

  getFollowers: (username: string) =>
    request<UserProfile[]>(`/users/${username}/followers`),

  getFollowing: (username: string) =>
    request<UserProfile[]>(`/users/${username}/following`),

  getSuggested: (limit = 5) =>
    request<UserProfile[]>(`/users/suggested?limit=${limit}`),
};

// Tweets
export const tweetApi = {
  create: (data: CreateTweetInput & { media?: File[] }) => {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.vibe) formData.append('vibe', data.vibe);
    if (data.hasCode) formData.append('hasCode', 'true');
    if (data.parentId) formData.append('parentId', data.parentId);
    if (data.poll) formData.append('poll', JSON.stringify(data.poll));
    if (data.media) {
      data.media.forEach((file) => formData.append('media', file));
    }
    return request<{ tweet: Tweet; newAchievements: string[] }>('/tweets', {
      method: 'POST',
      body: formData,
    });
  },

  delete: (id: string) =>
    request<{ message: string }>(`/tweets/${id}`, { method: 'DELETE' }),

  getById: (id: string) =>
    request<Tweet>(`/tweets/${id}`),

  getReplies: (id: string, cursor?: string, limit = 20) =>
    request<PaginatedResponse<Tweet>>(`/tweets/${id}/replies?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`),

  getFeed: (type: 'for_you' | 'following' = 'for_you', cursor?: string, limit = 20) =>
    request<PaginatedResponse<Tweet>>(`/tweets/feed?type=${type}&limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`),

  getUserTweets: (username: string, cursor?: string, limit = 20) =>
    request<PaginatedResponse<Tweet>>(`/tweets/user/${username}?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`),

  getByVibe: (vibe: VibeType, cursor?: string, limit = 20) =>
    request<PaginatedResponse<Tweet>>(`/tweets/vibe/${vibe}?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`),

  react: (id: string, type: ReactionType) =>
    request<{ action: string; type: ReactionType }>(`/tweets/${id}/react`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),

  retweet: (id: string) =>
    request<{ action: string }>(`/tweets/${id}/retweet`, { method: 'POST' }),

  vote: (id: string, optionId: string) =>
    request<{ message: string }>(`/tweets/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionId }),
    }),
};

// Notifications
export const notificationApi = {
  getAll: (cursor?: string, limit = 20) =>
    request<PaginatedResponse<Notification>>(`/notifications?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`),

  getUnreadCount: () =>
    request<{ count: number }>('/notifications/unread'),

  markAsRead: (id: string) =>
    request<{ message: string }>(`/notifications/${id}/read`, { method: 'PUT' }),

  markAllAsRead: () =>
    request<{ message: string }>('/notifications/read', { method: 'PUT' }),
};

// Messages
export const messageApi = {
  getConversations: () =>
    request<Conversation[]>('/messages'),

  getConversation: (username: string, cursor?: string, limit = 50) =>
    request<{ user: UserProfile; data: Message[]; nextCursor: string | null; hasMore: boolean }>(
      `/messages/${username}?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`
    ),

  send: (receiverId: string, content: string) =>
    request<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    }),

  getUnreadCount: () =>
    request<{ count: number }>('/messages/unread'),
};

// Search
export const searchApi = {
  search: (query: string, type = 'all', limit = 20) =>
    request<SearchResults>(`/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`),

  getTrending: (limit = 10) =>
    request<TrendingHashtag[]>(`/search/trending?limit=${limit}`),

  getLeaderboard: (limit = 20) =>
    request<LeaderboardEntry[]>(`/search/leaderboard?limit=${limit}`),

  getDailyChallenge: () =>
    request<DailyChallenge>('/search/challenge'),
};

export { ApiError };
