
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

if (args.length < 2) {
    console.error('Usage: node scripts/migrate-data.js <SUPABASE_URL> <SUPABASE_KEY>');
    process.exit(1);
}

const supabaseUrl = args[0];
const supabaseKey = args[1];

const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_FILE = path.join(__dirname, '../public/teams_data.json');

async function migrate() {
    if (!fs.existsSync(DATA_FILE)) {
        console.error('Data file not found:', DATA_FILE);
        return;
    }

    const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(rawData);

    if (!data.weeks || !Array.isArray(data.weeks)) {
        console.error('Invalid JSON structure. Expected "weeks" array.');
        return;
    }

    console.log(`Found ${data.weeks.length} weeks to migrate.`);

    for (const weekData of data.weeks) {
        const weekNum = weekData.weekNumber;
        const weekDate = weekData.date || '';

        console.log(`Migrating Week ${weekNum}...`);

        for (const team of weekData.teams) {
            // Reconstruct payload as per DataService logic
            // We store the date inside the JSON payload using _date key
            // to allow reconstruction without a separate Weeks table.
            const payload = { ...team, _date: weekDate };

            const { error } = await supabase
                .from('records') // Ensure this table exists!
                .insert({
                    week: weekNum,
                    team: team.name, // Extract team name for querying
                    activity: JSON.stringify(payload)
                });

            if (error) {
                console.error(`Failed to insert record for Week ${weekNum}, Team ${team.name}:`, error.message);
            }
        }
    }

    console.log('Migration complete!');
}

migrate();
