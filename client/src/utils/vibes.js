export const VIBES = {
  chill: {
    id: 'chill',
    label: 'Chill',
    emoji: '😌',
    color: '#8b5cf6',
    gradient: 'from-indigo-500/20 to-purple-500/20',
    description: 'Relaxed, laid-back thoughts'
  },
  hype: {
    id: 'hype',
    label: 'Hype',
    emoji: '🔥',
    color: '#f97316',
    gradient: 'from-orange-500/20 to-amber-500/20',
    description: 'Excited announcements & wins'
  },
  thoughtful: {
    id: 'thoughtful',
    label: 'Thoughtful',
    emoji: '🤔',
    color: '#0ea5e9',
    gradient: 'from-sky-500/20 to-cyan-500/20',
    description: 'Deep thoughts & reflections'
  },
  celebration: {
    id: 'celebration',
    label: 'Celebration',
    emoji: '🎉',
    color: '#ec4899',
    gradient: 'from-pink-500/20 to-rose-500/20',
    description: 'Milestones & achievements'
  },
  rant: {
    id: 'rant',
    label: 'Rant',
    emoji: '😤',
    color: '#ef4444',
    gradient: 'from-red-500/20 to-rose-600/20',
    description: 'Venting & frustrations'
  },
  learning: {
    id: 'learning',
    label: 'Learning',
    emoji: '💡',
    color: '#22c55e',
    gradient: 'from-green-500/20 to-emerald-500/20',
    description: 'TILs & knowledge sharing'
  }
};

export const REACTIONS = {
  fire: { emoji: '🔥', label: 'Fire', color: '#f97316' },
  rocket: { emoji: '🚀', label: 'Rocket', color: '#8b5cf6' },
  lightbulb: { emoji: '💡', label: 'Insightful', color: '#eab308' },
  heart: { emoji: '💜', label: 'Love', color: '#a855f7' },
  laugh: { emoji: '😂', label: 'Funny', color: '#22c55e' },
  mindblown: { emoji: '🤯', label: 'Mind Blown', color: '#ec4899' }
};

export const ACHIEVEMENTS = {
  first_chirp: {
    id: 'first_chirp',
    name: 'First Chirp',
    description: 'Posted your first chirp',
    emoji: '🐣',
    color: '#22c55e',
    requirement: 1
  },
  prolific: {
    id: 'prolific',
    name: 'Prolific',
    description: 'Posted 50 chirps',
    emoji: '✍️',
    color: '#3b82f6',
    requirement: 50
  },
  viral: {
    id: 'viral',
    name: 'Going Viral',
    description: 'Got 100+ reactions on a chirp',
    emoji: '🦠',
    color: '#ec4899',
    requirement: 100
  },
  streak_week: {
    id: 'streak_week',
    name: 'Week Warrior',
    description: '7-day posting streak',
    emoji: '🔥',
    color: '#f97316',
    requirement: 7
  },
  streak_month: {
    id: 'streak_month',
    name: 'Monthly Master',
    description: '30-day posting streak',
    emoji: '⚡',
    color: '#eab308',
    requirement: 30
  },
  social_butterfly: {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Following 50+ people',
    emoji: '🦋',
    color: '#8b5cf6',
    requirement: 50
  },
  influencer: {
    id: 'influencer',
    name: 'Influencer',
    description: 'Reached 100 followers',
    emoji: '⭐',
    color: '#eab308',
    requirement: 100
  },
  code_wizard: {
    id: 'code_wizard',
    name: 'Code Wizard',
    description: 'Shared 10 code snippets',
    emoji: '🧙‍♂️',
    color: '#6366f1',
    requirement: 10
  },
  poll_master: {
    id: 'poll_master',
    name: 'Poll Master',
    description: 'Created 5 polls',
    emoji: '📊',
    color: '#14b8a6',
    requirement: 5
  },
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Posted between 12-4 AM',
    emoji: '🦉',
    color: '#1e293b',
    requirement: 1
  },
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Posted between 5-7 AM',
    emoji: '🐦',
    color: '#fbbf24',
    requirement: 1
  },
  conversation_starter: {
    id: 'conversation_starter',
    name: 'Conversation Starter',
    description: 'Got 20+ replies on a chirp',
    emoji: '💬',
    color: '#06b6d4',
    requirement: 20
  }
};

export function getVibeClass(vibe) {
  return vibe ? `vibe-${vibe}` : '';
}

export function highlightCode(code, language = 'javascript') {
  // Simple syntax highlighting
  const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'true', 'false', 'null', 'undefined'];
  
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Comments
  highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
  highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
  
  // Strings
  highlighted = highlighted.replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>');
  
  // Numbers
  highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');
  
  // Keywords
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span class="keyword">$1</span>');
  });
  
  // Function calls
  highlighted = highlighted.replace(/(\w+)(?=\s*\()/g, '<span class="function">$1</span>');
  
  return highlighted;
}

export function triggerConfetti() {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];
  const confettiCount = 50;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 2 + 's';
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 5000);
  }
}

export function playSound(type) {
  // Sound effects URLs (using Web Audio API for simple sounds)
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  const sounds = {
    like: { frequency: 800, duration: 0.1, type: 'sine' },
    post: { frequency: 600, duration: 0.15, type: 'triangle' },
    notification: { frequency: 1000, duration: 0.2, type: 'sine' },
    achievement: { frequency: [523, 659, 784], duration: 0.3, type: 'sine' }
  };
  
  const sound = sounds[type];
  if (!sound) return;
  
  if (Array.isArray(sound.frequency)) {
    // Play chord for achievements
    sound.frequency.forEach((freq, i) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = freq;
        oscillator.type = sound.type;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration);
      }, i * 100);
    });
  } else {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = sound.frequency;
    oscillator.type = sound.type;
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
  }
}
