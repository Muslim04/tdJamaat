// TeamPerformanceTracker.tsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { Users, Award, TrendingUp, Info, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

// Types
interface MetricValues {
    'К-К': number;
    'СВТ': number;
    'КТП': number;
    'ТХЖ': number;
    'ДТА': number;
    'ИСТГ': number;
    'НФ': number;
    'ТСП': number;
}

interface MiniCardActivity {
    actual: number;
    target: number;
}

interface MiniCard {
    'БГМДТ': MiniCardActivity;
    'КПТ': MiniCardActivity;
    'И-Н.2': MiniCardActivity;
    'КИТЕП': MiniCardActivity;
    'СПОРТ': MiniCardActivity;
    'ТСПХ': MiniCardActivity;
}

interface TeamMember {
    name: string;
    role: 'leader' | 'assistant' | 'member';
    actual: MetricValues;
    target: MetricValues;
}

interface Team {
    name: string;
    miniCard: MiniCard;
    members: TeamMember[];
}

interface WeekData {
    weekNumber: number;
    date: string;
    teams: Team[];
}

interface DataFile {
    weeks: WeekData[];
}

const TeamPerformanceTracker: React.FC = () => {
    const [data, setData] = useState<DataFile | null>(null);
    const [activeTeam, setActiveTeam] = useState<number>(0);
    const [activeView, setActiveView] = useState<'overview' | 'teams' | 'progress'>('overview');
    const [selectedWeek, setSelectedWeek] = useState<number>(0);
    const [showFormula, setShowFormula] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Scoring weights
    const weights: MetricValues = {
        'К-К': 2.0,
        'СВТ': 0.015,
        'КТП': 1.5,
        'ТХЖ': 15,
        'ДТА': 10,
        'ИСТГ': 0.08,
        'НФ': 2.5,
        'ТСП': 4
    };

    // Load data from JSON file
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/teams_data.json');
                if (!response.ok) {
                    throw new Error('Failed to fetch teams data');
                }
                const jsonData: DataFile = await response.json();

                setData(jsonData);
                setSelectedWeek(jsonData.weeks.length - 1);
                setError(null);
            } catch (err) {
                setError('Маалыматтарды жүктөөдө ката кетти. team_data.json файлын текшериңиз.');
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const calculatePerformancePercentage = (actual: number, target: number): number => {
        if (target === 0) return 0;
        return (actual / target) * 100;
    };

    const calculateMemberScore = (member: TeamMember): number => {
        let totalScore = 0;
        const metrics = Object.keys(weights) as Array<keyof MetricValues>;

        metrics.forEach(metric => {
            const actual = member.actual[metric] || 0;
            const target = member.target[metric] || 1;
            const performancePercentage = calculatePerformancePercentage(actual, target);
            const metricScore = (performancePercentage / 100) * weights[metric] * target;
            totalScore += metricScore;
        });

        return Math.round(totalScore * 10) / 10;
    };

    const calculateTeamScore = (team: Team): number => {
        const memberScores = team.members.reduce((sum, member) => sum + calculateMemberScore(member), 0);

        const miniCardScore = Object.keys(team.miniCard).reduce((sum, key) => {
            const activity = team.miniCard[key as keyof MiniCard];
            return sum + calculatePerformancePercentage(activity.actual, activity.target);
        }, 0);

        return Math.round((memberScores + miniCardScore * 0.5) * 10) / 10;
    };

    const getTeamMemberRankings = (team: Team) => {
        const membersWithScores = team.members.map((member, idx) => ({
            ...member,
            index: idx,
            score: calculateMemberScore(member),
            performancePercentages: Object.keys(weights).reduce((acc, metric) => {
                const m = metric as keyof MetricValues;
                acc[m] = calculatePerformancePercentage(member.actual[m], member.target[m]);
                return acc;
            }, {} as MetricValues)
        }));

        return membersWithScores.sort((a, b) => b.score - a.score).map((member, rank) => ({
            ...member,
            rank: rank + 1
        }));
    };

    const getOverallTeamRankings = (teams: Team[]) => {
        return teams.map((team, idx) => {
            const totalScore = calculateTeamScore(team);
            const avgMemberScore = Math.round(team.members.reduce((sum, m) => sum + calculateMemberScore(m), 0) / team.members.length * 10) / 10;
            return {
                name: team.name,
                index: idx,
                totalScore: totalScore,
                avgMemberScore: avgMemberScore,
                memberCount: team.members.length
            };
        }).sort((a, b) => b.avgMemberScore - a.avgMemberScore).map((team, rank) => ({
            ...team,
            rank: rank + 1
        }));
    };

    const getProgressData = (): { [key: string]: any[] } => {
        if (!data) return {};

        const progressByTeam: { [key: string]: any[] } = {};

        data.weeks.forEach((weekData) => {
            const rankings = getOverallTeamRankings(weekData.teams);

            rankings.forEach((teamRank) => {
                if (!progressByTeam[teamRank.name]) {
                    progressByTeam[teamRank.name] = [];
                }

                progressByTeam[teamRank.name].push({
                    week: `Апта ${weekData.weekNumber}`,
                    weekNumber: weekData.weekNumber,
                    score: teamRank.avgMemberScore,
                    rank: teamRank.rank,
                    date: weekData.date
                });
            });
        });

        return progressByTeam;
    };

    const COLORS = {
        leader: '#DC2626',
        assistant: '#EA580C',
        member: '#4F46E5'
    };

    const TEAM_COLORS = ['#4F46E5', '#059669', '#DC2626', '#D97706', '#7C3AED', '#0891B2'];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-2xl font-bold text-indigo-600">Жүктөлүүдө...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Ката</h2>
                    <p className="text-gray-700">{error}</p>
                </div>
            </div>
        );
    }

    const currentWeekData = data.weeks[selectedWeek];
    const teamRankings = getOverallTeamRankings(currentWeekData.teams);
    const currentTeamRankings = getTeamMemberRankings(currentWeekData.teams[activeTeam]);
    const progressData = getProgressData();

    const teamChartData = teamRankings.map(team => ({
        name: team.name,
        avgScore: team.avgMemberScore,
        totalScore: team.totalScore
    }));

    const memberChartData = currentTeamRankings.map(member => ({
        name: member.name,
        score: member.score,
        role: member.role === 'leader' ? 'Жетекчи' : member.role === 'assistant' ? 'Орун басар' : 'Мүчө'
    }));

    const lineChartData: any[] = [];
    const allWeeks = data.weeks.map(w => w.weekNumber).sort((a, b) => a - b);

    allWeeks.forEach(weekNum => {
        const dataPoint: any = { week: `Апта ${weekNum}` };
        Object.keys(progressData).forEach(teamName => {
            const weekData = progressData[teamName].find(w => w.weekNumber === weekNum);
            dataPoint[teamName] = weekData ? weekData.score : null;
        });
        lineChartData.push(dataPoint);
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
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
                            onClick={() => setShowFormula(!showFormula)}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Info className="w-5 h-5" />
                            Формула
                        </button>
                    </div>
                </div>

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

                {/* Formula Display */}
                {showFormula && (
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
                                    Көрсөткүч упайы = (Ишке ашыруу % / 100) × Салмак × Максат
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
                                    <p><strong>Жетекчи:</strong> К-К Максат=20, Факт=15 → 15/20=75% → 0.75 × 2.0 × 20 = <strong>30 упай</strong></p>
                                    <p><strong>Мүчө:</strong> К-К Максат=7, Факт=7 → 7/7=100% → 1.0 × 2.0 × 7 = <strong>14 упай</strong></p>
                                    <p className="text-blue-700 mt-2">Экөө тең өз максаттарына жете албады/жетти, бирок упайлар максатка жараша адилеттүү</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                    </div>
                </div>

                {activeView === 'overview' ? (
                    <>
                        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-2">
                                <Info className="w-5 h-5 text-yellow-700 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-semibold mb-1">Рейтинг орточо упайга негизделген</p>
                                    <p>Командалардын саны ар башка болгондуктан, адилеттүүлүк үчүн рейтинг орточо упайга негизделген (жалпы упайга эмес). Орточо упай = Жалпы упай ÷ Мүчөлөрдүн саны</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Командалардын жалпы рейтинги</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-indigo-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Рейтинг</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Команда</th>
                                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Мүчөлөр</th>
                                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Орточо упай ⭐</th>
                                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Жалпы упай</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {teamRankings.map((team) => (
                                            <tr key={team.index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${team.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                                                        team.rank === 2 ? 'bg-gray-300 text-gray-800' :
                                                            team.rank === 3 ? 'bg-orange-400 text-orange-900' :
                                                                'bg-indigo-100 text-indigo-800'
                                                        }`}>
                                                        {team.rank}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{team.name}</td>
                                                <td className="px-6 py-4 text-center text-gray-600">{team.memberCount}</td>
                                                <td className="px-6 py-4 text-right font-bold text-indigo-600 text-lg">{team.avgMemberScore}</td>
                                                <td className="px-6 py-4 text-right text-gray-500">{team.totalScore}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Командалардын көрсөткүчтөрү</h2>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={teamChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="avgScore" fill="#4F46E5" name="Орточо упай (Рейтинг)" />
                                    <Bar dataKey="totalScore" fill="#CBD5E1" name="Жалпы упай" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                ) : activeView === 'teams' ? (
                    <>
                        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
                            <div className="flex gap-2 flex-wrap">
                                {currentWeekData.teams.map((team, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveTeam(idx)}
                                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeTeam === idx
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {team.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                {currentWeekData.teams[activeTeam].name} - Мүчөлөрдүн рейтинги
                            </h2>
                            <div className="mb-4 flex gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                                    <span>Жетекчи</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-orange-600 rounded"></div>
                                    <span>Орун басар</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                                    <span>Мүчө</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-indigo-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-700">№</th>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Аты</th>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Ролу</th>
                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">К-К %</th>
                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">СВТ %</th>
                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">КТП %</th>
                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">ТХЖ %</th>
                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">ДТА %</th>
                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">ИСТГ %</th>
                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">НФ %</th>
                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">ТСП %</th>
                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">Упай</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentTeamRankings.map((member) => (
                                            <tr key={member.index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-3 py-3">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm ${member.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                                                        member.rank === 2 ? 'bg-gray-300 text-gray-800' :
                                                            member.rank === 3 ? 'bg-orange-400 text-orange-900' :
                                                                'bg-indigo-100 text-indigo-800'
                                                        }`}>
                                                        {member.rank}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 font-medium text-gray-900">{member.name}</td>
                                                <td className="px-3 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${member.role === 'leader' ? 'bg-red-100 text-red-800' :
                                                        member.role === 'assistant' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-indigo-100 text-indigo-800'
                                                        }`}>
                                                        {member.role === 'leader' ? 'Жетекчи' : member.role === 'assistant' ? 'Орун басар' : 'Мүчө'}
                                                    </span>
                                                </td>
                                                {(Object.keys(weights) as Array<keyof MetricValues>).map(metric => {
                                                    const perf = member.performancePercentages[metric];
                                                    return (
                                                        <td key={metric} className="px-3 py-3 text-right">
                                                            <span className={`font-semibold ${perf >= 100 ? 'text-green-600' :
                                                                perf >= 75 ? 'text-blue-600' :
                                                                    perf >= 50 ? 'text-orange-600' :
                                                                        'text-red-600'
                                                                }`}>
                                                                {perf.toFixed(0)}%
                                                            </span>
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-3 py-3 text-right font-bold text-indigo-600">{member.score}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Мүчөлөрдүн көрсөткүчтөрү</h2>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={memberChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="score" name="Упай">
                                        {memberChartData.map((_, index) => {
                                            const member = currentTeamRankings[index];
                                            return <Cell key={`cell-${index}`} fill={COLORS[member.role]} />;
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Командалардын апталык прогресси</h2>
                            <p className="text-sm text-gray-600 mb-4">График орточо упайга негизделген (адилеттүү салыштыруу үчүн)</p>
                            <ResponsiveContainer width="100%" height={500}>
                                <LineChart data={lineChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week" />
                                    <YAxis label={{ value: 'Орточо упай', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
                                    <Legend />
                                    {currentWeekData.teams.map((team, idx) => (
                                        <Line
                                            key={team.name}
                                            type="monotone"
                                            dataKey={team.name}
                                            stroke={TEAM_COLORS[idx]}
                                            strokeWidth={3}
                                            name={team.name}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Апталар боюнча статистика</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentWeekData.teams.map((team, idx) => {
                                    const teamProgress = progressData[team.name] || [];
                                    const currentScore = teamProgress[teamProgress.length - 1]?.score || 0;
                                    const previousScore = teamProgress[teamProgress.length - 2]?.score || 0;
                                    const change = currentScore - previousScore;

                                    return (
                                        <div key={team.name} className="bg-gray-50 p-4 rounded-lg border-2" style={{ borderColor: TEAM_COLORS[idx] }}>
                                            <h3 className="font-bold text-lg mb-2" style={{ color: TEAM_COLORS[idx] }}>{team.name}</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Азыркы орточо:</span>
                                                    <span className="font-semibold">{currentScore.toFixed(1)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Өзгөрүү:</span>
                                                    <span className={`font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {change >= 0 ? '+' : ''}{change.toFixed(1)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Апталар :</span>
                                                    <span className="font-semibold">{teamProgress.length}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TeamPerformanceTracker;