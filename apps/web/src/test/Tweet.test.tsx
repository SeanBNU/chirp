import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Tweet } from '../components/Tweet';
import type { Tweet as TweetType } from '@chirp/shared';

const mockTweet: TweetType = {
  id: 'test-tweet-1',
  content: 'Hello, world! #test',
  authorId: 'user-1',
  author: {
    id: 'user-1',
    username: 'testuser',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    streak: 10,
  },
  vibe: 'chill',
  hasCode: false,
  media: [],
  parentId: null,
  retweetOfId: null,
  reactionCounts: {
    fire: 5,
    rocket: 3,
    insightful: 2,
    love: 10,
    funny: 1,
    mindblown: 0,
  },
  totalReactions: 21,
  userReaction: null,
  repliesCount: 3,
  retweetsCount: 2,
  isRetweeted: false,
  poll: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function renderWithProviders(component: React.ReactNode) {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe('Tweet Component', () => {
  it('renders tweet content', () => {
    renderWithProviders(<Tweet tweet={mockTweet} />);
    
    expect(screen.getByText(/Hello, world!/)).toBeInTheDocument();
  });

  it('renders author name', () => {
    renderWithProviders(<Tweet tweet={mockTweet} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders author username', () => {
    renderWithProviders(<Tweet tweet={mockTweet} />);
    
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('renders reaction count', () => {
    renderWithProviders(<Tweet tweet={mockTweet} />);
    
    expect(screen.getByText('21')).toBeInTheDocument();
  });

  it('renders streak indicator when user has streak', () => {
    renderWithProviders(<Tweet tweet={mockTweet} />);
    
    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('renders vibe emoji when tweet has vibe', () => {
    renderWithProviders(<Tweet tweet={mockTweet} />);
    
    expect(screen.getByTitle('Chill')).toBeInTheDocument();
  });
});
