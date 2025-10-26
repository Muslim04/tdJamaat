import React from 'react';
import { weights } from '../utils/scoring';

interface FormulaDisplayProps {
    showFormula: boolean;
}

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({ showFormula }) => {
    if (!showFormula) return null;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-green-500">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Упай эсептөө формуласы</h3>
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-700 mb-2">1. Ар бир көрсөткүч үчүн ишке ашыруу пайызы:</p>
                    <code className="block bg-gray-800 text-green-400 p-3 rounded">
                        Ишке ашыруу % = (Факт / Максат) × 100
                    </code>
                    <p className="text-sm text-gray-600 mt-2">Эскертүү: Чектөө жок - максаттан канча гана ашса да эсептелет</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-700 mb-2">2. Ар бир көрсөткүч үчүн упай:</p>
                    <code className="block bg-gray-800 text-green-400 p-3 rounded">
                        Көрсөткүч упайы = (Ишке ашыруу % / 100) × Салмак
                    </code>
                    <p className="text-sm text-gray-600 mt-2">Бул жогорку максаты барлар үчүн адилеттүүлүктү камсыз кылат</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-700 mb-2">3. Салмактар (Weights):</p>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                        {Object.entries(weights).map(([key, value]) => (
                            <div key={key} className="bg-white p-2 rounded border">
                                <span className="font-semibold">{key}:</span> {value}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-700 mb-2">4. Жалпы мүчө упайы:</p>
                    <code className="block bg-gray-800 text-green-400 p-3 rounded">
                        Жалпы упай = Σ (Бардык көрсөткүчтөрдүн упайы)
                    </code>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-400">
                    <p className="font-semibold text-yellow-900 mb-2">⚠️ МААНИЛҮҮ: Командалардын рейтинги</p>
                    <div className="text-sm space-y-2">
                        <p className="text-yellow-800">Командалардын ортосундагы рейтинг <strong>ОРТОЧО УПАЙГА</strong> негизделген (жалпы упайга эмес).</p>
                        <p className="text-yellow-800">Себеби: Кээ бир командаларда аз адам бар, ошондуктан адилеттүүлүк үчүн орточо упай колдонулат.</p>
                        <code className="block bg-gray-800 text-green-400 p-2 rounded mt-2">
                            Команда рейтинги = Орточо упай (Жалпы упай / Мүчөлөрдүн саны)
                        </code>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                    <p className="font-semibold text-blue-900 mb-2">Мисал:</p>
                    <div className="text-sm space-y-1">
                        <p><strong>Жетекчи:</strong> К-К Максат=20, Факт=15 → 15/20=75% → 0.75 × 5.0 = <strong>3.75 упай</strong></p>
                        <p><strong>Мүчө:</strong> К-К Максат=7, Факт=7 → 7/7=100% → 1.0 × 5.0 = <strong>5 упай</strong></p>
                        <p className="text-blue-700 mt-2">Экөө тең өз максаттарына жете албады/жетти, бирок упайлар максатка жараша адилеттүү</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

