import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const VIBES = ['chill', 'hype', 'thoughtful', 'celebration', 'rant', 'learning'];
const REACTIONS = ['fire', 'rocket', 'lightbulb', 'heart', 'laugh', 'mindblown'];

// Dummy user data - more diverse dev community
const dummyUsers = [
  { username: 'anonymous_chirper', displayName: 'Anonymous Chirper', bio: '👋 Just exploring Chirp! This is the demo account.', location: 'The Internet', streak: 1 },
  { username: 'elonmusk', displayName: 'Elon Musk', bio: '🚀 Mars & Cars, Tunnels & Tweets', location: 'Mars', streak: 42 },
  { username: 'naval', displayName: 'Naval', bio: '🧘 Angel investor, entrepreneur. Seeking wisdom.', location: 'San Francisco', streak: 128 },
  { username: 'paulg', displayName: 'Paul Graham', bio: '📝 Founder of Y Combinator. Essays at paulgraham.com', location: 'UK', streak: 67 },
  { username: 'sama', displayName: 'Sam Altman', bio: '🤖 CEO of OpenAI', location: 'San Francisco', streak: 33 },
  { username: 'lexfridman', displayName: 'Lex Fridman', bio: '🎙️ Host of Lex Fridman Podcast. AI researcher. Love > Fear', location: 'Austin, TX', streak: 89 },
  { username: 'pmarca', displayName: 'Marc Andreessen', bio: '💰 Cofounder of a16z, Netscape, Mosaic. Building the future.', location: 'Menlo Park', streak: 15 },
  { username: 'balajis', displayName: 'Balaji Srinivasan', bio: '📖 Author of The Network State. Tech optimist.', location: 'The Cloud', streak: 203 },
  { username: 'cassidoo', displayName: 'Cassidy Williams', bio: '💻 CTO at Contenda. Making dev content fun!', location: 'Chicago', streak: 156 },
  { username: 'dan_abramov', displayName: 'Dan Abramov', bio: '⚛️ Working on React. Making sense of things.', location: 'London', streak: 78 },
  { username: 'sarah_edo', displayName: 'Sarah Drasner', bio: '🎨 Director of Engineering. Author. Speaker. Animation lover.', location: 'Denver', streak: 45 },
  { username: 'kelseyhightower', displayName: 'Kelsey Hightower', bio: '☁️ Minimalist. Making Kubernetes accessible.', location: 'Portland', streak: 92 },
  { username: 'swyx', displayName: 'swyx', bio: '📚 Learning in Public. Writer at dx.tips', location: 'Singapore', streak: 234 },
  { username: 'jhooks', displayName: 'Joel Hooks', bio: '🥚 Cofounder of egghead.io. Helping devs level up.', location: 'Vancouver', streak: 67 },
  { username: 'wesbos', displayName: 'Wes Bos', bio: '🔥 Full Stack Developer. Teacher. Boss level BBQ.', location: 'Hamilton', streak: 112 },
  { username: 'theprimeagen', displayName: 'ThePrimeagen', bio: '⌨️ Vim enthusiast. Netflix engineer. Rust evangelist.', location: 'Somewhere', streak: 88 }
];

