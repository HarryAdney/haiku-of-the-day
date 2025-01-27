import React, { useState } from 'react';
import { format } from 'date-fns';
import { Scroll, Sparkles } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { Calendar } from './components/Calendar';
import { HaikuDisplay } from './components/HaikuDisplay';
import { AuthButton } from './components/AuthButton';
import { LoadingState } from './components/LoadingState';
import { useHaikus } from './hooks/useHaikus';

function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { haikus, favorites, loading, error } = useHaikus();

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const currentHaiku = haikus[selectedDateStr];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Haikus</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&q=80&w=2000&blur=100')`
      }}
    >
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-start mb-12">
          <div className="flex-1">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Scroll className="w-8 h-8 text-purple-600" />
              <h1 className="text-4xl font-bold text-gray-800">Haiku of the Day</h1>
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto text-center">
              Experience the day's top news transformed into beautiful haikus. 
              Each day brings a new perspective through the lens of traditional Japanese poetry.
            </p>
          </div>
          <div className="ml-4">
            <AuthButton />
          </div>
        </header>

        {loading ? (
          <LoadingState />
        ) : (
          <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
            <div className="w-full md:w-auto">
              <Calendar 
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
                haikus={Object.keys(haikus)}
              />
            </div>

            <div className="flex-1 flex justify-center">
              {currentHaiku ? (
                <HaikuDisplay 
                  haiku={currentHaiku}
                  isFavorited={favorites.has(currentHaiku.id)}
                  onToggleFavorite={() => {
                    // The actual toggle is handled in the FavoriteButton component
                  }}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
                  <p className="text-gray-600">No haiku available for this date.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App