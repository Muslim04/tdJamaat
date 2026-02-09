
import { supabase } from '../lib/supabase';
import type { DataFile, WeekData, Team } from '../types';

// Table name
const TABLE_NAME = 'records';

export interface Record {
    id: string;
    week: number;
    team: string; // The team name
    group_name?: string; // Optional field from user suggestion
    activity: string; // Stores the JSON string of the Team data (including members and miniCard)
    created_at: string;
}

// Fetch all records and reconstruct DataFile
export const fetchRecords = async (week?: number): Promise<DataFile> => {
    let query = supabase
        .from(TABLE_NAME)
        .select('*')
        .order('week', { ascending: true }); // Ensure weeks are ordered

    if (week !== undefined) {
        query = query.eq('week', week);
    }

    const { data: records, error } = await query;

    if (error) {
        console.error('Error fetching records:', error);
        throw new Error(error.message);
    }

    if (!records) {
        return { weeks: [] };
    }

    // Aggregate records into WeekData structure
    const weeksMap = new Map<number, WeekData>();

    records.forEach((record: Record) => {
        const teamData: Team = JSON.parse(record.activity);

        // Check if week exists in map
        if (!weeksMap.has(record.week)) {
            // We need the date. Since it's duplicated in the activity JSON (as proposed strategy), we extract it
            // Or we can just use a default/placeholder if not present.
            // Let's assume we stored 'date' in the activity JSON as a property '_meta_date' or similar, 
            // or we just find it. 
            // Wait, original JSON structure had `date` at Week level.
            // I'll assume we store `date` inside the JSON payload for now to keep it simple, 
            // or just pick it from any team's data if I put it there.

            weeksMap.set(record.week, {
                weekNumber: record.week,
                date: (teamData as any)._date || 'Date not set', // Placeholder for now
                teams: []
            });
        }

        const weekEntry = weeksMap.get(record.week)!;
        // Remove the extra metadata if we added it
        const { _date, ...cleanTeamData } = teamData as any;

        // Add Supabase ID for editing purposes
        const recordWithId = { ...cleanTeamData, id: record.id } as Team;

        weekEntry.teams.push(recordWithId);
    });

    return {
        weeks: Array.from(weeksMap.values()).sort((a, b) => a.weekNumber - b.weekNumber)
    };
};

// Add a record (a whole week's worth of data? Or one team entry?)
// The user asked for "addRecord(record)". Given the signature, maybe it's adding a single entry?
// But UI likely submits a whole week?
// Actually `addRecord(record)` might mean adding a single row to the DB.
// Let's implement adding a Team's record.
export const addRecord = async (week: number, team: Team, date: string) => {
    // We add the date to the payload for reconstruction
    const payload = { ...team, _date: date };

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([
            {
                week,
                team: team.name,
                activity: JSON.stringify(payload)
            }
        ])
        .select();

    if (error) throw error;
    return data;
};

// Update a record
// ID here refers to the database UUID
export const updateRecord = async (id: string, teamData: Team) => {
    // We need to preserve the date if it's in the existing JSON...
    // This is tricky. simpler to just update the content.
    // But wait, if I update, I should probably just update the JSON.

    // First fetch the existing to get the date? Or just blindly update?
    // For now, let's just update activity.
    // WARNING: If `_date` was inside `activity`, it might be lost if we don't include it.
    // Ideally `updateRecord` should take `{ ...team, _date }`.
    // But `Team` type doesn't have `_date`.

    // Let's fetch first to be safe, or assume caller handles it.
    // Given "Use async/await + loading/error handling", I'll fetch first.

    const { data: existing, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select('activity')
        .eq('id', id)
        .single();

    if (fetchError) throw fetchError;

    const existingActivity = JSON.parse(existing.activity);
    const date = existingActivity._date;

    const payload = { ...teamData, _date: date };

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update({ activity: JSON.stringify(payload), team: teamData.name })
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
};

export const deleteRecord = async (id: string) => {
    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

    if (error) throw error;
};