// Enhanced tweet content with vibes
const tweetTemplates = [
  { content: "Just shipped a new feature! 🚀 The team has been working hard on this for weeks. Can't wait to see what you all think. #buildinpublic #shipping", vibe: 'celebration' },
  { content: "Hot take: The best code is the code you don't write. Simplicity wins every time. Fight me.", vibe: 'rant' },
  { content: "Morning routine: Coffee ☕ → Check emails → Realize I should have just started coding → Code → Ship → Repeat", vibe: 'chill' },
  { content: "TIL about the Temporal API in JavaScript. Date handling is about to get SO much better. Here's a quick example:\n\n```javascript\nconst now = Temporal.Now.plainDateISO();\nconst future = now.add({ days: 30 });\n```\n\n#javascript #webdev", vibe: 'learning', hasCode: true },
  { content: "The difference between a junior and senior developer isn't knowing more - it's knowing what NOT to do. 🧠", vibe: 'thoughtful' },
  { content: "If your startup doesn't have product-market fit, you have a hobby, not a business. Harsh but true. #startups #realtalk", vibe: 'rant' },
  { content: "Just had the most productive 4-hour deep work session. No Slack, no meetings, just pure focus. We need more of this. 🎯", vibe: 'chill' },
  { content: "Unpopular opinion: Most meetings should be async messages. Most async messages should be nothing at all.", vibe: 'rant' },
  { content: "The future is not AI replacing humans. It's humans augmented by AI doing things neither could do alone. #AI #future", vibe: 'thoughtful' },
  { content: "Debugging tip that changed my life:\n\n```python\nimport pdb; pdb.set_trace()\n# or in modern Python\nbreakpoint()\n```\n\nStop using print statements! #python #debugging", vibe: 'learning', hasCode: true },
  { content: "Remember when we thought the metaverse would be huge? Good times. 😂 #tech #predictions", vibe: 'chill' },
  { content: "Just open-sourced our internal tool for managing microservices. Check it out! 🎉 #opensource #devtools", vibe: 'celebration' },
  { content: "The best investment you can make is in yourself. Learn something new today. 📚", vibe: 'thoughtful' },
  { content: "Wrote my first line of code 15 years ago. Still feel like a beginner sometimes. That's the beauty of this field. ✨", vibe: 'thoughtful' },
  { content: "Breaking: I finally understood monads! \n\nJust kidding, nobody understands monads. 😅 #functional #haskell", vibe: 'chill' },
  { content: "The tech industry has a diversity problem. We all need to do better. Start by mentoring someone different from you. 💜", vibe: 'thoughtful' },
  { content: "Shipped to production on a Friday. Living dangerously. 😎 #devlife #yolo", vibe: 'hype' },
  { content: "Here's a TypeScript trick that will blow your mind:\n\n```typescript\ntype DeepReadonly<T> = {\n  readonly [K in keyof T]: T[K] extends object \n    ? DeepReadonly<T[K]> \n    : T[K]\n}\n```\n\n#typescript #tips", vibe: 'learning', hasCode: true },
  { content: "Stack overflow saved my life again today. We should all donate to Wikipedia AND Stack Overflow. 🙏", vibe: 'chill' },
  { content: "Just realized I've been mass-producing technical debt for years. Time for some refactoring. 🔧 #cleancode", vibe: 'rant' },
  { content: "The best engineers I know spend 80% of their time thinking and 20% coding. Not the other way around. 🧠", vibe: 'thoughtful' },
  { content: "Excited to announce I'm starting a new role! 🎉 More details coming soon. Grateful for this opportunity! #newjob", vibe: 'celebration' },
  { content: "AI won't take your job. Someone using AI will. Learn to use the tools. 🤖 #AItools #futureofwork", vibe: 'hype' },
  { content: "The hardest part of building a startup isn't the technology. It's the people and the psychology. 💡", vibe: 'thoughtful' },
  { content: "Current status: Arguing with a YAML file. The YAML file is winning. 😤 #devops #kubernetes", vibe: 'rant' },
  { content: "Just deleted 10,000 lines of code. Best PR I've ever submitted. Less is more. ✂️ #cleancode", vibe: 'celebration' },
  { content: "The future of work is async-first. Time zones shouldn't matter. #remotework #distributed", vibe: 'thoughtful' },
  { content: "Every great product started as something people laughed at. Keep building. 🏗️", vibe: 'hype' },
  { content: "New blog post: 'Why I Switched From React to Solid.js'\n\nTL;DR: Fine-grained reactivity is incredible. #solidjs #react", vibe: 'learning' },
  { content: "The best developers aren't 10x coders. They're 10x communicators. 📣", vibe: 'thoughtful' },
  { content: "Late night coding sessions hit different. There's something magical about 2 AM focus. 🌙 #nightowl", vibe: 'chill' },
  { content: "Interviewing is broken. We test for puzzles, not for actual job skills. Let's fix this. 🔨 #hiring #techinterviews", vibe: 'rant' },
  { content: "TIL: The bug I spent 6 hours debugging was a single missing semicolon. Classic. 😭 #debugging", vibe: 'chill' },
  { content: "Your code doesn't need to be perfect. It needs to solve the problem. Ship it. 🚢", vibe: 'hype' },
  { content: "The real 10x developer move is making your teammates 2x more productive. Lift others up. 🤝", vibe: 'thoughtful' },
  { content: "Just discovered a 5-year-old TODO comment in our codebase. It's now a 6-year-old TODO comment. 😬", vibe: 'chill' },
  { content: "Friendly reminder: Imposter syndrome is lying to you. You belong here. Keep going. 💪", vibe: 'hype' },
  { content: "The gap between a good idea and a great product is usually about 1000 small decisions. 🎯", vibe: 'thoughtful' },
  { content: "Writing documentation feels boring until you're the one reading undocumented code at 3 AM. 📝", vibe: 'learning' },
  { content: "Hot take: TypeScript has saved more hours than it has cost. The type safety is worth it. 💯 #typescript", vibe: 'rant' },
  { content: "Rust tip of the day:\n\n```rust\n// Use ? for error propagation\nfn read_file() -> Result<String, io::Error> {\n    let content = fs::read_to_string(\"file.txt\")?;\n    Ok(content)\n}\n```\n\n#rustlang", vibe: 'learning', hasCode: true },
  { content: "The best architecture is the one your team can actually maintain. Keep it simple. 🏛️", vibe: 'thoughtful' },
  { content: "Launching next week! After 2 years of building in stealth, we're finally ready. 🚀 #startup #launch", vibe: 'celebration' },
  { content: "Productivity hack: Block 'shallow work' hours on your calendar. Protect your deep work time. ⏰", vibe: 'learning' },
  { content: "Just got my first pull request merged into a major open source project! 🎉 #opensource #milestone", vibe: 'celebration' },
  { content: "The command line is not scary. It's powerful. Learn it, love it, use it. 💻 #cli #terminal", vibe: 'learning' },
  { content: "Code review isn't about finding mistakes. It's about sharing knowledge. Be kind. Review with empathy. 💜", vibe: 'thoughtful' },
  { content: "The best career advice I ever got: Say yes to things that scare you a little. Growth happens at the edge. 🌱", vibe: 'thoughtful' },
  { content: "Sometimes the best solution is to delete the feature entirely. Users don't always know what they need. 🗑️", vibe: 'rant' },
  { content: "Building in public is terrifying but also incredibly rewarding. The feedback loop is worth it. 📢 #buildinpublic", vibe: 'hype' },
  { content: "The most underrated skill in tech: Writing clearly and concisely. Learn to write. It's a superpower. ✍️", vibe: 'learning' },
  { content: "Your side project doesn't need to make money. Learning is valuable too. Build for fun! 🎮", vibe: 'chill' },
  { content: "Just deployed to production and everything worked on the first try. I don't trust it. 🤔 #devlife", vibe: 'chill' },
  { content: "The future of programming is natural language. We're just at the beginning. 🌅 #AI #coding", vibe: 'hype' },
  { content: "Burnout is real. Take breaks. Touch grass. Your code will still be there tomorrow. 🌿 #mentalhealth", vibe: 'thoughtful' },
  { content: "The best teams I've worked with had psychological safety. You could fail without fear. Create that culture. 🏡", vibe: 'thoughtful' },
  { content: "New framework just dropped. Time to rewrite everything!\n\n(Just kidding, please don't do this) 😂 #javascript", vibe: 'chill' },
  { content: "Remember: Everyone you admire in tech was once a complete beginner. You'll get there too. The journey is worth it. 🚀", vibe: 'hype' },
  { content: "Here's my VS Code settings for maximum productivity:\n\n```json\n{\n  \"editor.formatOnSave\": true,\n  \"editor.minimap.enabled\": false,\n  \"vim.enable\": true\n}\n```\n\n#vscode #productivity", vibe: 'learning', hasCode: true },
  { content: "Finished reading 'The Pragmatic Programmer' for the 3rd time. Still finding new insights. Classic. 📚 #books", vibe: 'learning' },
  { content: "Hot take: Tabs vs spaces doesn't matter. What matters is consistency within a codebase. Move on. 🤷", vibe: 'rant' },
  { content: "The future belongs to those who can bridge the gap between technical and non-technical. Be that bridge. 🌉", vibe: 'thoughtful' },
  { content: "Just automated a task that takes 2 hours. It only took me 8 hours to automate it. Worth it. 🤖", vibe: 'chill' },
  { content: "Your network is your net worth. But not in a gross way. Surround yourself with great people. Help each other. 🤝", vibe: 'thoughtful' },
  { content: "Machine learning isn't magic. It's math and data. Lots and lots of data. Demystify it. 📊 #ML #AI", vibe: 'learning' },
  { content: "The best products are built by people who use them daily. Dog food your own creation. 🐕", vibe: 'thoughtful' },
  { content: "Late night thoughts: What if we just... rebuilt the internet from scratch? Who's with me? 🌐", vibe: 'hype' },
  { content: "The gap between 'I should learn this' and 'I learned this' is just starting. Just start. Today. 💪", vibe: 'hype' },
  { content: "Legacy code is just code that's been in production long enough to make money. Respect it. Improve it. 🏛️", vibe: 'thoughtful' },
  { content: "Excited to share that we just closed our Series A! 🎉 Grateful for everyone who believed in us early. #startup #funding", vibe: 'celebration' },
  { content: "The most valuable thing you can do for your career: Build things and write about them. Compound knowledge. 📈", vibe: 'learning' },
  { content: "Remember when deployment meant FTP-ing files to a server? We've come so far. #devops #nostalgia", vibe: 'chill' },
  { content: "AI agents are going to change everything. We're building the infrastructure for the next decade. Join us. 🤖", vibe: 'hype' },
  { content: "The best debugging tool is still console.log / print statements. Don't @ me. It works. 🖨️", vibe: 'chill' },
  { content: "Just pair programmed for 4 hours straight. Exhausting but incredibly effective. Find a coding buddy. 👥", vibe: 'learning' },
  { content: "Your startup idea isn't unique. Your execution will be. That's what matters. Stop planning, start building. 🏃", vibe: 'hype' }
];

