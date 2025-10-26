import React from 'react';
import { Users, TrendingUp, Calendar, Award } from 'lucide-react';

type ActiveView = 'overview' | 'teams' | 'progress' | 'fourweekreport';

interface ViewNavigatorProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
}

export const ViewNavigator: React.FC<ViewNavigatorProps> = ({ activeView, setActiveView }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveView('overview')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${activeView === 'overview'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <Users className="w-5 h-5 inline mr-2" />
                    Жалпы көрүнүш
                </button>
                <button
                    onClick={() => setActiveView('teams')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${activeView === 'teams'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <TrendingUp className="w-5 h-5 inline mr-2" />
                    Команда ичиндеги рейтинг
                </button>
                <button
                    onClick={() => setActiveView('progress')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${activeView === 'progress'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Апталык прогресс
                </button>
                <button
                    onClick={() => setActiveView('fourweekreport')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${activeView === 'fourweekreport'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <Award className="w-5 h-5 inline mr-2" />
                    4-Апталык отчёт
                </button>
            </div>
        </div>
    );
};

