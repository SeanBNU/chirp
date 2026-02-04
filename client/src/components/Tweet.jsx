import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { VIBES, REACTIONS, getVibeClass, highlightCode, playSound, triggerConfetti } from '../utils/vibes';

function formatContent(content) {
  // Check for code blocks
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', language: match[1] || 'javascript', content: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return parts.map((part, index) => {
    if (part.type === 'code') {
      return (
        <div key={index} className="code-block my-3">
          <div className="flex items-center justify-between text-xs text-[#71767b] mb-3 pb-2 border-b border-white/[0.06]">
            <span className="uppercase tracking-wide">{part.language}</span>
            <button 
              className="hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(part.content);
              }}
            >
              Copy
            </button>
          </div>
          <pre 
            className="overflow-x-auto text-[#e7e9ea]"
            dangerouslySetInnerHTML={{ __html: highlightCode(part.content, part.language) }}
          />
        </div>
      );
    }

    return (
      <span key={index}>
        {part.content.split(/(\s+)/).map((word, wordIndex) => {
          if (word.startsWith('#')) {
            return (
              <Link
                key={wordIndex}
                to={`/hashtag/${word.slice(1)}`}
                className="text-[#a855f7] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {word}
              </Link>
            );
          }
          if (word.startsWith('@')) {
            return (
              <Link
                key={wordIndex}
                to={`/${word.slice(1)}`}
                className="text-[#a855f7] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {word}
              </Link>
            );
          }
          return word;
        })}
      </span>
    );
  });
}

