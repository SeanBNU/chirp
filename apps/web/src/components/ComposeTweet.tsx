import { useState, useRef } from 'react';
import type { VibeType, CreateTweetInput } from '@chirp/shared';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { useCreateTweet } from '../hooks/useTweets';
import { VIBES, playSound, triggerConfetti } from '../utils/vibes';

interface ComposeTweetProps {
  parentId?: string;
  placeholder?: string;
  onSuccess?: () => void;
}

export function ComposeTweet({ parentId, placeholder = "What's happening?", onSuccess }: ComposeTweetProps) {
  const [content, setContent] = useState('');
  const [selectedVibe, setSelectedVibe] = useState<VibeType | null>(null);
  const [showVibeSelector, setShowVibeSelector] = useState(false);
  const [media, setMedia] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const { soundEnabled } = useUIStore();
  const createTweet = useCreateTweet();

  const maxChars = 500;
  const hasCode = content.includes('```');

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + media.length > 4) {
      alert('Maximum 4 images allowed');
      return;
    }
    
    setMedia([...media, ...files]);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
    setMediaPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const insertCodeBlock = () => {
    setContent((prev) => prev + '\n```javascript\n// Your code here\n```');
  };

  const handleSubmit = async () => {
    if (!content.trim() || content.length > maxChars) return;

    const input: CreateTweetInput & { media?: File[] } = {
      content: content.trim(),
      vibe: selectedVibe || undefined,
      hasCode,
      parentId,
      media: media.length > 0 ? media : undefined,
    };

    if (showPollCreator && pollQuestion && pollOptions.filter(Boolean).length >= 2) {
      input.poll = {
        question: pollQuestion,
        options: pollOptions.filter(Boolean),
      };
    }

    try {
      const result = await createTweet.mutateAsync(input);
      
      if (soundEnabled) playSound('post');
      if (result.newAchievements?.length > 0) {
        triggerConfetti();
        if (soundEnabled) playSound('achievement');
      }

      // Reset form
      setContent('');
      setSelectedVibe(null);
      setMedia([]);
      setMediaPreview([]);
      setShowPollCreator(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create tweet:', error);
    }
  };

  return (
    <div className="p-4 border-b border-white/[0.08]">
      <div className="flex gap-3">
        <img
          src={user?.avatar || ''}
          alt={user?.name}
          className="w-10 h-10 rounded-full"
        />
        
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-xl resize-none outline-none placeholder-[#71767b] min-h-[100px]"
            rows={3}
          />

          {mediaPreview.length > 0 && (
            <div className="mt-3 rounded-2xl overflow-hidden grid gap-1" style={{ 
              gridTemplateColumns: mediaPreview.length === 1 ? '1fr' : '1fr 1fr'
            }}>
              {mediaPreview.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} alt="" className="w-full aspect-video object-cover" />
                  <button
                    onClick={() => removeMedia(i)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/80"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {showPollCreator && (
            <div className="mt-3 card p-4">
              <input
                type="text"
                placeholder="Ask a question..."
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full input-clean mb-3"
              />
              {pollOptions.map((option, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...pollOptions];
                    newOptions[i] = e.target.value;
                    setPollOptions(newOptions);
                  }}
                  className="w-full input-clean mb-2"
                />
              ))}
              {pollOptions.length < 4 && (
                <button
                  onClick={() => setPollOptions([...pollOptions, ''])}
                  className="text-[#a855f7] text-sm hover:underline"
                >
                  + Add option
                </button>
              )}
            </div>
          )}

          {selectedVibe && (
            <div className="mt-2">
              <span className="badge badge-subtle">
                {VIBES[selectedVibe].emoji} {VIBES[selectedVibe].label}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.08]">
            <div className="flex gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleMediaSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full hover:bg-[#a855f7]/10 text-[#a855f7]"
                title="Add media"
              >
                🖼️
              </button>
              <button
                onClick={() => setShowPollCreator(!showPollCreator)}
                className={`p-2 rounded-full hover:bg-[#a855f7]/10 ${showPollCreator ? 'text-[#a855f7]' : 'text-[#a855f7]'}`}
                title="Create poll"
              >
                📊
              </button>
              <button
                onClick={insertCodeBlock}
                className="p-2 rounded-full hover:bg-[#a855f7]/10 text-[#a855f7]"
                title="Add code"
              >
                {'</>'}
              </button>
              <button
                onClick={() => setShowVibeSelector(!showVibeSelector)}
                className="p-2 rounded-full hover:bg-[#a855f7]/10 text-[#a855f7]"
                title="Set vibe"
              >
                😊
              </button>
            </div>

            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <span className={`text-sm ${content.length > maxChars ? 'text-red-500' : 'text-[#71767b]'}`}>
                  {content.length}/{maxChars}
                </span>
              )}
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || content.length > maxChars || createTweet.isPending}
                className="btn-primary"
              >
                {createTweet.isPending ? 'Posting...' : 'Chirp'}
              </button>
            </div>
          </div>

          {showVibeSelector && (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.values(VIBES).map((vibe) => (
                <button
                  key={vibe.id}
                  onClick={() => {
                    setSelectedVibe(vibe.id);
                    setShowVibeSelector(false);
                  }}
                  className={`badge ${selectedVibe === vibe.id ? 'bg-[#a855f7]/20 text-[#a855f7]' : 'badge-subtle'} hover:bg-white/[0.1]`}
                >
                  {vibe.emoji} {vibe.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
