
# Migration from Local JSON to Supabase

This guide explains how to migrate your local `teams_data.json` data to your new Supabase database.

## 1. Setup Supabase

1.  Create a new project on [Supabase.com](https://supabase.com/).
2.  Go to the **SQL Editor**.
3.  Copy and run the contents of `supabase/schema.sql`. This will create the `records` table.
    
    *Note: The schema includes policies to allow public read/write access for now, as requested. In a production environment, you should restrict write access.*

4.  Go to **Project Settings > API**.
5.  Copy the `Project URL` and `anon public` Key.

## 2. Configure Environment

1.  Rename `.env.example` to `.env` (if you haven't already).
2.  Fill in your Supabase credentials:

    ```env
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    ```

## 3. Migrate Data

Run the migration script to upload your existing data to Supabase. You will need your Service Role Key (found in **Project Settings > API > service_role**) to bypass Row Level Security rules if you have them, OR just use the Anon Key if you enabled the "Enable insert for all users" policy in step 1.

**Command:**

```bash
node scripts/migrate-data.js <YOUR_SUPABASE_URL> <YOUR_SUPABASE_KEY>
```

Example:
```bash
node scripts/migrate-data.js https://xyz.supabase.co eyJhbGciOiJIUzI1NiIsInR5c...
```

The script will:
- Read `public/teams_data.json`.
- Insert each team's weekly record into the `records` table.

## 4. Verification

1.  Run the app: `npm run dev`
2.  Ensure existing data loads correctly in the dashboard.
3.  Try adding new data (if UI supports it) or check Supabase dashboard to see rows.

## 5. Cleanup

Once you confirmed the data is loaded correctly from Supabase:
1.  Delete `public/teams_data.json`.
2.  Remove `public/teams_data.json` from git if tracked.
