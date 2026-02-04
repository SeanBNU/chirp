import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import type { Tweet as TweetType, ReactionType } from '@chirp/shared';
import { REACTIONS, VIBES, getVibeClass, highlightCode, triggerConfetti, playSound } from '../utils/vibes';
import { useReaction, useRetweet, useVote } from '../hooks/useTweets';
import { useUIStore } from '../stores/uiStore';

interface TweetProps {
  tweet: TweetType;
  showActions?: boolean;
}

export function Tweet({ tweet, showActions = true }: TweetProps) {
  const [showReactions, setShowReactions] = useState(false);
  const { soundEnabled } = useUIStore();
  const reactionMutation = useReaction();
  const retweetMutation = useRetweet();
  const voteMutation = useVote();

  const handleReaction = (type: ReactionType) => {
    reactionMutation.mutate({ tweetId: tweet.id, type });
    if (soundEnabled) playSound('reaction');
    setShowReactions(false);
  };

  const handleRetweet = () => {
    retweetMutation.mutate(tweet.id);
  };

  const handleVote = (optionId: string) => {
    voteMutation.mutate({ tweetId: tweet.id, optionId });
  };

  const formatContent = (content: string) => {
    // Handle code blocks
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    let result = content;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const code = highlightCode(match[2]);
      result = result.replace(
        match[0],
        `<pre class="code-block my-2">${code}</pre>`
      );
    }

    // Handle hashtags and mentions
    result = result
      .replace(/#(\w+)/g, '<a href="/explore?q=%23$1" class="text-[#a855f7] hover:underline">#$1</a>')
      .replace(/@(\w+)/g, '<a href="/$1" class="text-[#a855f7] hover:underline">@$1</a>');

    return result;
  };

  const displayTweet = tweet.retweetOf || tweet;
  const vibeInfo = displayTweet.vibe ? VIBES[displayTweet.vibe] : null;

  return (
    <article className={`p-4 border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors ${getVibeClass(displayTweet.vibe)}`}>
      {tweet.retweetOf && (
        <div className="flex items-center gap-2 text-[#71767b] text-sm mb-2 ml-6">
          <span>🔁</span>
          <span>{tweet.author.name} Rechirped</span>
        </div>
      )}

      <div className="flex gap-3">
        <Link to={`/${displayTweet.author.username}`}>
          <img
            src={displayTweet.author.avatar || ''}
            alt={displayTweet.author.name}
            className="w-10 h-10 rounded-full"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <Link to={`/${displayTweet.author.username}`} className="font-semibold hover:underline">
              {displayTweet.author.name}
            </Link>
            {displayTweet.author.streak > 0 && (
              <span className="text-orange-400">🔥</span>
            )}
            <span className="text-[#71767b]">@{displayTweet.author.username}</span>
            <span className="text-[#71767b]">·</span>
            <Link
              to={`/${displayTweet.author.username}/status/${displayTweet.id}`}
              className="text-[#71767b] hover:underline"
            >
              {formatDistanceToNow(new Date(displayTweet.createdAt), { addSuffix: true })}
            </Link>
            {vibeInfo && (
              <span className="text-sm" title={vibeInfo.label}>
                {vibeInfo.emoji}
              </span>
            )}
          </div>

          <div
            className="mt-1 break-words"
            dangerouslySetInnerHTML={{ __html: formatContent(displayTweet.content) }}
          />

          {displayTweet.media && displayTweet.media.length > 0 && (
            <div className="mt-3 rounded-2xl overflow-hidden">
              {displayTweet.media.map((url, i) => (
                <img key={i} src={url} alt="" className="w-full" />
              ))}
            </div>
          )}

          {displayTweet.poll && (
            <div className="mt-3 space-y-2">
              <div className="font-medium">{displayTweet.poll.question}</div>
              {displayTweet.poll.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  disabled={!!displayTweet.poll?.userVotedOptionId}
                  className="w-full card p-3 text-left hover:bg-white/[0.03] transition-colors relative overflow-hidden"
                >
                  <div
                    className="absolute inset-0 bg-[#a855f7]/20"
                    style={{ width: `${option.percentage}%` }}
                  />
                  <div className="relative flex justify-between">
                    <span>
                      {option.text}
                      {displayTweet.poll?.userVotedOptionId === option.id && ' ✓'}
                    </span>
                    <span>{option.percentage}%</span>
                  </div>
                </button>
              ))}
              <div className="text-sm text-[#71767b]">
                {displayTweet.poll.totalVotes} votes
              </div>
            </div>
          )}

          {showActions && (
            <div className="flex items-center justify-between mt-3 max-w-md text-[#71767b]">
              <Link
                to={`/${displayTweet.author.username}/status/${displayTweet.id}`}
                className="flex items-center gap-1 hover:text-[#a855f7] transition-colors"
              >
                <span>💬</span>
                <span className="text-sm">{displayTweet.repliesCount || ''}</span>
              </Link>

              <button
                onClick={handleRetweet}
                className={`flex items-center gap-1 hover:text-green-500 transition-colors ${
                  displayTweet.isRetweeted ? 'text-green-500' : ''
                }`}
              >
                <span>🔁</span>
                <span className="text-sm">{displayTweet.retweetsCount || ''}</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="flex items-center gap-1 hover:text-[#a855f7] transition-colors"
                >
                  <span>
                    {displayTweet.userReaction
                      ? REACTIONS[displayTweet.userReaction].emoji
                      : '❤️'}
                  </span>
                  <span className="text-sm">{displayTweet.totalReactions || ''}</span>
                </button>

                {showReactions && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 glass rounded-full p-2 flex gap-1">
                    {Object.entries(REACTIONS).map(([type, reaction]) => (
                      <button
                        key={type}
                        onClick={() => handleReaction(type as ReactionType)}
                        className="w-8 h-8 rounded-full hover:bg-white/[0.1] flex items-center justify-center text-lg transition-transform hover:scale-125"
                        title={reaction.label}
                      >
                        {reaction.emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="hover:text-[#a855f7] transition-colors">
                <span>📤</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
