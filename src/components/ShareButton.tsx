import React from 'react';
import { Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareButtonProps {
  haiku: {
    lines: string[];
    sourceHeadline: string;
  };
}

export function ShareButton({ haiku }: ShareButtonProps) {
  const handleShare = async () => {
    const text = `${haiku.lines.join('\n')}\n\nInspired by: ${haiku.sourceHeadline}\n\nvia Haiku of the Day`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Haiku of the Day',
          text
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
    >
      <Share2 className="w-6 h-6" />
    </button>
  );
}