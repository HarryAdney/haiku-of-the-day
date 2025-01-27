import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Haiku } from '../types';
import { useAuth } from './useAuth';
import { getTodayHaiku } from '../utils/haiku';
import toast from 'react-hot-toast';

export function useHaikus() {
  const [haikus, setHaikus] = useState<Record<string, Haiku>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;

    const fetchHaikus = async () => {
      try {
        setError(null);
        // Fetch all haikus first
        const { data: haikusData, error: haikusError } = await supabase
          .from('haikus')
          .select('*')
          .order('date', { ascending: false });

        if (haikusError) {
          throw haikusError;
        }

        const haikuMap: Record<string, Haiku> = {};
        
        if (haikusData) {
          haikusData.forEach(haiku => {
            haikuMap[haiku.date] = {
              id: haiku.id,
              date: haiku.date,
              lines: haiku.lines,
              sourceHeadline: haiku.source_headline,
              sourceUrl: haiku.source_url
            };
          });
        }

        try {
          // Fetch today's haiku and ensure it's included
          const todayHaiku = await getTodayHaiku();
          haikuMap[todayHaiku.date] = todayHaiku;
        } catch (error) {
          console.error('Error fetching today\'s haiku:', error);
          toast.error('Failed to load today\'s haiku');
        }

        if (mounted) {
          setHaikus(haikuMap);
        }

        if (user) {
          const { data: favoritesData, error: favoritesError } = await supabase
            .from('favorites')
            .select('haiku_id')
            .eq('user_id', user.id)
            .abortSignal(new AbortController().signal);

          if (favoritesError) {
            throw favoritesError;
          }

          if (favoritesData && mounted) {
            setFavorites(new Set(favoritesData.map(f => f.haiku_id)));
          }
        }
      } catch (error) {
        console.error('Error in fetchHaikus:', error);
        setError(error instanceof Error ? error : new Error('Failed to fetch haikus'));
        toast.error('Failed to load haikus. Please try again later.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchHaikus();

    // Set up real-time subscription for favorites
    let favoritesSubscription: ReturnType<typeof supabase.channel> | null = null;
    
    if (user) {
      favoritesSubscription = supabase
        .channel('favorites_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'favorites',
            filter: `user_id=eq.${user.id}`
          },
          async () => {
            // Refresh favorites on any change
            const { data } = await supabase
              .from('favorites')
              .select('haiku_id')
              .eq('user_id', user.id);
              
            if (data && mounted) {
              setFavorites(new Set(data.map(f => f.haiku_id)));
            }
          }
        )
        .subscribe();
    }

    return () => {
      mounted = false;
      favoritesSubscription?.unsubscribe();
    };
  }, [user]);

  return { haikus, favorites, loading, error };
}