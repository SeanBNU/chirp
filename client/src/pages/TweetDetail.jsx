import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Tweet from '../components/Tweet';
import ComposeTweet from '../components/ComposeTweet';

export default function TweetDetail() {
  const { tweetId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tweet, setTweet] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isRetweeted, setIsRetweeted] = useState(false);

  useEffect(() => {
    loadTweet();
  }, [tweetId]);

  const loadTweet = async () => {
    setLoading(true);
    try {
      const [tweetData, repliesData] = await Promise.all([
        api.get(`/tweets/${tweetId}`),
        api.get(`/tweets/${tweetId}/replies`)
      ]);
      setTweet(tweetData);
      setReplies(repliesData);
      setIsLiked(tweetData.likes?.includes(user?.id));
      setIsRetweeted(tweetData.retweets?.includes(user?.id));
    } catch (error) {
      console.error('Error loading tweet:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const updated = await api.post(`/tweets/${tweetId}/like`);
      setTweet(updated);
      setIsLiked(updated.likes.includes(user.id));
    } catch (error) {
      console.error('Error liking tweet:', error);
    }
  };

  const handleRetweet = async () => {
    try {
      const updated = await api.post(`/tweets/${tweetId}/retweet`);
      setTweet(updated);
      setIsRetweeted(updated.retweets.includes(user.id));
    } catch (error) {
      console.error('Error retweeting:', error);
    }
  };

  const handleReplyCreated = (reply) => {
    setReplies(prev => [reply, ...prev]);
    setTweet(prev => ({ ...prev, replyCount: (prev.replyCount || 0) + 1 }));
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-twitter-blue"></div>
      </div>
    );
  }

  if (!tweet) {
    return (
      <div className="p-8 text-center text-twitter-gray">
        Tweet not found
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-twitter-lightGray z-10 p-4 flex items-center gap-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-twitter-lightGray/50 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Post</h1>
      </div>

      {/* Main Tweet */}
      <article className="p-4 border-b border-twitter-lightGray">
        <div className="flex items-center gap-3 mb-3">
          <Link to={`/${tweet.author?.username}`}>
            <img
              src={tweet.author?.avatar}
              alt={tweet.author?.displayName}
              className="w-12 h-12 rounded-full hover:opacity-90 transition-opacity"
            />
          </Link>
          <div>
            <Link 
              to={`/${tweet.author?.username}`}
              className="font-bold hover:underline block"
            >
              {tweet.author?.displayName}
            </Link>
            <span className="text-twitter-gray">@{tweet.author?.username}</span>
          </div>
        </div>

        <div className="text-xl mb-4 whitespace-pre-wrap">
          {tweet.content}
        </div>

        {tweet.media && tweet.media.length > 0 && (
          <div className={`mb-4 grid gap-2 ${tweet.media.length > 1 ? 'grid-cols-2' : ''}`}>
            {tweet.media.map((url, index) => (
              <img
                key={index}
                src={url}
                alt=""
                className="rounded-2xl border border-twitter-lightGray max-h-[400px] w-full object-cover"
              />
            ))}
          </div>
        )}

        <div className="text-twitter-gray border-b border-twitter-lightGray pb-4 mb-4">
          {format(new Date(tweet.createdAt), 'h:mm a · MMM d, yyyy')}
        </div>

        {(tweet.retweetCount > 0 || tweet.likeCount > 0) && (
          <div className="flex gap-6 border-b border-twitter-lightGray pb-4 mb-4">
            {tweet.retweetCount > 0 && (
              <span>
                <span className="font-bold">{tweet.retweetCount}</span>
                <span className="text-twitter-gray"> Reposts</span>
              </span>
            )}
            {tweet.likeCount > 0 && (
              <span>
                <span className="font-bold">{tweet.likeCount}</span>
                <span className="text-twitter-gray"> Likes</span>
              </span>
            )}
          </div>
        )}

        <div className="flex justify-around py-2">
          <button className="p-2 rounded-full hover:bg-twitter-blue/10 text-twitter-gray hover:text-twitter-blue transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
              <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
            </svg>
          </button>
          
          <button
            onClick={handleRetweet}
            className={`p-2 rounded-full hover:bg-twitter-green/10 transition-colors ${
              isRetweeted ? 'text-twitter-green' : 'text-twitter-gray hover:text-twitter-green'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
              <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
            </svg>
          </button>
          
          <button
            onClick={handleLike}
            className={`p-2 rounded-full hover:bg-twitter-red/10 transition-colors ${
              isLiked ? 'text-twitter-red' : 'text-twitter-gray hover:text-twitter-red'
            }`}
          >
            {isLiked ? (
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
              </svg>
            )}
          </button>
          
          <button className="p-2 rounded-full hover:bg-twitter-blue/10 text-twitter-gray hover:text-twitter-blue transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
              <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" />
            </svg>
          </button>
        </div>
      </article>

      {/* Reply Composer */}
      <ComposeTweet 
        onTweetCreated={handleReplyCreated} 
        placeholder="Post your reply"
        replyTo={tweetId}
      />

      {/* Replies */}
      <div>
        {replies.map(reply => (
          <Tweet key={reply.id} tweet={reply} />
        ))}
      </div>
    </div>
  );
}
