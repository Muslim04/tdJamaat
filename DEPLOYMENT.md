
# Deployment Guide

This guide explains how to deploy your `Team Performance Tracker` application to **Vercel** and connect it to your existing **Supabase** project.

## Prerequisites

1.  A **GitHub** account.
2.  A **Vercel** account (you can sign up with GitHub).
3.  Your local project files (which you already have).
4.  Your **Supabase** project URL and Anon Key (from your `.env` file).

---

## Step 1: Push Code to GitHub

Since you have been working locally, you need to push your code to a GitHub repository.

1.  **Create a New Repository on GitHub**:
    *   Go to [github.com/new](https://github.com/new).
    *   Name it (e.g., `team-performance-tracker`).
    *   Make it **Private** (recommended since it's for internal use).
    *   Do **not** initialize with README, .gitignore, or License (you already have these locally).
    *   Click **Create repository**.

2.  **Push Your Local Code**:
    Open your terminal in the project folder and run these commands (replace `YOUR_GITHUB_USERNAME` with your actual username):

    ```bash
    git remote add origin https://github.com/YOUR_GITHUB_USERNAME/team-performance-tracker.git
    git branch -M master
    git push -u origin master
    ```

    *(Note: If you haven't committed your latest changes, do `git add .` and `git commit -m "Ready for deployment"` first.)*

---

## Step 2: Deploy to Vercel

1.  **Import Project**:
    *   Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **"Add New..."** -> **"Project"**.
    *   Find your `team-performance-tracker` repository in the list and click **"Import"**.

2.  **Configure Project**:
    *   **Framework Preset**: It should automatically detect `Vite`. If not, select `Vite`.
    *   **Root Directory**: Leave as `./`.

3.  **Environment Variables (CRITICAL)**:
    *   Expand the **"Environment Variables"** section.
    *   You must add the variables from your local `.env` file here. Open your local `.env` file and copy the values one by one:

    | Name | Value |
    | :--- | :--- |
    | `VITE_SUPABASE_URL` | `https://szpcnftnrjohltvzyggl.supabase.co` |
    | `VITE_SUPABASE_ANON_KEY` | `YOUR_ACTUAL_ANON_KEY_FROM_DOT_ENV` |
    | `VITE_ADMIN_PASSWORD` | `shrek2026` |

    *   **Important**: Vercel needs these to build your app correctly and for the admin login to work.

4.  **Deploy**:
    *   Click **"Deploy"**.
    *   Vercel will build your project. This might take a minute.
    *   Once done, you will see a success screen with a preview of your deployed app!

---

## Step 3: Verify Supabase Connection

1.  Open your new Vercel URL (e.g., `https://team-performance-tracker.vercel.app`).
2.  The app should load and display data from your Supabase database.
3.  Try logging in as Admin:
    *   Click the **Admin** button.
    *   Enter the password: `shrek2026`.
    *   Verify you can see the "Add Data" form.

## Troubleshooting

*   **App loads but no data**: Check your Vercel Environment Variables. The `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` might be incorrect.
*   **Admin login fails**: Check if `VITE_ADMIN_PASSWORD` is set correctly in Vercel.
*   **Build fails**: Check the Vercel logs. Common issues are type errors (which `npm run build` locally should have caught).

## Updating Your App

Whenever you make changes locally:
1.  Commit your changes: `git commit -am "New feature"`
2.  Push to GitHub: `git push`
3.  Vercel will **automatically** detect the push and redeploy your app with the new changes!
