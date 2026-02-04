import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ACHIEVEMENTS, VIBE_TYPES, REACTION_TYPES } from '@chirp/shared';

const prisma = new PrismaClient();

const dummyUsers = [
  { username: 'swyx', name: 'swyx', email: 'swyx@example.com', bio: 'Infinite learner. Writer of code and words.', streak: 234 },
  { username: 'dan_abramov', name: 'Dan Abramov', email: 'dan@example.com', bio: 'Working on React. Co-author of Redux.', streak: 156 },
  { username: 'sarah_edo', name: 'Sarah Drasner', email: 'sarah@example.com', bio: 'VP of Developer Experience. Author, speaker.', streak: 89 },
  { username: 'kentcdodds', name: 'Kent C. Dodds', email: 'kent@example.com', bio: 'Improving the world with software.', streak: 312 },
  { username: 'wesbos', name: 'Wes Bos', email: 'wes@example.com', bio: 'Full Stack Developer. Course creator.', streak: 67 },
  { username: 'cassidoo', name: 'Cassidy Williams', email: 'cassidy@example.com', bio: 'Making the world better, one keystroke at a time.', streak: 145 },
  { username: 'jhooks', name: 'Joel Hooks', email: 'joel@example.com', bio: 'Co-founder of egghead.io', streak: 78 },
  { username: 'getify', name: 'Kyle Simpson', email: 'kyle@example.com', bio: 'Author of You Don\'t Know JS', streak: 201 },
  { username: 'addyosmani', name: 'Addy Osmani', email: 'addy@example.com', bio: 'Engineering Manager at Google working on Chrome.', streak: 167 },
  { username: 'rauchg', name: 'Guillermo Rauch', email: 'guillermo@example.com', bio: 'CEO @vercel', streak: 289 },
  { username: 'elonmusk', name: 'Elon Musk', email: 'elon@example.com', bio: 'Technoking of Tesla', streak: 45 },
  { username: 'lexfridman', name: 'Lex Fridman', email: 'lex@example.com', bio: 'AI researcher. Podcast host.', streak: 178 },
  { username: 'balajis', name: 'Balaji Srinivasan', email: 'balaji@example.com', bio: 'Angel investor. Author of The Network State.', streak: 134 },
  { username: 'taborlin', name: 'Patrick Rothfuss', email: 'patrick@example.com', bio: 'Author of The Kingkiller Chronicle', streak: 23 },
  { username: 'naval', name: 'Naval Ravikant', email: 'naval@example.com', bio: 'Angel investor', streak: 256 },
];

