
import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle, Plus, Trash2, X } from 'lucide-react';
import type { DataFile, Team, MetricValues, MiniCard } from '../types';
import { addRecord, updateRecord } from '../services/dataService';
import { calculateMemberScore } from '../utils/scoring';

interface DataEntryFormProps {
    data: DataFile | null;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: { team: Team, weekNumber: number } | null;
}

const DEFAULT_MINICARD: MiniCard = {
    'БГМДТ': { actual: 0, target: 7 },
    'КПТ': { actual: 0, target: 7 },
    'И-Н.2': { actual: 0, target: 7 },
    'КИТЕП': { actual: 0, target: 5 },
    'СПОРТ': { actual: 0, target: 1 },
    'ТСПХ': { actual: 0, target: 5 }
};

const DEFAULT_METRICS: MetricValues = {
    'К-К': 0, 'СВТ': 0, 'КТП': 0, 'ТХЖ': 0, 'ДТА': 0, 'ИСТГ': 0, 'НФ': 0, 'ТСП': 0
};

const DEFAULT_TARGETS: MetricValues = {
    'К-К': 20, 'СВТ': 2100, 'КТП': 70, 'ТХЖ': 2, 'ДТА': 1, 'ИСТГ': 700, 'НФ': 7, 'ТСП': 5
};

