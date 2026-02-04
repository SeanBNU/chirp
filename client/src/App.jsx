import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import TweetDetail from './pages/TweetDetail';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import Bookmarks from './pages/Bookmarks';
import HashtagPage from './pages/HashtagPage';
import Leaderboard from './pages/Leaderboard';
import VibePage from './pages/VibePage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-bg">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🐦</div>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-twitter-blue mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-bg">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🐦</div>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-twitter-blue mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="messages" element={<Messages />} />
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="search" element={<Search />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="vibe/:vibe" element={<VibePage />} />
        <Route path="hashtag/:tag" element={<HashtagPage />} />
        <Route path=":username" element={<Profile />} />
        <Route path=":username/status/:tweetId" element={<TweetDetail />} />
        <Route path=":username/followers" element={<Profile tab="followers" />} />
        <Route path=":username/following" element={<Profile tab="following" />} />
      </Route>
    </Routes>
  );
}

export default App;
