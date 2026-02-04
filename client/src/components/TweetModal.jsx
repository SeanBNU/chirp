import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { VIBES, playSound, triggerConfetti } from '../utils/vibes';

export default function TweetModal({ onClose, onTweetCreated, replyTo = null }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [showVibeSelector, setShowVibeSelector] = useState(false);
  const fileInputRef = useRef(null);

  const hasCode = content.includes('```');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (replyTo) formData.append('replyTo', replyTo);
      if (selectedVibe) formData.append('vibe', selectedVibe);
      if (hasCode) formData.append('hasCode', 'true');
      media.forEach(file => formData.append('media', file));

      const tweet = await api.upload('/tweets', formData);
      
      if (user?.soundEnabled !== false) {
        playSound('post');
      }
      
      if (tweet.newAchievements?.length > 0) {
        triggerConfetti();
      }
      
      if (onTweetCreated) onTweetCreated(tweet);
      onClose();
    } catch (error) {
      console.error('Error creating chirp:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 4 - media.length);
    setMedia(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
  };

  const insertCodeBlock = () => {
    const codeTemplate = '\n```javascript\n// Your code here\n```\n';
    setContent(prev => prev + codeTemplate);
  };

  const charCount = content.length;
  const maxChars = 500;
  const isOverLimit = charCount > maxChars;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-12">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div className="relative glass rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto border border-white/[0.08]">
        <div className="sticky top-0 glass p-4 flex items-center border-b border-white/[0.08]">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/[0.06] transition-colors text-[#e7e9ea]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex gap-3">
            <img
              src={user?.avatar}
              alt={user?.displayName}
              className="w-10 h-10 rounded-full"
            />
            
            <form onSubmit={handleSubmit} className="flex-1">
              {selectedVibe && (
                <div 
                  className="flex items-center gap-2 mb-2 badge w-fit"
                  style={{ background: `${VIBES[selectedVibe].color}15`, color: VIBES[selectedVibe].color }}
                >
                  <span>{VIBES[selectedVibe].emoji}</span>
                  <span className="text-xs">{VIBES[selectedVibe].label}</span>
                  <button 
                    type="button"
                    onClick={() => setSelectedVibe(null)}
                    className="ml-1 opacity-60 hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              )}

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                className="w-full bg-transparent text-xl text-[#e7e9ea] placeholder-[#71767b] resize-none focus:outline-none min-h-[120px]"
                autoFocus
              />

              {mediaPreview.length > 0 && (
                <div className={`grid gap-1 mb-3 rounded-2xl overflow-hidden ${mediaPreview.length > 1 ? 'grid-cols-2' : ''}`}>
                  {mediaPreview.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt=""
                        className="max-h-[200px] w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full hover:bg-black/80 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                          <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between border-t border-white/[0.08] pt-3">
                <div className="flex items-center gap-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleMediaSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={media.length >= 4}
                    className="p-2 rounded-full hover:bg-[#a855f7]/10 text-[#a855f7] transition-colors disabled:opacity-50"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z" />
                    </svg>
                  </button>
                  
                  <button
                    type="button"
                    onClick={insertCodeBlock}
                    className="p-2 rounded-full hover:bg-[#a855f7]/10 text-[#a855f7] transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                    </svg>
                  </button>
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowVibeSelector(!showVibeSelector)}
                      className={`p-2 rounded-full hover:bg-[#a855f7]/10 transition-colors ${selectedVibe ? '' : 'text-[#a855f7]'}`}
                      style={selectedVibe ? { color: VIBES[selectedVibe].color } : {}}
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M8 9.5C8 8.119 8.672 7 9.5 7S11 8.119 11 9.5 10.328 12 9.5 12 8 10.881 8 9.5zm6.5 2.5c.828 0 1.5-1.119 1.5-2.5S15.328 7 14.5 7 13 8.119 13 9.5s.672 2.5 1.5 2.5zM12 16c-2.224 0-4.181-1.12-5.268-2.82-.344-.538-.59-1.173-.682-1.68L6 11.5c0 3.314 2.686 6 6 6s6-2.686 6-6l-.05.001c-.092.506-.338 1.141-.682 1.679C16.182 14.88 14.224 16 12 16z" />
                        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" />
                      </svg>
                    </button>
                    
                    {showVibeSelector && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowVibeSelector(false)} />
                        <div className="absolute bottom-full left-0 mb-2 glass rounded-xl p-2 z-20 border border-white/[0.08] w-[180px]">
                          <p className="text-xs text-[#71767b] mb-2 px-2">Set vibe</p>
                          {Object.values(VIBES).map(vibe => (
                            <button
                              key={vibe.id}
                              type="button"
                              onClick={() => {
                                setSelectedVibe(vibe.id);
                                setShowVibeSelector(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/[0.06] flex items-center gap-2 text-sm ${selectedVibe === vibe.id ? 'bg-white/[0.06]' : ''}`}
                            >
                              <span>{vibe.emoji}</span>
                              <span style={{ color: vibe.color }}>{vibe.label}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {content.length > 0 && (
                    <div className={`text-sm ${isOverLimit ? 'text-red-400' : 'text-[#71767b]'}`}>
                      {maxChars - charCount}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={(!content.trim() && media.length === 0) || isSubmitting || isOverLimit}
                    className="btn-primary"
                  >
                    {isSubmitting ? 'Posting...' : 'Chirp'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
