import { VIBES, REACTIONS, type VibeType, type ReactionType } from '@chirp/shared';

export { VIBES, REACTIONS };
export type { VibeType, ReactionType };

export function getVibeClass(vibe: VibeType | null | undefined): string {
  if (!vibe) return '';
  return `vibe-${vibe}`;
}

export function highlightCode(code: string): string {
  return code
    .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|typeof|instanceof)\b/g, '<span class="keyword">$1</span>')
    .replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '<span class="string">$&</span>')
    .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
    .replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span class="function">$1</span>(');
}

export function triggerConfetti(): void {
  const colors = ['#a855f7', '#ec4899', '#f97316', '#22c55e', '#0ea5e9'];
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 3500);
  }
}

export function playSound(type: 'post' | 'reaction' | 'achievement'): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const frequencies: Record<string, number[]> = {
      post: [523, 659, 784],
      reaction: [440, 554],
      achievement: [523, 659, 784, 1047],
    };
    
    const freqs = frequencies[type] || [440];
    let time = audioContext.currentTime;
    
    freqs.forEach((freq, i) => {
      oscillator.frequency.setValueAtTime(freq, time + i * 0.1);
    });
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch {
    // Audio not supported
  }
}
