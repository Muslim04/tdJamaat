import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DataFile } from '../types';

interface FourWeekPeriodSelectorProps {
    data: DataFile;
    selectedPeriod: number;
    setSelectedPeriod: (period: number) => void;
}

export const FourWeekPeriodSelector: React.FC<FourWeekPeriodSelectorProps> = ({ 
    data, 
    selectedPeriod, 
    setSelectedPeriod 
}) => {
    // Calculate all available 4-week periods
    const totalWeeks = data.weeks.length;
    const totalPeriods = Math.ceil(totalWeeks / 4);
    
    // Calculate the current period's week range
    const startWeekIndex = selectedPeriod * 4;
    const endWeekIndex = Math.min(startWeekIndex + 4, totalWeeks);
    const weeksForPeriod = data.weeks.slice(startWeekIndex, endWeekIndex);
    
    const actualStartWeek = weeksForPeriod[0]?.weekNumber || 1;
    const actualEndWeek = weeksForPeriod[weeksForPeriod.length - 1]?.weekNumber || 4;
    const startDate = weeksForPeriod[0]?.date?.split(' -- ')[0] || '';
    const endDate = weeksForPeriod[weeksForPeriod.length - 1]?.date?.split(' -- ')[1]?.trim() || '';

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold text-gray-700">4-Апталык мезгил тандоо:</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        Мезгил {selectedPeriod + 1} / {totalPeriods}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedPeriod(Math.max(0, selectedPeriod - 1))}
                            disabled={selectedPeriod === 0}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="px-6 py-2 bg-indigo-100 rounded-lg">
                            <span className="font-bold text-indigo-800">
                                Апта {actualStartWeek} - {actualEndWeek}
                            </span>
                            {(startDate || endDate) && (
                                <span className="text-sm text-gray-600 ml-2">
                                    ({startDate} - {endDate})
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setSelectedPeriod(Math.min(totalPeriods - 1, selectedPeriod + 1))}
                            disabled={selectedPeriod === totalPeriods - 1}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

