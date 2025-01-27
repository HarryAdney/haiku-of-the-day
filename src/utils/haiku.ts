import { format } from 'date-fns';
import type { Haiku } from '../types';
import { supabase } from '../lib/supabase';

const syllable = (word: string): number => {
  word = word.toLowerCase();
  word = word.replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const syl = word.match(/[aeiouy]{1,2}/g);
  return syl ? syl.length : 0;
};

const generateHaiku = (headline: string): string[] => {
  const words = headline.split(/\s+/);
  const lines: string[] = ['', '', ''];
  let currentLine = 0;
  let syllableCount = 0;
  const targetSyllables = [5, 7, 5];

  words.forEach(word => {
    const wordSyllables = syllable(word);
    if (syllableCount + wordSyllables <= targetSyllables[currentLine]) {
      lines[currentLine] += (lines[currentLine] ? ' ' : '') + word;
      syllableCount += wordSyllables;
    } else if (currentLine < 2) {
      currentLine++;
      syllableCount = wordSyllables;
      lines[currentLine] = word;
    }
  });

  // If any line is empty, use fallback content
  if (!lines[0] || !lines[1] || !lines[2]) {
    return [
      "Morning sun rises",
      "News flows like gentle river",
      "Stories unfold now"
    ];
  }

  return lines;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await delay(baseDelay * Math.pow(2, i));
      }
    }
  }
  
  throw lastError!;
};

const fetchTopNews = async (): Promise<{ headline: string; url: string }> => {
  const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
  
  if (!API_KEY) {
    throw new Error('News API key is not configured');
  }

  try {
    const fetchNews = async () => {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Haiku-Generator/1.0'
          },
          cache: 'no-cache'
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`News API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.articles || data.articles.length === 0) {
        throw new Error('No articles found in the response');
      }

      // Find the first article with valid title and url
      const article = data.articles.find(
        (a: any) => a.title && a.url && !a.title.includes('[Removed]')
      );
      
      if (!article) {
        throw new Error('No valid articles found');
      }

      return {
        headline: article.title,
        url: article.url
      };
    };

    return await retry(fetchNews);
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return {
      headline: "Technology shapes our world in unexpected ways",
      url: "https://news.google.com/technology"
    };
  }
};

const cleanupDuplicateHaikus = async (date: string) => {
  try {
    // Get all haikus for the given date
    const { data: haikus, error } = await supabase
      .from('haikus')
      .select('id, created_at')
      .eq('date', date)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching haikus for cleanup:', error);
      return;
    }

    // If there's more than one haiku for the date, keep only the oldest one
    if (haikus && haikus.length > 1) {
      const [firstHaiku, ...duplicates] = haikus;
      
      // Delete all but the first haiku
      const { error: deleteError } = await supabase
        .from('haikus')
        .delete()
        .in('id', duplicates.map(h => h.id));

      if (deleteError) {
        console.error('Error deleting duplicate haikus:', deleteError);
      }
    }
  } catch (error) {
    console.error('Error in cleanupDuplicateHaikus:', error);
  }
};

export const getTodayHaiku = async (): Promise<Haiku> => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  try {
    // First, clean up any duplicate haikus for today
    await cleanupDuplicateHaikus(today);

    // Check if we already have a haiku for today
    const { data: existingHaiku, error: fetchError } = await supabase
      .from('haikus')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (fetchError) {
      console.error('Failed to fetch existing haiku:', fetchError);
      throw new Error('Database error while fetching haiku');
    }

    if (existingHaiku) {
      return {
        id: existingHaiku.id,
        date: existingHaiku.date,
        lines: existingHaiku.lines,
        sourceHeadline: existingHaiku.source_headline,
        sourceUrl: existingHaiku.source_url
      };
    }

    // If no haiku exists for today, create a new one
    const { headline, url } = await fetchTopNews();
    const newHaiku: Haiku = {
      id: crypto.randomUUID(),
      date: today,
      lines: generateHaiku(headline),
      sourceHeadline: headline,
      sourceUrl: url
    };

    // Store the new haiku in the database
    const { error: insertError } = await supabase
      .from('haikus')
      .insert([{
        id: newHaiku.id,
        date: newHaiku.date,
        lines: newHaiku.lines,
        source_headline: newHaiku.sourceHeadline,
        source_url: newHaiku.sourceUrl
      }]);

    if (insertError) {
      console.error('Failed to store haiku:', insertError);
      throw new Error('Database error while storing haiku');
    }

    return newHaiku;
  } catch (error) {
    console.error('Error in getTodayHaiku:', error);
    
    // Create a fallback haiku if everything fails
    const fallbackHaiku: Haiku = {
      id: crypto.randomUUID(),
      date: today,
      lines: [
        "Morning sun rises",
        "News flows like gentle river",
        "Stories unfold now"
      ],
      sourceHeadline: "Daily Reflection",
      sourceUrl: "https://news.google.com"
    };

    // Try to store the fallback haiku
    try {
      await supabase
        .from('haikus')
        .insert([{
          id: fallbackHaiku.id,
          date: fallbackHaiku.date,
          lines: fallbackHaiku.lines,
          source_headline: fallbackHaiku.sourceHeadline,
          source_url: fallbackHaiku.sourceUrl
        }]);
    } catch (insertError) {
      console.error('Failed to store fallback haiku:', insertError);
    }

    return fallbackHaiku;
  }
};