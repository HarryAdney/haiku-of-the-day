import React from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface FavoriteButtonProps {
  haikuId: string;
  isFavorited: boolean;
  onToggle: () => void;
}

export function FavoriteButton({ haikuId, isFavorited, onToggle }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleToggle = async () => {
    if (!user) {
      toast.error('Please sign in to favorite haikus');
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .match({ user_id: user.id, haiku_id: haikuId });
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, haiku_id: haikuId });
      }
      onToggle();
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-full transition-colors ${
        isFavorited
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-red-500'
      }`}
    >
      <Heart
        className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''} ${
          isLoading ? 'animate-pulse' : ''
        }`}
      />
    </button>
  );
}