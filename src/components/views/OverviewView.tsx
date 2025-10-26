import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Info } from 'lucide-react';
import type { DataFile, TeamMember } from '../../types';
import { getOverallTeamRankings } from '../../utils/rankings';
import { calculateMemberScore, COLORS } from '../../utils/scoring';

interface OverviewViewProps {
    currentWeekData: DataFile['weeks'][0];
}

export const OverviewView: React.FC<OverviewViewProps> = ({ currentWeekData }) => {
    const [roleFilter, setRoleFilter] = useState<'all' | 'leader' | 'assistant' | 'member'>('all');

    const teamRankings = getOverallTeamRankings(currentWeekData.teams);

    // Combine all members across all teams
    const allIndividuals = currentWeekData.teams.flatMap(team =>
        team.members.map((member: TeamMember) => ({
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

    return (
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
                {/* Individual Rankings Across All Teams */}
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
    );
};

