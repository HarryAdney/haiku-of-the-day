import React from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  haikus: string[];
}

export function Calendar({ selectedDate, onSelect, haikus }: CalendarProps) {
  const modifiers = {
    hasHaiku: haikus,
  };

  const modifiersStyles = {
    hasHaiku: {
      backgroundColor: '#f3e8ff',
      color: '#6b21a8',
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-800">Browse Past Haikus</h2>
      </div>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onSelect(date)}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        className="rdp-custom"
      />
    </div>
  );
}