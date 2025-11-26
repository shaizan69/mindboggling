# Supabase Setup Instructions

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `mindmesh` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to you
5. Wait for project to be created (2-3 minutes)

## Step 2: Enable pgvector Extension

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this command:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

## Step 3: Run Schema Migration

1. In the **SQL Editor**, copy and paste the contents of `schema.sql`
2. Click "Run" to execute the migration
3. Verify tables are created by checking the **Table Editor**

## Step 4: Get API Keys

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Add these to your `.env.local` file

## Step 5: Test Connection

Run the development server and check the console for any connection errors.

## Notes

- The free tier includes 500MB database storage
- pgvector extension is available on Supabase
- Row Level Security (RLS) is enabled for data protection
- Similarity search function is available for finding related thoughts