export const DataEntryForm: React.FC<DataEntryFormProps> = ({ data, onClose, onSuccess, initialData }) => {
    const isEditing = !!initialData;

    const [weekNumber, setWeekNumber] = useState<number>(() => {
        if (initialData) return initialData.weekNumber;
        // Default to next week if data exists
        if (data && data.weeks.length > 0) {
            return data.weeks[data.weeks.length - 1].weekNumber + 1;
        }
        return 1;
    });

    const [selectedTeamName, setSelectedTeamName] = useState<string>('');
    const [teamData, setTeamData] = useState<Team | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [copyPreviousWeek, setCopyPreviousWeek] = useState(!initialData);

    // Get unique team names from existing data
    const teamNames = React.useMemo(() => {
        if (!data || data.weeks.length === 0) return [];
        const names = new Set<string>();
        data.weeks.forEach(week => {
            week.teams.forEach(team => {
                names.add(team.name);
            });
        });
        return Array.from(names).sort();
    }, [data]);

    useEffect(() => {
        if (initialData) {
            setSelectedTeamName(initialData.team.name);
        } else if (teamNames.length > 0 && !selectedTeamName) {
            setSelectedTeamName(teamNames[0]);
        }
    }, [teamNames, selectedTeamName, initialData]);

    // Initialize or reset team data when selected team changes
    useEffect(() => {
        if (!selectedTeamName) return;

        if (initialData && initialData.team.name === selectedTeamName) {
            setTeamData(initialData.team);
            return;
        }

        let initialTeam: Team = {
            name: selectedTeamName,
            miniCard: { ...DEFAULT_MINICARD },
            members: []
        };

        if (copyPreviousWeek && data && data.weeks.length > 0) {
            // Find the most recent record for this team to copy from
            // Search backwards from latest week
            for (let i = data.weeks.length - 1; i >= 0; i--) {
                const week = data.weeks[i];
                const prevTeam = week.teams.find(t => t.name === selectedTeamName);
                if (prevTeam) {
                    initialTeam = {
                        ...initialTeam,
                        miniCard: { ...prevTeam.miniCard }, // Copy mini card
                        members: prevTeam.members.map(m => ({
                            ...m,
                            actual: { ...DEFAULT_METRICS }, // Reset actuals
                            target: { ...m.target } // Keep targets
                        }))
                    };
                    break;
                }
            }
        }

        setTeamData(initialTeam);
    }, [selectedTeamName, copyPreviousWeek, data, initialData]);

    const handleMiniCardChange = (key: keyof MiniCard, field: 'actual' | 'target', value: number) => {
        if (!teamData) return;
        setTeamData({
            ...teamData,
            miniCard: {
                ...teamData.miniCard,
                [key]: {
                    ...teamData.miniCard[key],
                    [field]: value
                }
            }
        });
    };

    const handleMemberChange = (index: number, field: 'name' | 'role', value: any) => {
        if (!teamData) return;
        const newMembers = [...teamData.members];
        newMembers[index] = { ...newMembers[index], [field]: value };
        setTeamData({ ...teamData, members: newMembers });
    };

    const handleMetricChange = (memberIndex: number, metric: keyof MetricValues, field: 'actual' | 'target', value: number) => {
        if (!teamData) return;
        const newMembers = [...teamData.members];
        const member = newMembers[memberIndex];

        newMembers[memberIndex] = {
            ...member,
            [field]: {
                ...member[field],
                [metric]: value
            }
        };
        setTeamData({ ...teamData, members: newMembers });
    };

    const addMember = () => {
        if (!teamData) return;
        setTeamData({
            ...teamData,
            members: [
                ...teamData.members,
                {
                    name: '',
                    role: 'member',
                    actual: { ...DEFAULT_METRICS },
                    target: { ...DEFAULT_TARGETS }
                }
            ]
        });
    };

    const removeMember = (index: number) => {
        if (!teamData) return;
        const newMembers = [...teamData.members];
        newMembers.splice(index, 1);
        setTeamData({ ...teamData, members: newMembers });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamData) return;

        // Validate
        if (!teamData.name) {
            setError('Команданын аты тандалган жок');
            return;
        }
        if (teamData.members.length === 0) {
            setError('Командада жок дегенде бир мүчө болушу керек');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (isEditing && teamData.id) {
                await updateRecord(teamData.id, teamData);
            } else {
                await addRecord(weekNumber, teamData, new Date().toISOString().split('T')[0]); // Use today's date
            }
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Сактоо учурунда ката кетти');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Ийгиликтүү сакталды!</h2>
                    <p className="text-gray-600">Жаңы маалымат кошулду.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-indigo-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-6 overflow-y-auto transition-all duration-300">
            <style>{`
                @keyframes popIn {
                    0% { transform: scale(0.95) translateY(10px); opacity: 0; }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                }
                .animate-pop-in {
                    animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-pop-in border border-white/20">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        {isEditing ? 'Маалыматты өзгөртүү' : 'Жаңы маалымат кошуу'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Week and Team Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Апта (Week Number)</label>
                            <input
                                type="number"
                                value={weekNumber}
                                onChange={(e) => setWeekNumber(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                disabled={isEditing}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Команда</label>
                            <select
                                value={selectedTeamName}
                                onChange={(e) => setSelectedTeamName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                disabled={isEditing}
                            >
                                {teamNames.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                                {!teamNames.includes(selectedTeamName) && selectedTeamName && <option value={selectedTeamName}>{selectedTeamName}</option>}
                            </select>
                        </div>
                    </div>

                    {!isEditing && (
                        <div className="mb-6 flex items-center">
                            <input
                                type="checkbox"
                                checked={copyPreviousWeek}
                                onChange={(e) => setCopyPreviousWeek(e.target.checked)}
                                id="copyPrev"
                                className="mr-2"
                            />
                            <label htmlFor="copyPrev" className="text-sm text-gray-600">Мурунку аптадагы маалыматтарды көчүрүү (мүчөлөр жана пландар)</label>
                        </div>
                    )}

                    {teamData && (
                        <form onSubmit={handleSubmit}>
                            {/* Mini Card Section */}
                            <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Мини Карта (Командалык)</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {(Object.keys(DEFAULT_MINICARD) as Array<keyof MiniCard>).map(key => (
                                        <div key={key} className="bg-white p-3 rounded shadow-sm border">
                                            <div className="text-center font-bold text-gray-700 mb-2">{key}</div>
                                            <div className="flex flex-col gap-2">
                                                <div>
                                                    <label className="text-xs text-gray-500 block">Факт</label>
                                                    <input
                                                        type="number"
                                                        value={teamData.miniCard[key].actual}
                                                        onChange={(e) => handleMiniCardChange(key, 'actual', parseInt(e.target.value) || 0)}
                                                        className="w-full text-center border rounded p-1"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block">План</label>
                                                    <input
                                                        type="number"
                                                        value={teamData.miniCard[key].target}
                                                        onChange={(e) => handleMiniCardChange(key, 'target', parseInt(e.target.value) || 0)}
                                                        className="w-full text-center border rounded p-1 bg-gray-50"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Members Section */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-800">Мүчөлөр</h3>
                                    <button
                                        type="button"
                                        onClick={addMember}
                                        className="flex items-center gap-1 text-sm bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200 font-medium"
                                    >
                                        <Plus className="w-4 h-4" /> Кошуу
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {teamData.members.map((member, idx) => (
                                        <div key={idx} className="bg-white border rounded-lg p-4 shadow-sm relative group">
                                            <button
                                                type="button"
                                                onClick={() => removeMember(idx)}
                                                className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Өчүрүү"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Аты-жөнү</label>
                                                    <input
                                                        type="text"
                                                        value={member.name}
                                                        onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                                                        className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                                        placeholder="Аты"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Ролу</label>
                                                    <select
                                                        value={member.role}
                                                        onChange={(e) => handleMemberChange(idx, 'role', e.target.value)}
                                                        className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                                    >
                                                        <option value="member">Мүчө</option>
                                                        <option value="assistant">Орун басар</option>
                                                        <option value="leader">Жетекчи</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-medium text-gray-500 mb-1">Орточо упай</div>
                                                    <div className="font-bold text-lg text-indigo-600">
                                                        {calculateMemberScore(member).toFixed(1)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Metrics Grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                                                {(Object.keys(DEFAULT_METRICS) as Array<keyof MetricValues>).map(metric => (
                                                    <div key={metric} className="text-center">
                                                        <div className="text-xs font-bold text-gray-600 mb-1">{metric}</div>
                                                        <input
                                                            type="number"
                                                            value={member.actual[metric]}
                                                            onChange={(e) => handleMetricChange(idx, metric, 'actual', parseInt(e.target.value) || 0)}
                                                            className="w-full text-center border rounded p-1 mb-1 text-sm font-semibold"
                                                            placeholder="Факт"
                                                            title="Факт"
                                                        />
                                                        <input
                                                            type="number"
                                                            value={member.target[metric]}
                                                            onChange={(e) => handleMetricChange(idx, metric, 'target', parseInt(e.target.value) || 0)}
                                                            className="w-full text-center border rounded p-1 bg-gray-50 text-xs text-gray-500"
                                                            placeholder="План"
                                                            title="План"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white z-10 p-4 -mx-6 -mb-6 rounded-b-lg">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Жабуу
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Сакталууда...' : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Сактоо
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};


