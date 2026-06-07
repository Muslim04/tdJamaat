// TeamPerformanceTracker.tsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { Users, Award, TrendingUp, Info, Settings, Star } from 'lucide-react';

// Import types
import type { DataFile, Team } from './types';

// Import utilities
import { calculateMemberScore, COLORS, TEAM_COLORS, weights } from './utils/scoring';
import type { MetricValues } from './types';
import { getTeamMemberRankings, getOverallTeamRankings, getProgressData } from './utils/rankings';

// Import services
import { fetchRecords } from './services/dataService';

// Import components
import { Header } from './components/Header';
import { WeekSelector } from './components/WeekSelector';
import { FormulaDisplay } from './components/FormulaDisplay';
import { ViewNavigator } from './components/ViewNavigator';
import { FourWeekPeriodSelector } from './components/FourWeekPeriodSelector';
import { AdminLogin } from './components/AdminLogin';
import { DataEntryForm } from './components/DataEntryForm';


const TeamPerformanceTracker: React.FC = () => {
    const [data, setData] = useState<DataFile | null>(null);
    const [activeTeam, setActiveTeam] = useState<number>(0);
    const [activeView, setActiveView] = useState<'overview' | 'teams' | 'progress' | 'fourweekreport' | 'totalratings'>('overview');
    const [selectedWeek, setSelectedWeek] = useState<number>(0);
    const [selectedPeriod, setSelectedPeriod] = useState<number>(0);
    const [showFormula, setShowFormula] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // Load data from Supabase
    const [roleFilter, setRoleFilter] = useState<'all' | 'leader' | 'assistant' | 'member'>('all');

    // Admin states
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showDataEntry, setShowDataEntry] = useState(false);
    const [editingTeam, setEditingTeam] = useState<{ team: Team, weekNumber: number } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const jsonData = await fetchRecords();

                setData(jsonData);
                if (jsonData && jsonData.weeks.length > 0) {
                    setSelectedWeek(jsonData.weeks.length - 1);
                    // Set to the most recent period (last complete 4-week period)
                    const totalWeeks = jsonData.weeks.length;
                    const totalPeriods = Math.ceil(totalWeeks / 4);
                    setSelectedPeriod(Math.max(0, totalPeriods - 1));
                }
                setError(null);
            } catch (err) {
                setError('Маалыматтарды жүктөөдө ката кетти. Сураныч, интернет байланышын текшериңиз же кийинчерээк кайра аракет кылыңыз.');
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-2xl font-bold text-indigo-600">Жүктөлүүдө...</div>
            </div>
        );
    }

    if (error || !data || data.weeks.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{error ? 'Ката' : 'Маалымат жок'}</h2>
                    <p className="text-gray-700">{error || 'Учурда маалымат базасы бош. Жаңы маалыматтарды киргизиңиз.'}</p>
                </div>
            </div>
        );
    }

    const currentWeekData = data.weeks[selectedWeek];
    const teamRankings = getOverallTeamRankings(currentWeekData.teams);
    const currentTeamRankings = getTeamMemberRankings(currentWeekData.teams[activeTeam]);
    const progressData = getProgressData(data);
    // Combine all members across all teams
    const allIndividuals = currentWeekData.teams.flatMap(team =>
        team.members.map(member => ({
            ...member,
            team: team.name,
            score: calculateMemberScore(member)
        }))
    );

    // Sort by score descending
    const sortedIndividuals = allIndividuals.sort((a, b) => b.score - a.score);

    // Filter based on selected role
    const filteredIndividuals = roleFilter === 'all'
        ? sortedIndividuals
        : sortedIndividuals.filter(m => m.role === roleFilter);

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
                <Header
                    showFormula={showFormula}
                    setShowFormula={setShowFormula}
                    onAdminClick={() => {
                        if (isAuthenticated) {
                            setShowDataEntry(true);
                        } else {
                            setShowAdminLogin(true);
                        }
                    }}
                    isAuthenticated={isAuthenticated}
                    onLogout={() => {
                        setIsAuthenticated(false);
                        setShowDataEntry(false);
                        setEditingTeam(null);
                    }}
                />
                {activeView === 'fourweekreport' ? (
                    <FourWeekPeriodSelector
                        data={data}
                        selectedPeriod={selectedPeriod}
                        setSelectedPeriod={setSelectedPeriod}
                    />
                ) : (
                    <WeekSelector data={data} selectedWeek={selectedWeek} setSelectedWeek={setSelectedWeek} />
                )}
                <FormulaDisplay showFormula={showFormula} />
                <FormulaDisplay showFormula={showFormula} />



                <ViewNavigator activeView={activeView} setActiveView={setActiveView} />

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
                            {/* New Section: Individual Rankings Across All Teams */}
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Бардык катышуучулардын рейтинги</h2>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(['all', 'leader', 'assistant', 'member'] as const).map(roleType => (
                                        <button
                                            key={roleType}
                                            onClick={() => setRoleFilter(roleType)}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${roleFilter === roleType
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {roleType === 'all' ? 'Бардыгы' :
                                                roleType === 'leader' ? 'Жетекчилер' :
                                                    roleType === 'assistant' ? 'Орун басарлар' : 'Мүчөлөр'}
                                        </button>
                                    ))}
                                </div>

                                <div className="overflow-x-auto mb-6">
                                    <table className="w-full text-sm">
                                        <thead className="bg-indigo-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-semibold text-gray-700">№</th>
                                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Аты</th>
                                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Команда</th>
                                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Ролу</th>
                                                <th className="px-3 py-2 text-right font-semibold text-gray-700">Упай ⭐</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredIndividuals.map((member, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-3 py-2">
                                                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm ${idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                                                            idx === 1 ? 'bg-gray-300 text-gray-800' :
                                                                idx === 2 ? 'bg-orange-400 text-orange-900' :
                                                                    'bg-indigo-100 text-indigo-800'
                                                            }`}>
                                                            {idx + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 font-medium text-gray-900">{member.name}</td>
                                                    <td className="px-3 py-2 text-gray-700">{member.team}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${member.role === 'leader' ? 'bg-red-100 text-red-800' :
                                                            member.role === 'assistant' ? 'bg-orange-100 text-orange-800' :
                                                                'bg-indigo-100 text-indigo-800'
                                                            }`}>
                                                            {member.role === 'leader' ? 'Жетекчи' :
                                                                member.role === 'assistant' ? 'Орун басар' : 'Мүчө'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-bold text-indigo-600">{member.score}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={filteredIndividuals.slice(0, 15)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="score" name="Упай">
                                            {filteredIndividuals.slice(0, 15).map((member, index) => (
                                                <Cell key={index} fill={COLORS[member.role]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
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
                            {/* MiniCard section for team activity summary */}
                            <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200 relative">
                                {isAuthenticated && (
                                    <button
                                        onClick={() => {
                                            setEditingTeam({
                                                team: currentWeekData.teams[activeTeam],
                                                weekNumber: currentWeekData.weekNumber
                                            });
                                            setShowDataEntry(true);
                                        }}
                                        className="absolute top-4 right-4 flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200 font-medium text-sm"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Өзгөртүү
                                    </button>
                                )}
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Команданын активдүүлүк көрсөткүчтөрү</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {Object.entries(currentWeekData.teams[activeTeam].miniCard).map(([key, value]) => {
                                        const percent = value.target > 0 ? (value.actual / value.target) * 100 : 0;
                                        return (
                                            <div
                                                key={key}
                                                className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border border-indigo-100"
                                            >
                                                <span className="font-semibold text-gray-700 mb-1">{key}</span>
                                                <div className="text-center">
                                                    <p className="text-lg font-bold text-indigo-600">
                                                        {value.actual}/{value.target}
                                                    </p>
                                                    <p
                                                        className={`text-sm font-semibold mt-1 ${percent >= 100
                                                            ? 'text-green-600'
                                                            : percent >= 75
                                                                ? 'text-blue-600'
                                                                : percent >= 50
                                                                    ? 'text-yellow-600'
                                                                    : 'text-red-600'
                                                            }`}
                                                    >
                                                        {percent.toFixed(0)}%
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

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
                ) : activeView === 'progress' ? (
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
                ) : activeView === 'fourweekreport' ? (
                    <>
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Award className="w-8 h-8 text-indigo-600" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">4-Апталык отчет (Рейтинг)</h2>
                                    <p className="text-gray-600">Командалардын 4 апта боюнча ортосундагы рейтинги</p>
                                </div>
                            </div>

                            {/* Calculate 4-week averages for each team */}
                            {(() => {
                                const fourWeekData: Array<{
                                    teamName: string;
                                    weeklyScores: number[];
                                    averageScore: number;
                                    totalScore: number;
                                    bestWeek: number;
                                    worstWeek: number;
                                    trends: 'up' | 'down' | 'stable';
                                    ranking: number;
                                    periodStart: number;
                                    periodEnd: number;
                                }> = [];

                                if (data && data.weeks.length > 0) {
                                    // Calculate which 4-week period to show based on selectedPeriod
                                    const totalWeeks = data.weeks.length;
                                    const startWeekIndex = selectedPeriod * 4;
                                    const endWeekIndex = Math.min(startWeekIndex + 4, totalWeeks);

                                    // Get the weeks for this period
                                    const weeksForPeriod = data.weeks.slice(startWeekIndex, endWeekIndex);
                                    const actualStartWeek = weeksForPeriod[0]?.weekNumber || 1;
                                    const actualEndWeek = weeksForPeriod[weeksForPeriod.length - 1]?.weekNumber || 4;

                                    const teamNames = data.weeks[0]?.teams.map(t => t.name) || [];

                                    teamNames.forEach(teamName => {
                                        const weeklyScores: number[] = [];

                                        weeksForPeriod.forEach(weekData => {
                                            const team = weekData.teams.find(t => t.name === teamName);
                                            if (team) {
                                                const avgScore = team.members.reduce((sum, m) => sum + calculateMemberScore(m), 0) / team.members.length;
                                                weeklyScores.push(Math.round(avgScore * 10) / 10);
                                            }
                                        });

                                        const averageScore = weeklyScores.length > 0 ? weeklyScores.reduce((sum, score) => sum + score, 0) / weeklyScores.length : 0;
                                        const totalScore = weeklyScores.reduce((sum, score) => sum + score, 0);
                                        const bestWeek = weeklyScores.length > 0 ? Math.max(...weeklyScores) : 0;
                                        const worstWeek = weeklyScores.length > 0 ? Math.min(...weeklyScores) : 0;

                                        // Determine trend
                                        const firstHalf = weeklyScores.slice(0, Math.ceil(weeklyScores.length / 2)).reduce((a, b) => a + b, 0);
                                        const secondHalf = weeklyScores.slice(Math.floor(weeklyScores.length / 2)).reduce((a, b) => a + b, 0);
                                        let trends: 'up' | 'down' | 'stable' = 'stable';
                                        if (secondHalf > firstHalf) trends = 'up';
                                        else if (secondHalf < firstHalf) trends = 'down';

                                        fourWeekData.push({
                                            teamName,
                                            weeklyScores,
                                            averageScore: Math.round(averageScore * 10) / 10,
                                            totalScore: Math.round(totalScore * 10) / 10,
                                            bestWeek: Math.round(bestWeek * 10) / 10,
                                            worstWeek: Math.round(worstWeek * 10) / 10,
                                            trends,
                                            ranking: 0,
                                            periodStart: actualStartWeek,
                                            periodEnd: actualEndWeek
                                        });
                                    });

                                    // Sort by average score and assign rankings
                                    fourWeekData.sort((a, b) => b.averageScore - a.averageScore);
                                    fourWeekData.forEach((team, idx) => {
                                        team.ranking = idx + 1;
                                    });
                                }

                                return (
                                    <>
                                        {fourWeekData.length > 0 && (
                                            <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 mb-6">
                                                <div className="flex items-start gap-2">
                                                    <Info className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" />
                                                    <div className="text-sm text-blue-800">
                                                        <p className="font-semibold mb-1">
                                                            Көрсөтүлгөн мезгил: Апта {fourWeekData[0].periodStart} - Апта {fourWeekData[0].periodEnd}
                                                        </p>
                                                        <p>Бул отчет тандалган 4 апта боюнча маалыматты көрсөтөт. Бардык 4-апталык мезгилдерди көрүү үчүн жогорудагы навигацияны колдонуңуз.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Summary Statistics */}
                                        {fourWeekData.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-300">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Award className="w-8 h-8 text-green-600" />
                                                        <h3 className="text-lg font-bold text-green-900">Эң мыкты команда</h3>
                                                    </div>
                                                    <p className="text-2xl font-bold text-green-800">{fourWeekData[0]?.teamName}</p>
                                                    <p className="text-sm text-green-700 mt-1">Орточо упай: {fourWeekData[0]?.averageScore}</p>
                                                </div>

                                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-300">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <TrendingUp className="w-8 h-8 text-blue-600" />
                                                        <h3 className="text-lg font-bold text-blue-900">Эң тез өсүү</h3>
                                                    </div>
                                                    <p className="text-2xl font-bold text-blue-800">
                                                        {fourWeekData.filter(t => t.trends === 'up').sort((a, b) => {
                                                            const aDiff = a.weeklyScores[a.weeklyScores.length - 1] - a.weeklyScores[0];
                                                            const bDiff = b.weeklyScores[b.weeklyScores.length - 1] - b.weeklyScores[0];
                                                            return bDiff - aDiff;
                                                        })[0]?.teamName || 'Жок'}
                                                    </p>
                                                    <p className="text-sm text-blue-700 mt-1">Ийгиликтуу тенденция</p>
                                                </div>

                                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-2 border-purple-300">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Users className="w-8 h-8 text-purple-600" />
                                                        <h3 className="text-lg font-bold text-purple-900">Жалпы статистика</h3>
                                                    </div>
                                                    <p className="text-2xl font-bold text-purple-800">{fourWeekData.length} команда</p>
                                                    <p className="text-sm text-purple-700 mt-1">
                                                        {fourWeekData.length > 0 ? `${fourWeekData[0].periodStart}-${fourWeekData[0].periodEnd} апталар үчүн` : 'Статистика'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="overflow-x-auto mb-6">
                                            <table className="w-full">
                                                <thead className="bg-indigo-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Рейтинг</th>
                                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Команда</th>
                                                        {fourWeekData.length > 0 && fourWeekData[0].weeklyScores.map((_, idx) => (
                                                            <th key={idx} className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                                                                Апта {fourWeekData[0].periodStart + idx}
                                                            </th>
                                                        ))}
                                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Орточо упай</th>
                                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Эң жакшы</th>
                                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Эң начар</th>
                                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Өнүгүү тенденциясы</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {fourWeekData.map((team) => (
                                                        <tr key={team.teamName} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${team.ranking === 1 ? 'bg-yellow-400 text-yellow-900' :
                                                                    team.ranking === 2 ? 'bg-gray-300 text-gray-800' :
                                                                        team.ranking === 3 ? 'bg-orange-400 text-orange-900' :
                                                                            'bg-indigo-100 text-indigo-800'
                                                                    }`}>
                                                                    {team.ranking}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 font-medium text-gray-900">{team.teamName}</td>
                                                            {team.weeklyScores.map((score, weekIdx) => (
                                                                <td key={weekIdx} className="px-6 py-4 text-center text-gray-700">{score.toFixed(1)}</td>
                                                            ))}
                                                            <td className="px-6 py-4 text-center font-bold text-indigo-600 text-lg">{team.averageScore}</td>
                                                            <td className="px-6 py-4 text-center text-green-600 font-semibold">{team.bestWeek}</td>
                                                            <td className="px-6 py-4 text-center text-red-600 font-semibold">{team.worstWeek}</td>
                                                            <td className="px-6 py-4 text-center">
                                                                {team.trends === 'up' && <span className="text-green-600 font-bold">📈 Өсүш</span>}
                                                                {team.trends === 'down' && <span className="text-red-600 font-bold">📉 Төмөндөш</span>}
                                                                {team.trends === 'stable' && <span className="text-blue-600 font-bold">➡️ Туруктуулук</span>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Info about trend calculation */}
                                        {fourWeekData.length > 0 && (
                                            <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 mb-6">
                                                <div className="flex items-start gap-2">
                                                    <Info className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
                                                    <div className="text-sm text-green-800">
                                                        <p className="font-semibold mb-1">
                                                            Өнүгүү тенденциясы кантип эсептелет?
                                                        </p>
                                                        <p className="mb-2">Бирден чыгарууда, 4 аптаны биринчи эки аптасынын жыйынтыгы менен акыркы эки аптасынын жыйынтыгы салыштырылат:</p>
                                                        <ul className="list-disc list-inside space-y-1 ml-2">
                                                            <li>📈 Өсүш - акыркы эки аптадагы упайлар биринчи эки аптадан жогору болгондо</li>
                                                            <li>📉 Төмөндөш - акыркы эки аптадагы упайлар биринчи эки аптадан төмөн болгондо</li>
                                                            <li>➡️ Туруктуулук - эки мезгилдин упайлары бирдей болгондо</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Detailed Chart for 4 weeks */}
                                        {fourWeekData.length > 0 && data && (() => {
                                            const totalWeeks = data.weeks.length;
                                            const startWeekIndex = selectedPeriod * 4;
                                            const endWeekIndex = Math.min(startWeekIndex + 4, totalWeeks);
                                            const weeksForPeriod = data.weeks.slice(startWeekIndex, endWeekIndex);

                                            return (
                                                <div className="bg-white rounded-lg shadow-lg p-6">
                                                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                                                        {fourWeekData[0].periodStart}-{fourWeekData[0].periodEnd} апталар боюнча графика
                                                    </h3>
                                                    <ResponsiveContainer width="100%" height={400}>
                                                        <LineChart data={
                                                            weeksForPeriod.map(week => {
                                                                const dataPoint: any = { week: `Апта ${week.weekNumber}` };
                                                                week.teams.forEach(team => {
                                                                    const avgScore = team.members.reduce((sum, m) => sum + calculateMemberScore(m), 0) / team.members.length;
                                                                    dataPoint[team.name] = Math.round(avgScore * 10) / 10;
                                                                });
                                                                return dataPoint;
                                                            })
                                                        }>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="week" />
                                                            <YAxis label={{ value: 'Орточо упай', angle: -90, position: 'insideLeft' }} />
                                                            <Tooltip />
                                                            <Legend />
                                                            {fourWeekData.map((team, idx) => (
                                                                <Line
                                                                    key={team.teamName}
                                                                    type="monotone"
                                                                    dataKey={team.teamName}
                                                                    stroke={TEAM_COLORS[idx % TEAM_COLORS.length]}
                                                                    strokeWidth={3}
                                                                    name={team.teamName}
                                                                />
                                                            ))}
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            );
                                        })()}
                                    </>
                                );
                            })()}
                        </div>
                    </>
                ) : activeView === 'totalratings' ? (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Star className="w-8 h-8 text-indigo-600" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Жалпы рейтинг (5-аптадан)</h2>
                                <p className="text-gray-600">5-аптадан баштап акыркы аптага чейинки командалардын жалпы рейтингдери (орточо упайлардын суммасы)</p>
                            </div>
                        </div>
                        {(() => {
                            if (!data || data.weeks.length === 0) return null;
                            const relevantWeeks = data.weeks.filter(w => w.weekNumber >= 5);
                            if (relevantWeeks.length === 0) {
                                return (
                                    <div className="text-center p-8 text-gray-500 font-semibold">
                                        5-аптадан баштап маалымат табылган жок.
                                    </div>
                                );
                            }

                            const teamNames = data.weeks[0]?.teams.map(t => t.name) || [];
                            const totalRatings: { teamName: string; totalScore: number; weeklyScores: number[]; averageScore: number }[] = [];

                            teamNames.forEach(teamName => {
                                const weeklyScores: number[] = [];
                                relevantWeeks.forEach(weekData => {
                                    const team = weekData.teams.find(t => t.name === teamName);
                                    if (team) {
                                        const avgScore = team.members.reduce((sum, m) => sum + calculateMemberScore(m), 0) / team.members.length;
                                        weeklyScores.push(Math.round(avgScore * 10) / 10);
                                    }
                                });
                                
                                const totalScore = weeklyScores.reduce((sum, score) => sum + score, 0);
                                const averageScore = weeklyScores.length > 0 ? totalScore / weeklyScores.length : 0;

                                totalRatings.push({
                                    teamName,
                                    totalScore: Math.round(totalScore * 10) / 10,
                                    weeklyScores,
                                    averageScore: Math.round(averageScore * 10) / 10
                                });
                            });

                            totalRatings.sort((a, b) => b.totalScore - a.totalScore);

                            return (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-indigo-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-700">№</th>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-700">Команда</th>
                                                <th className="px-6 py-3 text-center font-semibold text-gray-700">Катышкан апталар</th>
                                                <th className="px-6 py-3 text-right font-semibold text-gray-700">Жалпы упай (Сумма)</th>
                                                <th className="px-6 py-3 text-right font-semibold text-gray-700">Орточо упай</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {totalRatings.map((team, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                                                            idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                                                            idx === 1 ? 'bg-gray-300 text-gray-800' :
                                                            idx === 2 ? 'bg-orange-400 text-orange-900' :
                                                            'bg-indigo-100 text-indigo-800'
                                                        }`}>
                                                            {idx + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">{team.teamName}</td>
                                                    <td className="px-6 py-4 text-center text-gray-600">{team.weeklyScores.length}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-indigo-600 text-lg">{team.totalScore}</td>
                                                    <td className="px-6 py-4 text-right text-gray-500">{team.averageScore}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })()}
                    </div>
                ) : null}
            </div>

            {/* Modals */}
            {showAdminLogin && (
                <AdminLogin
                    onLogin={() => {
                        setIsAuthenticated(true);
                        setShowAdminLogin(false);
                        setShowDataEntry(true);
                    }}
                    onClose={() => setShowAdminLogin(false)}
                />
            )}

            {showDataEntry && (
                <DataEntryForm
                    data={data}
                    onClose={() => {
                        setShowDataEntry(false);
                        setEditingTeam(null);
                    }}
                    onSuccess={() => {
                        setShowDataEntry(false);
                        setEditingTeam(null);
                        // Refresh data
                        window.location.reload();
                    }}
                    initialData={editingTeam}
                />
            )}
        </div>
    );
};

export default TeamPerformanceTracker;