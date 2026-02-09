
# Team Performance Tracker

A comprehensive application to track and visualize team performance metrics, including weekly reports, formula displays, and data entry capabilities.

## Technlogies Used

-   **Frontend**: React, TypeScript, Vite, Tailwind CSS
-   **Database**: Supabase
-   **Charts**: Recharts
-   **Icons**: Lucide React

## Getting Started

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Set up environment variables (see below).
4.  Run the development server: `npm run dev`

## Deployment

For detailed deployment instructions to Vercel and Supabase integration, please refer to [DEPLOYMENT.md](./DEPLOYMENT.md).

## Project Structure

-   `src/components`: Reusable UI components (Header, AdminLogin, DataEntryForm, etc.)
-   `src/types`: TypeScript interfaces
-   `src/services`: Supabase data services
-   `src/utils`: Helper functions and constants

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_PASSWORD=your_admin_password
```