const tweetTemplates = [
  { content: 'Just shipped a new feature! The feeling never gets old. 🚀', vibe: 'hype', hasCode: false },
  { content: 'Hot take: TypeScript is just JavaScript with extra steps, and that\'s a good thing.', vibe: 'thoughtful', hasCode: false },
  { content: 'Debugging tip: When stuck, explain the problem to a rubber duck. Works every time. 🦆', vibe: 'learning', hasCode: false },
  { content: 'Remember when we used to write jQuery for everything? Good times. 😌', vibe: 'chill', hasCode: false },
  { content: 'Just had my coffee kick in. Time to refactor some legacy code! ☕', vibe: 'hype', hasCode: false },
  { content: 'The best debugging tool is still console.log. Fight me.', vibe: 'rant', hasCode: false },
  { content: 'Celebrating 1 year at my current company! 🎉 What a journey it has been.', vibe: 'celebration', hasCode: false },
  { content: 'Code review isn\'t about finding mistakes. It\'s about sharing knowledge. Be kind. Review with empathy. 💜', vibe: 'thoughtful', hasCode: false },
  { content: '```typescript\nconst isEven = (n: number): boolean => {\n  return n % 2 === 0;\n};\n```\nSometimes the simplest code is the best code.', vibe: 'learning', hasCode: true },
  { content: 'Stack overflow saved my life again today. We should all donate to Wikipedia AND Stack Overflow. 🙏', vibe: 'chill', hasCode: false },
  { content: 'The key to being a good developer isn\'t knowing all the answers. It\'s knowing how to find them.', vibe: 'learning', hasCode: false },
  { content: 'Finally fixed that bug that\'s been haunting me for 3 days. It was a missing semicolon. 😤', vibe: 'rant', hasCode: false },
  { content: 'Just discovered Rust. My mind is blown. 🤯', vibe: 'hype', hasCode: false },
  { content: 'Working from a coffee shop today. The ambient noise really does help with focus. 😌', vibe: 'chill', hasCode: false },
  { content: 'Hot take: The best code is the code you don\'t write. Simplicity wins every time. Fight me.', vibe: 'thoughtful', hasCode: false },
  { content: 'Just pair programmed for 4 hours straight. Exhausting but incredibly effective. Find a coding buddy. 👥', vibe: 'learning', hasCode: false },
  { content: 'Legacy code is just code that\'s been in production long enough to make money. Respect it. Improve it. 🏛️', vibe: 'thoughtful', hasCode: false },
  { content: 'The best debugging tool is still console.log / print statements. Don\'t @ me. It works. 💻', vibe: 'rant', hasCode: false },
  { content: 'Remember: Everyone you admire in tech was once a complete beginner. You\'ll get there too. The journey is worth it. 🚀', vibe: 'learning', hasCode: false },
  { content: 'Finished reading \'The Pragmatic Programmer\' for the 3rd time. Still finding new insights. Classic. 📚 #books', vibe: 'learning', hasCode: false },
  { content: '```javascript\nconst sleep = (ms) => new Promise(r => setTimeout(r, ms));\n```\nMy most used utility function. Simple but essential.', vibe: 'learning', hasCode: true },
  { content: 'Unpopular opinion: Most meetings should be async messages. Time is precious.', vibe: 'rant', hasCode: false },
  { content: 'Just got my PR approved after 47 comments. Feels like I climbed a mountain. 🏔️', vibe: 'celebration', hasCode: false },
  { content: 'The best investment you can make is in yourself. Learn something new today.', vibe: 'thoughtful', hasCode: false },
  { content: 'Shoutout to everyone writing documentation. You\'re the real heroes. 📝', vibe: 'chill', hasCode: false },
  { content: 'Working on a side project is the best way to learn. Ship something this weekend!', vibe: 'hype', hasCode: false },
  { content: 'AI won\'t replace developers. But developers who use AI will replace those who don\'t. #ai #buildinpublic', vibe: 'thoughtful', hasCode: false },
  { content: 'The secret to productivity isn\'t working more hours. It\'s eliminating distractions.', vibe: 'learning', hasCode: false },
  { content: 'Just deployed to production on a Friday. Living dangerously. 😅', vibe: 'hype', hasCode: false },
  { content: 'Clean code > clever code. Your future self will thank you.', vibe: 'learning', hasCode: false },
  { content: 'Building in public is scary but incredibly rewarding. Document your journey! #buildinpublic', vibe: 'hype', hasCode: false },
  { content: '```python\nif __name__ == "__main__":\n    main()\n```\nThe sacred incantation that starts every Python script.', vibe: 'learning', hasCode: true },
  { content: 'Taking a mental health day tomorrow. Your brain needs rest to function at its best. 🧠', vibe: 'chill', hasCode: false },
  { content: 'Finally understanding recursion feels like unlocking a superpower. 🔄', vibe: 'celebration', hasCode: false },
  { content: 'Refactoring is not a waste of time. Technical debt compounds. Pay it down regularly. #cleancode', vibe: 'thoughtful', hasCode: false },
];