// Reply templates with vibes
const replyTemplates = [
  { content: "Totally agree with this! 🙌", vibe: 'hype' },
  { content: "Interesting perspective. Have you considered the flip side though? 🤔", vibe: 'thoughtful' },
  { content: "This is exactly what I needed to hear today. Thank you! 💜", vibe: 'chill' },
  { content: "Strong disagree, but I respect the take. Here's why...", vibe: 'rant' },
  { content: "Been thinking about this too. The nuance is important.", vibe: 'thoughtful' },
  { content: "100% this. More people need to understand this. 🔥", vibe: 'hype' },
  { content: "Great thread. Saving for later. 📌", vibe: 'chill' },
  { content: "The replies to this are going to be wild 🍿", vibe: 'chill' },
  { content: "This should be required reading for everyone in tech. Bookmarked. 📚", vibe: 'learning' },
  { content: "Counterpoint: what about edge cases?", vibe: 'thoughtful' },
  { content: "Finally someone said it! 👏", vibe: 'celebration' },
  { content: "This is gold. Sharing with my team. 💎", vibe: 'hype' },
  { content: "My experience has been exactly the opposite, interestingly. Different contexts maybe?", vibe: 'thoughtful' },
  { content: "Can confirm. Learned this the hard way last year. 😅", vibe: 'chill' },
  { content: "Love this! Here's an addition:\n\n```js\n// Related pattern\nconst result = await Promise.all(items.map(fn))\n```", vibe: 'learning', hasCode: true },
];

