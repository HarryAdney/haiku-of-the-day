import React from 'react';
import { Loader } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader className="w-8 h-8 text-purple-600 animate-spin mb-4" />
      <p className="text-gray-600">Loading haikus...</p>
    </div>
  );
}