const pollTemplates = [
  { question: 'What\'s your preferred programming language?', options: ['JavaScript', 'Python', 'Rust', 'Go'] },
  { question: 'Best time to code?', options: ['Early morning', 'Late night', 'Afternoon', 'All day'] },
  { question: 'Tabs or spaces?', options: ['Tabs', 'Spaces', '2 spaces', '4 spaces'] },
  { question: 'Favorite frontend framework?', options: ['React', 'Vue', 'Svelte', 'Angular'] },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.pollVote.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.tweet.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create achievements
  const achievementData = Object.values(ACHIEVEMENTS).map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    emoji: a.emoji,
  }));

  await prisma.achievement.createMany({ data: achievementData });
  console.log(`✅ Created ${achievementData.length} achievements`);

  // Create users
  const password = await bcrypt.hash('password123', 10);
  const users = [];

  for (const userData of dummyUsers) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        password,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
        lastPostDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        totalReactions: Math.floor(Math.random() * 500),
      },
    });
    users.push(user);
  }
  console.log(`✅ Created ${users.length} users`);

  // Assign random achievements to users
  for (const user of users) {
    const achievementIds = ['first_chirp'];
    
    if (user.streak >= 7) achievementIds.push('streak_week');
    if (user.streak >= 30) achievementIds.push('streak_month');
    if (Math.random() > 0.5) achievementIds.push('night_owl');
    if (Math.random() > 0.7) achievementIds.push('code_wizard');
    
    for (const achievementId of achievementIds) {
      await prisma.userAchievement.create({
        data: {
          userId: user.id,
          achievementId,
        },
      });
    }
  }
  console.log('✅ Assigned achievements');

  // Create follows
  for (const user of users) {
    const othersToFollow = users
      .filter((u) => u.id !== user.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 8) + 3);

    for (const other of othersToFollow) {
      await prisma.follow.create({
        data: {
          followerId: user.id,
          followingId: other.id,
        },
      });
    }
  }
  console.log('✅ Created follow relationships');

  // Create tweets
  const tweets = [];
  for (let i = 0; i < 100; i++) {
    const author = users[Math.floor(Math.random() * users.length)];
    const template = tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)];
    
    const tweetData: any = {
      content: template.content,
      authorId: author.id,
      vibe: template.vibe,
      hasCode: template.hasCode,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    };

    // Add a poll to some tweets
    if (Math.random() > 0.85) {
      const pollTemplate = pollTemplates[Math.floor(Math.random() * pollTemplates.length)];
      tweetData.poll = {
        create: {
          question: pollTemplate.question,
          endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          options: {
            create: pollTemplate.options.map((text) => ({ text })),
          },
        },
      };
    }

    const tweet = await prisma.tweet.create({
      data: tweetData,
      include: { poll: { include: { options: true } } },
    });
    tweets.push(tweet);
  }
  console.log(`✅ Created ${tweets.length} tweets`);

  // Add reactions to tweets
  for (const tweet of tweets) {
    const numReactions = Math.floor(Math.random() * 15);
    const reactors = users
      .filter((u) => u.id !== tweet.authorId)
      .sort(() => Math.random() - 0.5)
      .slice(0, numReactions);

    for (const reactor of reactors) {
      const type = REACTION_TYPES[Math.floor(Math.random() * REACTION_TYPES.length)];
      await prisma.reaction.create({
        data: {
          type,
          userId: reactor.id,
          tweetId: tweet.id,
        },
      });
    }
  }
  console.log('✅ Added reactions');

  // Add votes to polls
  const tweetsWithPolls = tweets.filter((t) => t.poll);
  for (const tweet of tweetsWithPolls) {
    const numVoters = Math.floor(Math.random() * 10) + 2;
    const voters = users.sort(() => Math.random() - 0.5).slice(0, numVoters);

    for (const voter of voters) {
      const option = tweet.poll!.options[Math.floor(Math.random() * tweet.poll!.options.length)];
      await prisma.pollVote.create({
        data: {
          userId: voter.id,
          optionId: option.id,
          pollId: tweet.poll!.id,
        },
      });
    }
  }
  console.log('✅ Added poll votes');

  // Create some replies
  for (let i = 0; i < 50; i++) {
    const parentTweet = tweets[Math.floor(Math.random() * tweets.length)];
    const author = users[Math.floor(Math.random() * users.length)];
    
    const replyContents = [
      'Great point! 👏',
      'Totally agree with this!',
      'This is so true!',
      'Thanks for sharing!',
      'Interesting perspective.',
      'I learned something new today!',
      'Well said! 💯',
      'This resonates with me.',
    ];

    await prisma.tweet.create({
      data: {
        content: replyContents[Math.floor(Math.random() * replyContents.length)],
        authorId: author.id,
        parentId: parentTweet.id,
        vibe: VIBE_TYPES[Math.floor(Math.random() * VIBE_TYPES.length)],
        createdAt: new Date(parentTweet.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('✅ Created replies');

  // Create some notifications
  for (const user of users.slice(0, 5)) {
    const others = users.filter((u) => u.id !== user.id).slice(0, 3);
    
    for (const other of others) {
      await prisma.notification.create({
        data: {
          type: 'follow',
          recipientId: user.id,
          senderId: other.id,
        },
      });
    }
  }
  console.log('✅ Created notifications');

  // Create some messages
  const messageContents = [
    'Hey! Love your recent posts!',
    'Would love to collaborate on something.',
    'Great talk at the conference!',
    'Thanks for the follow!',
    'Your project looks amazing!',
  ];

  for (let i = 0; i < 20; i++) {
    const sender = users[Math.floor(Math.random() * users.length)];
    const receiver = users.filter((u) => u.id !== sender.id)[Math.floor(Math.random() * (users.length - 1))];
    
    await prisma.message.create({
      data: {
        content: messageContents[Math.floor(Math.random() * messageContents.length)],
        senderId: sender.id,
        receiverId: receiver.id,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('✅ Created messages');

  // Update user totalReactions
  for (const user of users) {
    const reactionCount = await prisma.reaction.count({
      where: { tweet: { authorId: user.id } },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { totalReactions: reactionCount },
    });
  }
  console.log('✅ Updated user reaction counts');

  console.log('🎉 Seed completed successfully!');
  console.log('\nDemo accounts (password: password123):');
  for (const user of users.slice(0, 5)) {
    console.log(`  - @${user.username} (${user.name})`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