async function seed() {
  console.log('🐦 Seeding Chirp database...\n');

  // Create users
  const users = [];
  const password = await bcrypt.hash('ididntknow', 10);

  for (const userData of dummyUsers) {
    const achievements = [];
    // Give some users achievements based on streak
    if (userData.streak >= 7) achievements.push('streak_week');
    if (userData.streak >= 30) achievements.push('streak_month');
    if (userData.streak > 0) achievements.push('first_chirp');
    if (Math.random() > 0.5) achievements.push('night_owl');
    if (Math.random() > 0.7) achievements.push('code_wizard');

    const user = {
      id: uuidv4(),
      username: userData.username,
      email: `${userData.username}@chirp.dev`,
      password,
      displayName: userData.displayName,
      bio: userData.bio,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
      banner: `https://images.unsplash.com/photo-${1550000000000 + Math.floor(Math.random() * 10000000)}?w=600&h=200`,
      location: userData.location,
      website: `https://${userData.username}.dev`,
      joinedAt: randomDate(new Date(2020, 0, 1), new Date(2024, 0, 1)).toISOString(),
      followers: [],
      following: [],
      achievements,
      streak: userData.streak || 0,
      lastPostDate: new Date().toISOString(),
      totalReactions: 0,
      soundEnabled: true,
      focusMode: false,
      theme: 'dark'
    };
    users.push(user);
  }

  // Create follow relationships
  users.forEach((user, index) => {
    const numFollowing = Math.floor(Math.random() * 10) + 3;
    const potentialFollows = users.filter((u, i) => i !== index);
    
    for (let i = 0; i < Math.min(numFollowing, potentialFollows.length); i++) {
      const randomIndex = Math.floor(Math.random() * potentialFollows.length);
      const targetUser = potentialFollows[randomIndex];
      
      if (!user.following.includes(targetUser.id)) {
        user.following.push(targetUser.id);
        targetUser.followers.push(user.id);
      }
      
      potentialFollows.splice(randomIndex, 1);
    }
  });

  console.log(`✅ Created ${users.length} users with achievements and streaks`);

  // Create tweets with vibes and reactions
  const tweets = [];
  const usedTemplates = new Set();

  for (const user of users) {
    const numTweets = Math.floor(Math.random() * 11) + 5;
    
    for (let i = 0; i < numTweets; i++) {
      let templateIndex;
      do {
        templateIndex = Math.floor(Math.random() * tweetTemplates.length);
      } while (usedTemplates.has(templateIndex) && usedTemplates.size < tweetTemplates.length);
      
      usedTemplates.add(templateIndex);
      if (usedTemplates.size >= tweetTemplates.length) usedTemplates.clear();

      const template = tweetTemplates[templateIndex];
      
      // Create poll for some tweets
      let poll = null;
      if (Math.random() > 0.9) {
        const pollQuestions = [
          { question: "What's your preferred programming language?", options: ["JavaScript", "Python", "Rust", "Go"] },
          { question: "Remote, hybrid, or office?", options: ["Remote 100%", "Hybrid", "Office", "Depends on role"] },
          { question: "Tabs or spaces?", options: ["Tabs", "Spaces", "I let my formatter decide", "I don't care"] },
          { question: "Best time to code?", options: ["Morning", "Afternoon", "Evening", "Late night"] }
        ];
        const pollData = pollQuestions[Math.floor(Math.random() * pollQuestions.length)];
        poll = {
          question: pollData.question,
          options: pollData.options.map(opt => ({
            id: uuidv4(),
            text: opt,
            votes: []
          })),
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
      }

      const tweet = {
        id: uuidv4(),
        authorId: user.id,
        content: template.content,
        media: Math.random() > 0.9 ? [`https://picsum.photos/seed/${Math.random()}/600/400`] : [],
        reactions: {
          fire: [],
          rocket: [],
          lightbulb: [],
          heart: [],
          laugh: [],
          mindblown: []
        },
        retweets: [],
        replyTo: null,
        vibe: template.vibe || VIBES[Math.floor(Math.random() * VIBES.length)],
        poll,
        hasCode: template.hasCode || false,
        createdAt: randomDate(new Date(2024, 0, 1), new Date()).toISOString()
      };
      tweets.push(tweet);
    }
  }

  // Add reactions to tweets
  tweets.forEach(tweet => {
    const numReactions = Math.floor(Math.random() * 20);
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(numReactions, shuffledUsers.length); i++) {
      const reactionType = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
      if (!tweet.reactions[reactionType].includes(shuffledUsers[i].id)) {
        tweet.reactions[reactionType].push(shuffledUsers[i].id);
      }
    }

    // Add some retweets
    const numRetweets = Math.floor(Math.random() * Math.floor(users.length / 3));
    for (let i = 0; i < numRetweets; i++) {
      if (!tweet.retweets.includes(shuffledUsers[i].id)) {
        tweet.retweets.push(shuffledUsers[i].id);
      }
    }

    // Add votes to polls
    if (tweet.poll) {
      shuffledUsers.slice(0, Math.floor(Math.random() * 10)).forEach(voter => {
        const randomOption = tweet.poll.options[Math.floor(Math.random() * tweet.poll.options.length)];
        if (!randomOption.votes.includes(voter.id)) {
          randomOption.votes.push(voter.id);
        }
      });
    }
  });

  // Add replies with vibes
  const tweetsToReplyTo = tweets.filter(t => !t.replyTo).slice(0, 40);
  
  for (const parentTweet of tweetsToReplyTo) {
    const numReplies = Math.floor(Math.random() * 5);
    
    for (let i = 0; i < numReplies; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const replyTemplate = replyTemplates[Math.floor(Math.random() * replyTemplates.length)];
      
      const reply = {
        id: uuidv4(),
        authorId: randomUser.id,
        content: replyTemplate.content,
        media: [],
        reactions: {
          fire: [],
          rocket: [],
          lightbulb: [],
          heart: [],
          laugh: [],
          mindblown: []
        },
        retweets: [],
        replyTo: parentTweet.id,
        vibe: replyTemplate.vibe,
        poll: null,
        hasCode: replyTemplate.hasCode || false,
        createdAt: new Date(new Date(parentTweet.createdAt).getTime() + Math.random() * 86400000).toISOString()
      };
      
      // Add some reactions to replies
      const numLikes = Math.floor(Math.random() * 8);
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
      for (let j = 0; j < numLikes; j++) {
        const reactionType = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
        reply.reactions[reactionType].push(shuffledUsers[j].id);
      }
      
      tweets.push(reply);
    }
  }

  // Sort tweets by date
  tweets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  console.log(`✅ Created ${tweets.length} chirps with vibes and reactions`);

  // Create notifications with new reaction types
  const notifications = [];
  
  tweets.slice(0, 30).forEach(tweet => {
    Object.entries(tweet.reactions).forEach(([reactionType, reactors]) => {
      if (reactors.length > 0) {
        const reactor = users.find(u => u.id === reactors[0]);
        if (reactor && tweet.authorId !== reactor.id) {
          notifications.push({
            id: uuidv4(),
            type: 'reaction',
            reaction: reactionType,
            userId: tweet.authorId,
            fromUserId: reactor.id,
            tweetId: tweet.id,
            createdAt: new Date(new Date(tweet.createdAt).getTime() + Math.random() * 3600000).toISOString(),
            read: Math.random() > 0.5
          });
        }
      }
    });
  });

  // Follow notifications
  users.slice(0, 10).forEach(user => {
    if (user.followers.length > 0) {
      notifications.push({
        id: uuidv4(),
        type: 'follow',
        userId: user.id,
        fromUserId: user.followers[0],
        createdAt: randomDate(new Date(2024, 6, 1), new Date()).toISOString(),
        read: Math.random() > 0.5
      });
    }
  });

  console.log(`✅ Created ${notifications.length} notifications`);

  // Create messages
  const messages = [];
  const conversationPairs = [
    [users[0], users[1]],
    [users[2], users[3]],
    [users[0], users[4]],
    [users[1], users[5]],
    [users[3], users[6]],
    [users[7], users[8]],
    [users[9], users[10]],
  ];

  const messageTemplates = [
    "Hey! Loved your recent chirp about AI. Great insights! 🔥",
    "Thanks for the follow! How's it going? Would love to connect.",
    "Did you see the new React features? Crazy stuff happening.",
    "We should collab on something. DM me your ideas!",
    "That code snippet you shared - brilliant! Mind if I use it?",
    "Coffee sometime? Would love to chat more about your work.",
    "Great meeting you at the conference! Let's stay in touch.",
    "Just saw your latest project. Impressive work! 🚀",
    "Quick question - what stack are you using for your new thing?",
    "Thanks for the code review. Really helped improve the PR.",
    "Your streak is insane! How do you stay so consistent?",
    "Saw you got the Code Wizard badge! Well deserved! 🧙‍♂️",
  ];

  conversationPairs.forEach(([user1, user2]) => {
    const numMessages = Math.floor(Math.random() * 6) + 2;
    let lastTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    for (let i = 0; i < numMessages; i++) {
      const sender = i % 2 === 0 ? user1 : user2;
      const receiver = i % 2 === 0 ? user2 : user1;
      
      lastTime = new Date(lastTime.getTime() + Math.random() * 3600000);
      
      messages.push({
        id: uuidv4(),
        senderId: sender.id,
        receiverId: receiver.id,
        content: messageTemplates[Math.floor(Math.random() * messageTemplates.length)],
        createdAt: lastTime.toISOString(),
        read: Math.random() > 0.3
      });
    }
  });

  console.log(`✅ Created ${messages.length} messages`);

  // Calculate total reactions for each user
  users.forEach(user => {
    const userTweets = tweets.filter(t => t.authorId === user.id);
    user.totalReactions = userTweets.reduce((sum, tweet) => {
      return sum + Object.values(tweet.reactions).reduce((s, arr) => s + arr.length, 0);
    }, 0);
  });

  // Write all data
  fs.writeFileSync(join(dataDir, 'users.json'), JSON.stringify(users, null, 2));
  fs.writeFileSync(join(dataDir, 'tweets.json'), JSON.stringify(tweets, null, 2));
  fs.writeFileSync(join(dataDir, 'notifications.json'), JSON.stringify(notifications, null, 2));
  fs.writeFileSync(join(dataDir, 'messages.json'), JSON.stringify(messages, null, 2));

  console.log('\n✨ Seeding complete!');
  console.log('\n🐦 Welcome to Chirp - The Developer Social Network!');
  console.log('\n📝 Demo account: anonymous_chirper');
  console.log('   All accounts use password: ididntknow');
  console.log('   - anonymous_chirper (demo account)');
  console.log('   - elonmusk (42-day streak 🔥)');
  console.log('   - naval (128-day streak 🔥)');
  console.log('   - cassidoo (156-day streak 🔥)');
  console.log('   - swyx (234-day streak 🔥)');
  console.log('   ... and 11 more developers!');
  console.log('\n🎮 Features: Vibes, Reactions, Polls, Streaks, Achievements, Code Snippets!');
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

seed().catch(console.error);
