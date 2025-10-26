import React from 'react';
import { Award, Info, User } from 'lucide-react';

interface HeaderProps {
    showFormula: boolean;
    setShowFormula: (show: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ showFormula, setShowFormula }) => {
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
            </div>
        </div>
    );
};

