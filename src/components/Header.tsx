import React from 'react';
import { Award, Info, User, Settings } from 'lucide-react';

interface HeaderProps {
    showFormula: boolean;
    setShowFormula: (show: boolean) => void;
    onAdminClick: () => void;
    isAuthenticated: boolean;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ showFormula, setShowFormula, onAdminClick, isAuthenticated, onLogout }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <Award className="w-10 h-10 text-indigo-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Командалар боюнча рейтинг системасы</h1>
                        <p className="text-gray-600">Жааматтын ишмердүүлүгүн талдоо</p>
                    </div>
                </div>
                <button
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    <User className="w-5 h-5" />
                    <a href="https://addua.vercel.app/" target="_blank">Санарип тасбихат</a>
                </button>
                <button
                    onClick={() => setShowFormula(!showFormula)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Info className="w-5 h-5" />
                    Формула
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={onAdminClick}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                        {isAuthenticated ? 'Маалымат кошуу' : 'Админ'}
                    </button>
                    {isAuthenticated && (
                        <button
                            onClick={onLogout}
                            className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                        >
                            Чыгуу
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

