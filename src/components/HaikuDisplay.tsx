import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { Haiku } from '../types';
import { FavoriteButton } from './FavoriteButton';
import { ShareButton } from './ShareButton';

interface HaikuDisplayProps {
  haiku: Haiku;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

export function HaikuDisplay({ haiku, isFavorited, onToggleFavorite }: HaikuDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Haiku of {new Date(haiku.date).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
          })}
        </h2>
        <div className="h-1 w-24 bg-purple-600 mx-auto rounded-full"></div>
      </div>
      
      <div className="space-y-4 mb-8">
        {haiku.lines.map((line, index) => (
          <p 
            key={index} 
            className="text-xl text-gray-700 text-center font-serif italic"
          >
            {line}
          </p>
        ))}
      </div>
      
      <div className="flex items-center justify-center gap-4 mb-6">
        <FavoriteButton
          haikuId={haiku.id}
          isFavorited={isFavorited}
          onToggle={onToggleFavorite}
        />
        <ShareButton haiku={haiku} />
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">Inspired by today's headline:</p>
        <a 
          href={haiku.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors mt-2"
        >
          {haiku.sourceHeadline}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}