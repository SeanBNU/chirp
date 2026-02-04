import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { messageApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';

export function Messages() {
  const { username } = useParams<{ username?: string }>();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: messageApi.getConversations,
  });

  const { data: conversation } = useQuery({
    queryKey: ['conversation', username],
    queryFn: () => messageApi.getConversation(username!),
    enabled: !!username,
  });

  const sendMessage = useMutation({
    mutationFn: ({ receiverId, content }: { receiverId: string; content: string }) =>
      messageApi.send(receiverId, content),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['conversation', username] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversation?.user.id) return;
    
    sendMessage.mutate({
      receiverId: conversation.user.id,
      content: message.trim(),
    });
  };

  return (
    <div className="flex h-screen">
      {/* Conversations List */}
      <div className={`w-80 border-r border-white/[0.08] flex flex-col ${username ? 'hidden md:flex' : 'flex'}`}>
        <header className="p-4 border-b border-white/[0.08]">
          <h1 className="text-xl font-semibold">Messages</h1>
        </header>

        <div className="flex-1 overflow-y-auto">
          {conversations && conversations.length > 0 ? (
            conversations.map((conv) => (
              <Link
                key={conv.user.id}
                to={`/messages/${conv.user.username}`}
                className={`flex items-center gap-3 p-4 hover:bg-white/[0.03] transition-colors ${
                  username === conv.user.username ? 'bg-white/[0.05]' : ''
                }`}
              >
                <img
                  src={conv.user.avatar || ''}
                  alt={conv.user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold truncate">{conv.user.name}</span>
                    <span className="text-xs text-[#71767b]">
                      {formatDistanceToNow(new Date(conv.lastMessage.createdAt))}
                    </span>
                  </div>
                  <p className="text-sm text-[#71767b] truncate">
                    {conv.lastMessage.content}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-[#a855f7] rounded-full flex items-center justify-center text-xs">
                    {conv.unreadCount}
                  </div>
                )}
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-[#71767b]">
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Conversation */}
      {username && conversation ? (
        <div className="flex-1 flex flex-col">
          <header className="p-4 border-b border-white/[0.08] flex items-center gap-3">
            <Link to="/messages" className="md:hidden p-2 -ml-2 rounded-full hover:bg-white/[0.1]">
              ←
            </Link>
            <img
              src={conversation.user.avatar || ''}
              alt={conversation.user.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-semibold">{conversation.user.name}</div>
              <div className="text-sm text-[#71767b]">@{conversation.user.username}</div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.data.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl ${
                    msg.senderId === currentUser?.id
                      ? 'bg-[#a855f7] text-white'
                      : 'bg-white/[0.1]'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.senderId === currentUser?.id ? 'text-white/70' : 'text-[#71767b]'
                  }`}>
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-white/[0.08]">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Start a new message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-white/[0.04] rounded-full py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
              />
              <button
                type="submit"
                disabled={!message.trim() || sendMessage.isPending}
                className="btn-primary"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center text-[#71767b]">
          Select a conversation to start messaging
        </div>
      )}
    </div>
  );
}
