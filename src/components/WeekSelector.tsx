import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DataFile } from '../types';

interface WeekSelectorProps {
    data: DataFile;
    selectedWeek: number;
    setSelectedWeek: (week: number) => void;
}

export const WeekSelector: React.FC<WeekSelectorProps> = ({ data, selectedWeek, setSelectedWeek }) => {
    const currentWeekData = data.weeks[selectedWeek];

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold text-gray-700">Апта тандоо:</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
                        disabled={selectedWeek === 0}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-6 py-2 bg-indigo-100 rounded-lg">
                        <span className="font-bold text-indigo-800">Апта {currentWeekData.weekNumber}</span>
                        <span className="text-sm text-gray-600 ml-2">({currentWeekData.date})</span>
                    </div>
                    <button
                        onClick={() => setSelectedWeek(Math.min(data.weeks.length - 1, selectedWeek + 1))}
                        disabled={selectedWeek === data.weeks.length - 1}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

