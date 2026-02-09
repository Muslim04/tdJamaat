
import React, { useState } from 'react';
import { Lock, LogIn, X } from 'lucide-react';

interface AdminLoginProps {
    onLogin: () => void;
    onClose: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onClose }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple password check using environment variable
        // Note: For production, consider using a proper authentication service like Supabase Auth
        if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
            onLogin();
        } else {
            setError('Туура эмес сыр сөз');
        }
    };

    return (
        <div className="fixed inset-0 bg-indigo-900/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
            <style>{`
                @keyframes popIn {
                    0% { transform: scale(0.95) translateY(10px); opacity: 0; }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                }
                .animate-pop-in {
                    animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative animate-pop-in border border-white/20">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center mb-8">
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-4 rounded-full mb-4 shadow-inner">
                        <Lock className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Админ кирүү
                    </h2>
                    <p className="text-gray-500 text-center mt-2 text-sm">
                        Жаңы маалыматтарды киргизүү үчүн сыр сөздү жазыңыз
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white"
                            placeholder="Сыр сөз"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-sm mt-2 ml-1 flex items-center gap-1 animate-pulse">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {error}
                        </p>}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        <LogIn className="w-5 h-5" />
                        Кирүү
                    </button>
                </form>
            </div>
        </div>
    );
};
