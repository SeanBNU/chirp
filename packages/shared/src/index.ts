// User types
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
  location: string | null;
  website: string | null;
  streak: number;
  lastPostDate: string | null;
  totalReactions: number;
  soundEnabled: boolean;
  focusMode: boolean;
  theme: 'dark' | 'light';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
  isFollowing?: boolean;
  achievements: Achievement[];
}

export interface UserSummary {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  streak: number;
}

// Tweet types
export interface Tweet {
  id: string;
  content: string;
  authorId: string;
  author: UserSummary;
  vibe: VibeType | null;
  hasCode: boolean;
  media: string[];
  parentId: string | null;
  retweetOfId: string | null;
  retweetOf?: Tweet;
  reactionCounts: ReactionCounts;
  totalReactions: number;
  userReaction: ReactionType | null;
  repliesCount: number;
  retweetsCount: number;
  isRetweeted: boolean;
  poll: PollWithResults | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTweetInput {
  content: string;
  vibe?: VibeType;
  hasCode?: boolean;
  media?: string[];
  parentId?: string;
  poll?: CreatePollInput;
}

// Vibe types
export const VIBE_TYPES = ['chill', 'hype', 'thoughtful', 'celebration', 'rant', 'learning'] as const;
export type VibeType = typeof VIBE_TYPES[number];

export interface Vibe {
  id: VibeType;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

export const VIBES: Record<VibeType, Vibe> = {
  chill: { id: 'chill', label: 'Chill', emoji: '😌', color: '#8b5cf6', description: 'Relaxed and easy-going' },
  hype: { id: 'hype', label: 'Hype', emoji: '🔥', color: '#f97316', description: 'Excited and energetic' },
  thoughtful: { id: 'thoughtful', label: 'Thoughtful', emoji: '🤔', color: '#0ea5e9', description: 'Deep and reflective' },
  celebration: { id: 'celebration', label: 'Celebration', emoji: '🎉', color: '#ec4899', description: 'Celebrating wins' },
  rant: { id: 'rant', label: 'Rant', emoji: '😤', color: '#ef4444', description: 'Letting it out' },
  learning: { id: 'learning', label: 'Learning', emoji: '💡', color: '#22c55e', description: 'Sharing knowledge' },
};

// Reaction types
export const REACTION_TYPES = ['fire', 'rocket', 'insightful', 'love', 'funny', 'mindblown'] as const;
export type ReactionType = typeof REACTION_TYPES[number];

export interface Reaction {
  id: ReactionType;
  emoji: string;
  label: string;
  color: string;
}

export const REACTIONS: Record<ReactionType, Reaction> = {
  fire: { id: 'fire', emoji: '🔥', label: 'Fire', color: '#f97316' },
  rocket: { id: 'rocket', emoji: '🚀', label: 'Rocket', color: '#3b82f6' },
  insightful: { id: 'insightful', emoji: '💡', label: 'Insightful', color: '#eab308' },
  love: { id: 'love', emoji: '❤️', label: 'Love', color: '#ef4444' },
  funny: { id: 'funny', emoji: '😂', label: 'Funny', color: '#22c55e' },
  mindblown: { id: 'mindblown', emoji: '🤯', label: 'Mind Blown', color: '#a855f7' },
};

export type ReactionCounts = Record<ReactionType, number>;

// Poll types
export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  endsAt: string;
  createdAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  votesCount: number;
}

export interface PollWithResults extends Poll {
  totalVotes: number;
  userVotedOptionId: string | null;
  options: (PollOption & { percentage: number })[];
}

export interface CreatePollInput {
  question: string;
  options: string[];
  endsAt?: string;
}

// Achievement types
export const ACHIEVEMENT_IDS = [
  'first_chirp',
  'streak_week',
  'streak_month',
  'prolific',
  'code_wizard',
  'poll_master',
  'social_butterfly',
  'influencer',
  'night_owl',
  'early_bird',
  'conversation_starter',
] as const;
export type AchievementId = typeof ACHIEVEMENT_IDS[number];

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  emoji: string;
  unlockedAt?: string;
}

export const ACHIEVEMENTS: Record<AchievementId, Omit<Achievement, 'unlockedAt'>> = {
  first_chirp: { id: 'first_chirp', name: 'First Chirp', description: 'Posted your first chirp', emoji: '🐣' },
  streak_week: { id: 'streak_week', name: 'Week Warrior', description: '7 day posting streak', emoji: '📅' },
  streak_month: { id: 'streak_month', name: 'Monthly Master', description: '30 day posting streak', emoji: '🏆' },
  prolific: { id: 'prolific', name: 'Prolific', description: 'Posted 50 chirps', emoji: '✍️' },
  code_wizard: { id: 'code_wizard', name: 'Code Wizard', description: 'Shared 10 code snippets', emoji: '🧙' },
  poll_master: { id: 'poll_master', name: 'Poll Master', description: 'Created 5 polls', emoji: '📊' },
  social_butterfly: { id: 'social_butterfly', name: 'Social Butterfly', description: 'Following 50 people', emoji: '🦋' },
  influencer: { id: 'influencer', name: 'Influencer', description: 'Reached 100 followers', emoji: '⭐' },
  night_owl: { id: 'night_owl', name: 'Night Owl', description: 'Posted after midnight', emoji: '🦉' },
  early_bird: { id: 'early_bird', name: 'Early Bird', description: 'Posted before 6 AM', emoji: '🐦' },
  conversation_starter: { id: 'conversation_starter', name: 'Conversation Starter', description: 'Got 10 replies on a chirp', emoji: '💬' },
};

// Follow types
export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

// Notification types
export const NOTIFICATION_TYPES = ['follow', 'reaction', 'reply', 'retweet', 'mention'] as const;
export type NotificationType = typeof NOTIFICATION_TYPES[number];

export interface Notification {
  id: string;
  type: NotificationType;
  recipientId: string;
  sender: UserSummary;
  tweetId: string | null;
  tweet?: Tweet;
  reactionType?: ReactionType;
  read: boolean;
  createdAt: string;
}

// Message types
export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: UserSummary;
  receiverId: string;
  receiver: UserSummary;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  user: UserSummary;
  lastMessage: Message;
  unreadCount: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Auth types
export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Leaderboard types
export interface LeaderboardEntry {
  user: UserSummary;
  totalReactions: number;
  streak: number;
  achievements: Achievement[];
  rank: number;
}

// Daily Challenge types
export interface DailyChallenge {
  id: string;
  prompt: string;
  vibe: VibeType;
  date: string;
}

// Search types
export interface SearchResults {
  users: UserSummary[];
  tweets: Tweet[];
  hashtags: { tag: string; count: number }[];
}

// Trending types
export interface TrendingHashtag {
  tag: string;
  count: number;
  rank: number;
}

// WebSocket event types
export interface SocketEvents {
  'notification:new': Notification;
  'message:new': Message;
  'tweet:reaction': { tweetId: string; reactionCounts: ReactionCounts };
}
