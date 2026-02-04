import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.user.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await api.get('/messages');
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const data = await api.get(`/messages/${userId}`);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.get('/users');
      setUsers(data.filter(u => u.id !== user.id));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const message = await api.post('/messages', {
        receiverId: activeConversation.user.id,
        content: newMessage
      });
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStartConversation = async (selectedUser) => {
    setActiveConversation({ user: selectedUser, lastMessage: null });
    setShowNewConversation(false);
    setSearchQuery('');
    setMessages([]);
    await loadMessages(selectedUser.id);
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {/* Conversations List */}
      <div className="w-[380px] border-r border-twitter-lightGray flex flex-col">
        <div className="sticky top-0 bg-black/80 backdrop-blur-sm p-4 border-b border-twitter-lightGray">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Messages</h1>
            <button
              onClick={() => {
                setShowNewConversation(true);
                loadUsers();
              }}
              className="p-2 rounded-full hover:bg-twitter-lightGray/50 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z" />
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-twitter-blue"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Welcome to your inbox!</h2>
            <p className="text-twitter-gray mb-4">
              Drop a line, share posts and more with private conversations between you and others.
            </p>
            <button
              onClick={() => {
                setShowNewConversation(true);
                loadUsers();
              }}
              className="bg-twitter-blue hover:bg-twitter-darkBlue text-white font-bold py-3 px-6 rounded-full transition-colors"
            >
              Write a message
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conversation => (
              <div
                key={conversation.user?.id}
                onClick={() => setActiveConversation(conversation)}
                className={`p-4 hover:bg-white/[0.03] cursor-pointer transition-colors ${
                  activeConversation?.user?.id === conversation.user?.id ? 'bg-white/5' : ''
                }`}
              >
                <div className="flex gap-3">
                  <img
                    src={conversation.user?.avatar}
                    alt={conversation.user?.displayName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate">{conversation.user?.displayName}</span>
                      <span className="text-twitter-gray text-sm">
                        {formatDistanceToNow(new Date(conversation.lastMessage?.createdAt), { addSuffix: false })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-twitter-gray truncate">@{conversation.user?.username}</span>
                    </div>
                    <p className="text-twitter-gray text-sm truncate mt-1">
                      {conversation.lastMessage?.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <div className="sticky top-0 bg-black/80 backdrop-blur-sm p-4 border-b border-twitter-lightGray">
              <div className="flex items-center gap-3">
                <img
                  src={activeConversation.user?.avatar}
                  alt={activeConversation.user?.displayName}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <span className="font-bold">{activeConversation.user?.displayName}</span>
                  <span className="text-twitter-gray ml-1">@{activeConversation.user?.username}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      message.senderId === user.id
                        ? 'bg-twitter-blue text-white'
                        : 'bg-twitter-darkGray'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === user.id ? 'text-white/70' : 'text-twitter-gray'
                    }`}>
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-twitter-lightGray">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Start a new message"
                  className="flex-1 bg-twitter-darkGray rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-twitter-blue"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 rounded-full bg-twitter-blue hover:bg-twitter-darkBlue disabled:opacity-50 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M2.504 21.866l.526-2.108C3.04 19.719 4 15.823 4 12s-.96-7.719-.97-7.757l-.527-2.109L22.236 12 2.504 21.866zM5.981 13c-.072 1.962-.34 3.833-.583 5.183L17.764 12 5.398 5.818c.242 1.349.51 3.221.583 5.183H10v2H5.981z" />
                  </svg>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Select a message</h2>
              <p className="text-twitter-gray">
                Choose from your existing conversations or start a new one.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-twitter-gray/40 z-50 flex items-start justify-center pt-20">
          <div className="fixed inset-0" onClick={() => setShowNewConversation(false)} />
          <div className="relative bg-black rounded-2xl w-full max-w-[600px] max-h-[80vh] overflow-hidden">
            <div className="sticky top-0 bg-black p-4 border-b border-twitter-lightGray">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowNewConversation(false)}
                  className="p-2 rounded-full hover:bg-twitter-lightGray/50 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z" />
                  </svg>
                </button>
                <h2 className="text-xl font-bold">New message</h2>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people"
                className="w-full mt-4 bg-transparent border-b border-twitter-lightGray py-2 focus:outline-none focus:border-twitter-blue"
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {filteredUsers.map(u => (
                <div
                  key={u.id}
                  onClick={() => handleStartConversation(u)}
                  className="p-4 hover:bg-white/5 cursor-pointer transition-colors flex items-center gap-3"
                >
                  <img
                    src={u.avatar}
                    alt={u.displayName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-bold">{u.displayName}</div>
                    <div className="text-twitter-gray text-sm">@{u.username}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
