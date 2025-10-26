// Types for Team Performance Tracker

export interface MetricValues {
    'К-К': number;
    'СВТ': number;
    'КТП': number;
    'ТХЖ': number;
    'ДТА': number;
    'ИСТГ': number;
    'НФ': number;
    'ТСП': number;
}

export interface MiniCardActivity {
    actual: number;
    target: number;
}

export interface MiniCard {
    'БГМДТ': MiniCardActivity;
    'КПТ': MiniCardActivity;
    'И-Н.2': MiniCardActivity;
    'КИТЕП': MiniCardActivity;
    'СПОРТ': MiniCardActivity;
    'ТСПХ': MiniCardActivity;
}

export interface TeamMember {
    name: string;
    role: 'leader' | 'assistant' | 'member';
    actual: MetricValues;
    target: MetricValues;
}

export interface Team {
    name: string;
    miniCard: MiniCard;
    members: TeamMember[];
}

export interface WeekData {
    weekNumber: number;
    date: string;
    teams: Team[];
}

export interface DataFile {
    weeks: WeekData[];
}

export interface TeamRanking {
    name: string;
    index: number;
    totalScore: number;
    avgMemberScore: number;
    memberCount: number;
    rank: number;
}

export interface MemberRanking extends TeamMember {
    index: number;
    score: number;
    performancePercentages: MetricValues;
    rank: number;
}

export interface FourWeekData {
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
}