export default function Tweet({ tweet, onUpdate, showActions = true }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [animatingReaction, setAnimatingReaction] = useState(null);
  const [localReactions, setLocalReactions] = useState(tweet.reactionCounts || {});
  const [localTotalReactions, setLocalTotalReactions] = useState(tweet.totalReactions || 0);
  const [isRetweeted, setIsRetweeted] = useState(tweet.retweets?.includes(user?.id));
  const [retweetCount, setRetweetCount] = useState(tweet.retweetCount || 0);
  const [userReaction, setUserReaction] = useState(() => {
    if (!tweet.reactions) return null;
    for (const [type, users] of Object.entries(tweet.reactions)) {
      if (users.includes(user?.id)) return type;
    }
    return null;
  });

  const handleReaction = async (e, reactionType) => {
    e.stopPropagation();
    setShowReactions(false);
    setAnimatingReaction(reactionType);
    
    try {
      const updated = await api.post(`/tweets/${tweet.id}/react`, { reaction: reactionType });
      
      setLocalReactions(updated.reactionCounts);
      setLocalTotalReactions(updated.totalReactions);
      
      let newUserReaction = null;
      for (const [type, users] of Object.entries(updated.reactions)) {
        if (users.includes(user?.id)) {
          newUserReaction = type;
          break;
        }
      }
      setUserReaction(newUserReaction);
      
      if (user?.soundEnabled !== false) {
        playSound('like');
      }
      
      if (updated.newAchievements?.length > 0) {
        triggerConfetti();
      }
      
      if (onUpdate) onUpdate(updated);
    } catch (error) {
      console.error('Error reacting:', error);
    }
    
    setTimeout(() => setAnimatingReaction(null), 200);
  };

  const handleRetweet = async (e) => {
    e.stopPropagation();
    try {
      const updated = await api.post(`/tweets/${tweet.id}/retweet`);
      setIsRetweeted(updated.retweets.includes(user.id));
      setRetweetCount(updated.retweetCount);
      if (onUpdate) onUpdate(updated);
    } catch (error) {
      console.error('Error retweeting:', error);
    }
  };

  const handleVote = async (e, optionId) => {
    e.stopPropagation();
    try {
      const updated = await api.post(`/tweets/${tweet.id}/vote`, { optionId });
      if (onUpdate) onUpdate(updated);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Delete this chirp?')) {
      try {
        await api.delete(`/tweets/${tweet.id}`);
        if (onUpdate) onUpdate(null);
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
    setShowMenu(false);
  };

  const handleTweetClick = () => {
    navigate(`/${tweet.author?.username}/status/${tweet.id}`);
  };

  const timeAgo = formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: false });
  const shortTime = timeAgo
    .replace(' seconds', 's').replace(' second', 's')
    .replace(' minutes', 'm').replace(' minute', 'm')
    .replace(' hours', 'h').replace(' hour', 'h')
    .replace(' days', 'd').replace(' day', 'd')
    .replace('about ', '').replace('less than a', '<1');

  const vibeInfo = tweet.vibe ? VIBES[tweet.vibe] : null;

  return (
    <article 
      className={`border-b border-white/[0.08] px-4 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer ${getVibeClass(tweet.vibe)}`}
      onClick={handleTweetClick}
    >
      <div className="flex gap-3">
        <Link to={`/${tweet.author?.username}`} onClick={(e) => e.stopPropagation()}>
          <img
            src={tweet.author?.avatar}
            alt={tweet.author?.displayName}
            className="w-10 h-10 rounded-full hover:opacity-90 transition-opacity"
          />
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 min-w-0 flex-wrap">
              <Link 
                to={`/${tweet.author?.username}`}
                className="font-semibold text-[#e7e9ea] hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {tweet.author?.displayName}
              </Link>
              {tweet.author?.streak >= 7 && (
                <span className="text-orange-400 text-xs">🔥</span>
              )}
              <span className="text-[#71767b] truncate">@{tweet.author?.username}</span>
              <span className="text-[#71767b]">·</span>
              <span className="text-[#71767b] hover:underline text-sm">{shortTime}</span>
              {vibeInfo && (
                <span 
                  className="text-xs ml-1 opacity-70"
                  style={{ color: vibeInfo.color }}
                >
                  {vibeInfo.emoji}
                </span>
              )}
            </div>
            
            {showActions && tweet.authorId === user?.id && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-2 rounded-full hover:bg-white/[0.06] text-[#71767b] hover:text-[#a855f7] transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                  </svg>
                </button>
                
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                    <div className="absolute right-0 top-0 w-[200px] glass rounded-xl border border-white/[0.08] z-20 overflow-hidden">
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-3 hover:bg-white/[0.06] text-red-400 flex items-center gap-3 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                          <path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3-2.79L19.93 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.27 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.47.93-1 .93H7.86c-.53 0-.96-.41-1-.93L6.07 8h11.85l-.79 11.07z" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-1 text-[15px] text-[#e7e9ea] whitespace-pre-wrap break-words leading-relaxed">
            {formatContent(tweet.content)}
          </div>
          
          {/* Media */}
          {tweet.media && tweet.media.length > 0 && (
            <div className={`mt-3 grid gap-1 rounded-2xl overflow-hidden ${tweet.media.length > 1 ? 'grid-cols-2' : ''}`}>
              {tweet.media.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt=""
                  className="max-h-[300px] w-full object-cover"
                  onClick={(e) => e.stopPropagation()}
                />
              ))}
            </div>
          )}

          {/* Poll */}
          {tweet.poll && (
            <div className="mt-3 space-y-2">
              <p className="font-medium text-[#e7e9ea]">{tweet.poll.question}</p>
              {tweet.poll.options.map(option => {
                const hasVoted = option.votes?.includes(user?.id);
                const totalVotes = tweet.poll.totalVotes || 0;
                const percentage = option.percentage || 0;
                
                return (
                  <button
                    key={option.id}
                    onClick={(e) => handleVote(e, option.id)}
                    className="poll-option w-full text-left p-3 rounded-xl border border-white/[0.08] relative overflow-hidden transition-colors"
                  >
                    <div 
                      className="absolute left-0 top-0 h-full bg-[#a855f7]/20 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="relative flex justify-between items-center">
                      <span className={`text-[#e7e9ea] ${hasVoted ? 'font-medium' : ''}`}>
                        {option.text} {hasVoted && '✓'}
                      </span>
                      <span className="text-[#71767b] text-sm">{percentage}%</span>
                    </div>
                  </button>
                );
              })}
              <p className="text-[#71767b] text-sm">
                {tweet.poll.totalVotes || 0} votes · {new Date(tweet.poll.endsAt) > new Date() ? 'Poll active' : 'Final results'}
              </p>
            </div>
          )}
          
          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between mt-3 max-w-[425px] text-[#71767b]">
              {/* Reply */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/${tweet.author?.username}/status/${tweet.id}`);
                }}
                className="flex items-center gap-2 group"
              >
                <div className="p-2 rounded-full group-hover:bg-[#a855f7]/10 group-hover:text-[#a855f7] transition-colors">
                  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
                    <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
                  </svg>
                </div>
                <span className="text-sm group-hover:text-[#a855f7]">{tweet.replyCount || ''}</span>
              </button>
              
              {/* Retweet */}
              <button
                onClick={handleRetweet}
                className={`flex items-center gap-2 group ${isRetweeted ? 'text-green-500' : ''}`}
              >
                <div className={`p-2 rounded-full group-hover:bg-green-500/10 group-hover:text-green-500 transition-colors ${isRetweeted ? 'text-green-500' : ''}`}>
                  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
                    <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
                  </svg>
                </div>
                <span className={`text-sm ${isRetweeted ? 'text-green-500' : 'group-hover:text-green-500'}`}>
                  {retweetCount || ''}
                </span>
              </button>
              
              {/* Reactions */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReactions(!showReactions);
                  }}
                  className={`flex items-center gap-2 group ${userReaction ? 'text-pink-500' : ''}`}
                >
                  <div className={`p-2 rounded-full group-hover:bg-pink-500/10 transition-colors ${animatingReaction ? 'reaction-pop' : ''}`}>
                    {userReaction ? (
                      <span className="text-base">{REACTIONS[userReaction].emoji}</span>
                    ) : (
                      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] group-hover:text-pink-500" fill="currentColor">
                        <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${userReaction ? 'text-pink-500' : 'group-hover:text-pink-500'}`}>
                    {localTotalReactions || ''}
                  </span>
                </button>
                
                {showReactions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowReactions(false); }} />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 glass rounded-full px-2 py-1.5 flex gap-0.5 z-20 border border-white/[0.08]">
                      {Object.entries(REACTIONS).map(([key, { emoji, label }]) => (
                        <button
                          key={key}
                          onClick={(e) => handleReaction(e, key)}
                          className={`p-1.5 hover:scale-125 transition-transform rounded-full hover:bg-white/[0.06] ${userReaction === key ? 'bg-white/[0.1] scale-110' : ''}`}
                          title={label}
                        >
                          <span className="text-lg">{emoji}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Share */}
              <button className="flex items-center gap-2 group">
                <div className="p-2 rounded-full group-hover:bg-[#a855f7]/10 group-hover:text-[#a855f7] transition-colors">
                  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
                    <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" />
                  </svg>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
