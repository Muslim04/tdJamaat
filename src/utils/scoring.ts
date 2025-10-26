import type { MetricValues, TeamMember, Team } from '../types';

// Scoring weights
export const weights: MetricValues = {
    'К-К': 45.0,
    'СВТ': 15.0,
    'КТП': 35.0,
    'ТХЖ': 20.0,
    'ДТА': 30.0,
    'ИСТГ': 10.0,
    'НФ': 20.0,
    'ТСП': 25.0
};

export const COLORS = {
    leader: '#DC2626',
    assistant: '#EA580C',
    member: '#4F46E5'
};

export const TEAM_COLORS = ['#4F46E5', '#059669', '#DC2626', '#D97706', '#7C3AED', '#0891B2'];

export const calculatePerformancePercentage = (actual: number, target: number): number => {
    if (target === 0) return 0;
    return (actual / target) * 100;
};

export const calculateMemberScore = (member: TeamMember): number => {
    let totalScore = 0;
    const metrics = Object.keys(weights) as Array<keyof MetricValues>;

    metrics.forEach(metric => {
        const actual = member.actual[metric] || 0;
        const target = member.target[metric] || 1;
        const performancePercentage = calculatePerformancePercentage(actual, target);
        const metricScore = (performancePercentage / 100) * weights[metric];
        totalScore += metricScore;
    });

    return Math.round(totalScore * 10) / 10;
};

export const calculateTeamScore = (team: Team): number => {
    const memberScores = team.members.reduce((sum, member) => sum + calculateMemberScore(member), 0);

    const miniCardScore = Object.keys(team.miniCard).reduce((sum, key) => {
        const activity = team.miniCard[key as keyof typeof team.miniCard];
        return sum + calculatePerformancePercentage(activity.actual, activity.target);
    }, 0);

    return Math.round((memberScores + miniCardScore * 0.5) * 10) / 10;
};

