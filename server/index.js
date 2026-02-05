import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'chirp-clone-secret-key-2024';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Ensure directories exist
const dataDir = join(__dirname, 'data');
const uploadsDir = join(__dirname, 'uploads');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Data helpers
const readData = (file) => {
  const path = join(dataDir, file);
  if (!fs.existsSync(path)) return [];
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
};

const writeData = (file, data) => {
  fs.writeFileSync(join(dataDir, file), JSON.stringify(data, null, 2));
};

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Achievement checker
function checkAchievements(userId) {
  const users = readData('users.json');
  const tweets = readData('tweets.json');
  const user = users.find(u => u.id === userId);
  if (!user) return [];

  const newAchievements = [];
  const userTweets = tweets.filter(t => t.authorId === userId);
  const userAchievements = user.achievements || [];

  // First chirp
  if (userTweets.length >= 1 && !userAchievements.includes('first_chirp')) {
    newAchievements.push('first_chirp');
  }

  // Prolific (50 chirps)
  if (userTweets.length >= 50 && !userAchievements.includes('prolific')) {
    newAchievements.push('prolific');
  }

  // Code wizard (10 code snippets)
  const codeChirps = userTweets.filter(t => t.hasCode);
  if (codeChirps.length >= 10 && !userAchievements.includes('code_wizard')) {
    newAchievements.push('code_wizard');
  }

  // Poll master (5 polls)
  const pollChirps = userTweets.filter(t => t.poll);
  if (pollChirps.length >= 5 && !userAchievements.includes('poll_master')) {
    newAchievements.push('poll_master');
  }

  // Social butterfly (50 following)
  if (user.following.length >= 50 && !userAchievements.includes('social_butterfly')) {
    newAchievements.push('social_butterfly');
  }

  // Influencer (100 followers)
  if (user.followers.length >= 100 && !userAchievements.includes('influencer')) {
    newAchievements.push('influencer');
  }

  // Streak achievements
  if (user.streak >= 7 && !userAchievements.includes('streak_week')) {
    newAchievements.push('streak_week');
  }
  if (user.streak >= 30 && !userAchievements.includes('streak_month')) {
    newAchievements.push('streak_month');
  }

  // Time-based achievements
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 4 && !userAchievements.includes('night_owl')) {
    newAchievements.push('night_owl');
  }
  if (hour >= 5 && hour < 7 && !userAchievements.includes('early_bird')) {
    newAchievements.push('early_bird');
  }

  // Update user achievements
  if (newAchievements.length > 0) {
    user.achievements = [...userAchievements, ...newAchievements];
    writeData('users.json', users);
  }

  return newAchievements;
}

// Update streak
function updateStreak(userId) {
  const users = readData('users.json');
  const user = users.find(u => u.id === userId);
  if (!user) return;

  const today = new Date().toDateString();
  const lastPost = user.lastPostDate ? new Date(user.lastPostDate).toDateString() : null;

  if (lastPost !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastPost === yesterday.toDateString()) {
      user.streak = (user.streak || 0) + 1;
    } else if (lastPost !== today) {
      user.streak = 1;
    }
    user.lastPostDate = new Date().toISOString();
    writeData('users.json', users);
  }
}

// AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, displayName } = req.body;
  const users = readData('users.json');
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    username,
    email,
    password: hashedPassword,
    displayName: displayName || username,
    bio: '',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    banner: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600',
    location: '',
    website: '',
    joinedAt: new Date().toISOString(),
    followers: [],
    following: [],
    achievements: [],
    streak: 0,
    lastPostDate: null,
    totalReactions: 0,
    soundEnabled: true,
    focusMode: false,
    theme: 'dark'
  };

  users.push(user);
  writeData('users.json', users);

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const users = readData('users.json');
  const user = users.find(u => u.username === username || u.email === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

app.get('/api/auth/me', auth, (req, res) => {
  const users = readData('users.json');
  const user = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// USER ROUTES
app.get('/api/users', (req, res) => {
  const users = readData('users.json');
  const safeUsers = users.map(({ password, ...u }) => u);
  res.json(safeUsers);
});

app.get('/api/users/:username', (req, res) => {
  const users = readData('users.json');
  const user = users.find(u => u.username === req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.put('/api/users/profile', auth, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), (req, res) => {
  const users = readData('users.json');
  const userIndex = users.findIndex(u => u.id === req.userId);
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

  const { displayName, bio, location, website, soundEnabled, focusMode, theme } = req.body;
  if (displayName) users[userIndex].displayName = displayName;
  if (bio !== undefined) users[userIndex].bio = bio;
  if (location !== undefined) users[userIndex].location = location;
  if (website !== undefined) users[userIndex].website = website;
  if (soundEnabled !== undefined) users[userIndex].soundEnabled = soundEnabled === 'true';
  if (focusMode !== undefined) users[userIndex].focusMode = focusMode === 'true';
  if (theme !== undefined) users[userIndex].theme = theme;
  
  if (req.files?.avatar) {
    users[userIndex].avatar = `http://localhost:${PORT}/uploads/${req.files.avatar[0].filename}`;
  }
  if (req.files?.banner) {
    users[userIndex].banner = `http://localhost:${PORT}/uploads/${req.files.banner[0].filename}`;
  }

  writeData('users.json', users);
  const { password: _, ...userWithoutPassword } = users[userIndex];
  res.json(userWithoutPassword);
});

app.post('/api/users/:username/follow', auth, (req, res) => {
  const users = readData('users.json');
  const currentUser = users.find(u => u.id === req.userId);
  const targetUser = users.find(u => u.username === req.params.username);

  if (!targetUser) return res.status(404).json({ error: 'User not found' });
  if (currentUser.id === targetUser.id) return res.status(400).json({ error: 'Cannot follow yourself' });

  const isFollowing = currentUser.following.includes(targetUser.id);
  
  if (isFollowing) {
    currentUser.following = currentUser.following.filter(id => id !== targetUser.id);
    targetUser.followers = targetUser.followers.filter(id => id !== currentUser.id);
  } else {
    currentUser.following.push(targetUser.id);
    targetUser.followers.push(currentUser.id);
    
    // Create notification
    const notifications = readData('notifications.json');
    notifications.push({
      id: uuidv4(),
      type: 'follow',
      userId: targetUser.id,
      fromUserId: currentUser.id,
      createdAt: new Date().toISOString(),
      read: false
    });
    writeData('notifications.json', notifications);
  }

  writeData('users.json', users);
  
  // Check achievements
  const newAchievements = checkAchievements(req.userId);
  
  res.json({ following: !isFollowing, newAchievements });
});

app.get('/api/users/:username/followers', (req, res) => {
  const users = readData('users.json');
  const user = users.find(u => u.username === req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const followers = users
    .filter(u => user.followers.includes(u.id))
    .map(({ password, ...u }) => u);
  res.json(followers);
});

app.get('/api/users/:username/following', (req, res) => {
  const users = readData('users.json');
  const user = users.find(u => u.username === req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const following = users
    .filter(u => user.following.includes(u.id))
    .map(({ password, ...u }) => u);
  res.json(following);
});

// TWEET/CHIRP ROUTES
app.get('/api/tweets', (req, res) => {
  const tweets = readData('tweets.json');
  const users = readData('users.json');
  
  const enrichedTweets = tweets
    .filter(t => !t.replyTo)
    .map(tweet => enrichTweet(tweet, tweets, users))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(enrichedTweets);
});

app.get('/api/tweets/feed', auth, (req, res) => {
  const tweets = readData('tweets.json');
  const users = readData('users.json');
  const currentUser = users.find(u => u.id === req.userId);
  
  const feedUserIds = [...currentUser.following, currentUser.id];
  const feedTweets = tweets
    .filter(t => feedUserIds.includes(t.authorId) && !t.replyTo)
    .map(tweet => enrichTweet(tweet, tweets, users))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(feedTweets);
});

app.get('/api/tweets/:id', (req, res) => {
  const tweets = readData('tweets.json');
  const users = readData('users.json');
  const tweet = tweets.find(t => t.id === req.params.id);
  
  if (!tweet) return res.status(404).json({ error: 'Tweet not found' });
  res.json(enrichTweet(tweet, tweets, users));
});

app.get('/api/tweets/:id/replies', (req, res) => {
  const tweets = readData('tweets.json');
  const users = readData('users.json');
  
  const replies = tweets
    .filter(t => t.replyTo === req.params.id)
    .map(tweet => enrichTweet(tweet, tweets, users))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(replies);
});

app.post('/api/tweets', auth, upload.array('media', 4), (req, res) => {
  const { content, replyTo, vibe, poll, hasCode } = req.body;
  const tweets = readData('tweets.json');
  const users = readData('users.json');

  const media = req.files?.map(f => `http://localhost:${PORT}/uploads/${f.filename}`) || [];
  
  // Parse poll if present
  let pollData = null;
  if (poll) {
    try {
      const parsedPoll = JSON.parse(poll);
      pollData = {
        question: parsedPoll.question,
        options: parsedPoll.options.map(opt => ({
          id: uuidv4(),
          text: opt,
          votes: []
        })),
        endsAt: new Date(Date.now() + (parsedPoll.duration || 24) * 60 * 60 * 1000).toISOString()
      };
    } catch (e) {
      // Invalid poll data, ignore
    }
  }

  const tweet = {
    id: uuidv4(),
    authorId: req.userId,
    content,
    media,
    reactions: {
      fire: [],
      rocket: [],
      lightbulb: [],
      heart: [],
      laugh: [],
      mindblown: []
    },
    retweets: [],
    replyTo: replyTo || null,
    vibe: vibe || null,
    poll: pollData,
    hasCode: hasCode === 'true',
    createdAt: new Date().toISOString()
  };

  tweets.push(tweet);
  writeData('tweets.json', tweets);

  // Update streak
  updateStreak(req.userId);

  // Create notification for reply
  if (replyTo) {
    const parentTweet = tweets.find(t => t.id === replyTo);
    if (parentTweet && parentTweet.authorId !== req.userId) {
      const notifications = readData('notifications.json');
      notifications.push({
        id: uuidv4(),
        type: 'reply',
        userId: parentTweet.authorId,
        fromUserId: req.userId,
        tweetId: tweet.id,
        createdAt: new Date().toISOString(),
        read: false
      });
      writeData('notifications.json', notifications);
    }
  }

  // Create notifications for mentions
  const mentions = content.match(/@(\w+)/g) || [];
  mentions.forEach(mention => {
    const mentionedUser = users.find(u => u.username === mention.slice(1));
    if (mentionedUser && mentionedUser.id !== req.userId) {
      const notifications = readData('notifications.json');
      notifications.push({
        id: uuidv4(),
        type: 'mention',
        userId: mentionedUser.id,
        fromUserId: req.userId,
        tweetId: tweet.id,
        createdAt: new Date().toISOString(),
        read: false
      });
      writeData('notifications.json', notifications);
    }
  });

  // Check achievements
  const newAchievements = checkAchievements(req.userId);

  res.json({ ...enrichTweet(tweet, tweets, users), newAchievements });
});

app.delete('/api/tweets/:id', auth, (req, res) => {
  let tweets = readData('tweets.json');
  const tweet = tweets.find(t => t.id === req.params.id);
  
  if (!tweet) return res.status(404).json({ error: 'Tweet not found' });
  if (tweet.authorId !== req.userId) return res.status(403).json({ error: 'Not authorized' });

  tweets = tweets.filter(t => t.id !== req.params.id && t.replyTo !== req.params.id);
  writeData('tweets.json', tweets);
  res.json({ success: true });
});

// Reactions (replaces simple likes)
app.post('/api/tweets/:id/react', auth, (req, res) => {
  const { reaction } = req.body;
  const validReactions = ['fire', 'rocket', 'lightbulb', 'heart', 'laugh', 'mindblown'];
  
  if (!validReactions.includes(reaction)) {
    return res.status(400).json({ error: 'Invalid reaction' });
  }

  const tweets = readData('tweets.json');
  const users = readData('users.json');
  const tweet = tweets.find(t => t.id === req.params.id);
  
  if (!tweet) return res.status(404).json({ error: 'Tweet not found' });

  // Initialize reactions if needed (for old tweets)
  if (!tweet.reactions) {
    tweet.reactions = {
      fire: [],
      rocket: [],
      lightbulb: [],
      heart: [],
      laugh: [],
      mindblown: []
    };
  }

  const reacted = tweet.reactions[reaction].includes(req.userId);
  if (reacted) {
    tweet.reactions[reaction] = tweet.reactions[reaction].filter(id => id !== req.userId);
  } else {
    // Remove any previous reaction from this user
    validReactions.forEach(r => {
      tweet.reactions[r] = tweet.reactions[r].filter(id => id !== req.userId);
    });
    tweet.reactions[reaction].push(req.userId);
    
    // Create notification
    if (tweet.authorId !== req.userId) {
      const notifications = readData('notifications.json');
      notifications.push({
        id: uuidv4(),
        type: 'reaction',
        reaction,
        userId: tweet.authorId,
        fromUserId: req.userId,
        tweetId: tweet.id,
        createdAt: new Date().toISOString(),
        read: false
      });
      writeData('notifications.json', notifications);
      
      // Update author's total reactions
      const author = users.find(u => u.id === tweet.authorId);
      if (author) {
        author.totalReactions = (author.totalReactions || 0) + 1;
        writeData('users.json', users);
      }
    }
  }

  writeData('tweets.json', tweets);
  
  // Check achievements
  const newAchievements = checkAchievements(tweet.authorId);
  
  res.json({ ...enrichTweet(tweet, tweets, users), newAchievements });
});

// Poll voting
app.post('/api/tweets/:id/vote', auth, (req, res) => {
  const { optionId } = req.body;
  const tweets = readData('tweets.json');
  const users = readData('users.json');
  const tweet = tweets.find(t => t.id === req.params.id);
  
  if (!tweet) return res.status(404).json({ error: 'Tweet not found' });
  if (!tweet.poll) return res.status(400).json({ error: 'Tweet has no poll' });
  
  // Check if poll has ended
  if (new Date(tweet.poll.endsAt) < new Date()) {
    return res.status(400).json({ error: 'Poll has ended' });
  }

  // Remove previous vote if any
  tweet.poll.options.forEach(opt => {
    opt.votes = opt.votes.filter(id => id !== req.userId);
  });

  // Add new vote
  const option = tweet.poll.options.find(opt => opt.id === optionId);
  if (!option) return res.status(400).json({ error: 'Invalid option' });
  
  option.votes.push(req.userId);
  writeData('tweets.json', tweets);

  res.json(enrichTweet(tweet, tweets, users));
});

app.post('/api/tweets/:id/retweet', auth, (req, res) => {
  const tweets = readData('tweets.json');
  const users = readData('users.json');
  const tweet = tweets.find(t => t.id === req.params.id);
  
  if (!tweet) return res.status(404).json({ error: 'Tweet not found' });

  const retweeted = tweet.retweets.includes(req.userId);
  if (retweeted) {
    tweet.retweets = tweet.retweets.filter(id => id !== req.userId);
  } else {
    tweet.retweets.push(req.userId);
    
    // Create notification
    if (tweet.authorId !== req.userId) {
      const notifications = readData('notifications.json');
      notifications.push({
        id: uuidv4(),
        type: 'retweet',
        userId: tweet.authorId,
        fromUserId: req.userId,
        tweetId: tweet.id,
        createdAt: new Date().toISOString(),
        read: false
      });
      writeData('notifications.json', notifications);
    }
  }

  writeData('tweets.json', tweets);
  res.json(enrichTweet(tweet, tweets, users));
});

app.get('/api/users/:username/tweets', (req, res) => {
  const tweets = readData('tweets.json');
  const users = readData('users.json');
  const user = users.find(u => u.username === req.params.username);
  
  if (!user) return res.status(404).json({ error: 'User not found' });

  const userTweets = tweets
    .filter(t => t.authorId === user.id && !t.replyTo)
    .map(tweet => enrichTweet(tweet, tweets, users))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(userTweets);
});

app.get('/api/users/:username/likes', (req, res) => {
  const tweets = readData('tweets.json');
  const users = readData('users.json');
  const user = users.find(u => u.username === req.params.username);
  
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Find tweets where user has any reaction
  const likedTweets = tweets
    .filter(t => {
      if (!t.reactions) return false;
      return Object.values(t.reactions).some(arr => arr.includes(user.id));
    })
    .map(tweet => enrichTweet(tweet, tweets, users))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(likedTweets);
});

// SEARCH ROUTES
app.get('/api/search', (req, res) => {
  const { q, type } = req.query;
  const tweets = readData('tweets.json');
  const users = readData('users.json');

  if (type === 'users') {
    const results = users
      .filter(u => 
        u.username.toLowerCase().includes(q.toLowerCase()) ||
        u.displayName.toLowerCase().includes(q.toLowerCase())
      )
      .map(({ password, ...u }) => u);
    return res.json(results);
  }

  const results = tweets
    .filter(t => t.content.toLowerCase().includes(q.toLowerCase()))
    .map(tweet => enrichTweet(tweet, tweets, users))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(results);
});

// HASHTAG ROUTES
app.get('/api/hashtags/trending', (req, res) => {
  const tweets = readData('tweets.json');
  const hashtagCounts = {};
  
  tweets.forEach(tweet => {
    const hashtags = tweet.content.match(/#(\w+)/g) || [];
    hashtags.forEach(tag => {
      const normalizedTag = tag.toLowerCase();
      hashtagCounts[normalizedTag] = (hashtagCounts[normalizedTag] || 0) + 1;
    });
  });

  const trending = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));
  
  res.json(trending);
});

app.get('/api/hashtags/:tag', (req, res) => {
  const tweets = readData('tweets.json');
  const users = readData('users.json');
  const tag = req.params.tag.toLowerCase();

  const results = tweets
    .filter(t => t.content.toLowerCase().includes(`#${tag}`))
    .map(tweet => enrichTweet(tweet, tweets, users))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(results);
});

// VIBE ROUTES
app.get('/api/vibes/:vibe', (req, res) => {
  const tweets = readData('tweets.json');
  const users = readData('users.json');

  const results = tweets
    .filter(t => t.vibe === req.params.vibe && !t.replyTo)
    .map(tweet => enrichTweet(tweet, tweets, users))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(results);
});

// NOTIFICATION ROUTES
app.get('/api/notifications', auth, (req, res) => {
  const notifications = readData('notifications.json');
  const users = readData('users.json');
  const tweets = readData('tweets.json');

  const userNotifications = notifications
    .filter(n => n.userId === req.userId)
    .map(notification => {
      const fromUser = users.find(u => u.id === notification.fromUserId);
      const tweet = notification.tweetId ? tweets.find(t => t.id === notification.tweetId) : null;
      return {
        ...notification,
        fromUser: fromUser ? { 
          id: fromUser.id, 
          username: fromUser.username, 
          displayName: fromUser.displayName, 
          avatar: fromUser.avatar 
        } : null,
        tweet: tweet ? { id: tweet.id, content: tweet.content } : null
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(userNotifications);
});

app.put('/api/notifications/read', auth, (req, res) => {
  const notifications = readData('notifications.json');
  notifications.forEach(n => {
    if (n.userId === req.userId) n.read = true;
  });
  writeData('notifications.json', notifications);
  res.json({ success: true });
});

// MESSAGE ROUTES
app.get('/api/messages', auth, (req, res) => {
  const messages = readData('messages.json');
  const users = readData('users.json');

  // Get unique conversations
  const conversations = {};
  messages
    .filter(m => m.senderId === req.userId || m.receiverId === req.userId)
    .forEach(m => {
      const otherUserId = m.senderId === req.userId ? m.receiverId : m.senderId;
      if (!conversations[otherUserId] || new Date(m.createdAt) > new Date(conversations[otherUserId].createdAt)) {
        conversations[otherUserId] = m;
      }
    });

  const conversationList = Object.entries(conversations).map(([otherUserId, lastMessage]) => {
    const otherUser = users.find(u => u.id === otherUserId);
    return {
      user: otherUser ? {
        id: otherUser.id,
        username: otherUser.username,
        displayName: otherUser.displayName,
        avatar: otherUser.avatar
      } : null,
      lastMessage
    };
  }).sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

  res.json(conversationList);
});

app.get('/api/messages/:userId', auth, (req, res) => {
  const messages = readData('messages.json');
  const conversation = messages
    .filter(m => 
      (m.senderId === req.userId && m.receiverId === req.params.userId) ||
      (m.senderId === req.params.userId && m.receiverId === req.userId)
    )
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  res.json(conversation);
});

app.post('/api/messages', auth, (req, res) => {
  const { receiverId, content } = req.body;
  const messages = readData('messages.json');
  const users = readData('users.json');

  const receiver = users.find(u => u.id === receiverId);
  if (!receiver) return res.status(404).json({ error: 'User not found' });

  const message = {
    id: uuidv4(),
    senderId: req.userId,
    receiverId,
    content,
    createdAt: new Date().toISOString(),
    read: false
  };

  messages.push(message);
  writeData('messages.json', messages);
  res.json(message);
});

// SUGGESTED USERS
app.get('/api/users/suggestions/list', auth, (req, res) => {
  const users = readData('users.json');
  const currentUser = users.find(u => u.id === req.userId);
  
  const suggestions = users
    .filter(u => u.id !== req.userId && !currentUser.following.includes(u.id))
    .slice(0, 5)
    .map(({ password, ...u }) => u);
  
  res.json(suggestions);
});

// LEADERBOARD
app.get('/api/leaderboard', (req, res) => {
  const users = readData('users.json');
  const tweets = readData('tweets.json');

  const leaderboard = users.map(user => {
    const userTweets = tweets.filter(t => t.authorId === user.id);
    const totalReactions = userTweets.reduce((sum, tweet) => {
      if (!tweet.reactions) return sum;
      return sum + Object.values(tweet.reactions).reduce((s, arr) => s + arr.length, 0);
    }, 0);

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      streak: user.streak || 0,
      totalReactions,
      achievements: user.achievements || [],
      followers: user.followers.length
    };
  })
  .sort((a, b) => b.totalReactions - a.totalReactions)
  .slice(0, 10);

  res.json(leaderboard);
});

// DAILY CHALLENGE
app.get('/api/challenge', (req, res) => {
  const challenges = [
    { id: 1, prompt: "Share a hot take about a popular technology", vibe: "rant" },
    { id: 2, prompt: "What's something you learned today?", vibe: "learning" },
    { id: 3, prompt: "Celebrate a small win from this week", vibe: "celebration" },
    { id: 4, prompt: "Share your favorite code snippet", vibe: "chill" },
    { id: 5, prompt: "What tool or library are you excited about?", vibe: "hype" },
    { id: 6, prompt: "Share some advice for junior developers", vibe: "thoughtful" },
    { id: 7, prompt: "What's your unpopular opinion about coding?", vibe: "rant" }
  ];
  
  // Use date to pick a consistent challenge for the day
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const challenge = challenges[dayOfYear % challenges.length];
  
  res.json(challenge);
});

// Helper function to enrich tweet with author info and counts
function enrichTweet(tweet, allTweets, users) {
  const author = users.find(u => u.id === tweet.authorId);
  const replyCount = allTweets.filter(t => t.replyTo === tweet.id).length;
  
  // Calculate total reactions
  let totalReactions = 0;
  let reactionCounts = {};
  if (tweet.reactions) {
    Object.entries(tweet.reactions).forEach(([type, arr]) => {
      reactionCounts[type] = arr.length;
      totalReactions += arr.length;
    });
  }

  // Calculate poll totals
  let pollWithTotals = null;
  if (tweet.poll) {
    const totalVotes = tweet.poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
    pollWithTotals = {
      ...tweet.poll,
      totalVotes,
      options: tweet.poll.options.map(opt => ({
        ...opt,
        voteCount: opt.votes.length,
        percentage: totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0
      }))
    };
  }

  return {
    ...tweet,
    author: author ? {
      id: author.id,
      username: author.username,
      displayName: author.displayName,
      avatar: author.avatar,
      streak: author.streak || 0,
      achievements: author.achievements || []
    } : null,
    reactionCounts,
    totalReactions,
    retweetCount: tweet.retweets.length,
    replyCount,
    poll: pollWithTotals
  };
}

// Serve static frontend in production
const publicDir = join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(join(publicDir, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`🐦 Chirp server running on port ${PORT}`);
});
