import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Bookmarks() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-twitter-lightGray z-10 p-4">
        <h1 className="text-xl font-bold">Bookmarks</h1>
        <p className="text-twitter-gray text-sm">@{user?.username}</p>
      </div>

      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Save posts for later</h2>
        <p className="text-twitter-gray max-w-sm mx-auto">
          Bookmark posts to easily find them again in the future.
        </p>
        <p className="text-twitter-gray mt-4 text-sm">
          (Bookmarks feature coming soon!)
        </p>
      </div>
    </div>
  );
}
