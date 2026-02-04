import { useEffect, useCallback } from 'react';
import { ComposeTweet } from './ComposeTweet';

interface TweetModalProps {
  onClose: () => void;
  parentId?: string;
}

export function TweetModal({ onClose, parentId }: TweetModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-xl glass rounded-2xl border border-white/[0.08]">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/[0.1] flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        
        <ComposeTweet 
          parentId={parentId}
          onSuccess={onClose}
        />
      </div>
    </div>
  );
}
