# MindMesh Setup Guide

This guide will walk you through setting up MindMesh from scratch.

## Step 1: Prerequisites

Make sure you have:
- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works)
- A Google Gemini API key (free tier available)

## Step 2: Clone and Install

```bash
# Navigate to project directory
cd "D:\Calender App"

# Install dependencies
npm install
```

## Step 3: Supabase Setup

### 3.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Project name: `mindmesh`
   - Database password: (save this securely)
   - Region: Choose closest to you
4. Wait 2-3 minutes for project creation

### 3.2 Enable pgvector Extension

1. In Supabase dashboard, go to **SQL Editor**
2. Run this command:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### 3.3 Run Database Schema

1. Still in **SQL Editor**, open the file `supabase/schema.sql`
2. Copy the entire contents
3. Paste into SQL Editor
4. Click "Run" to execute

### 3.4 Get API Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 4: Google Gemini Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

## Step 5: Environment Variables

1. Create `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   GOOGLE_GEMINI_API_KEY=your-gemini-key-here
   ```

## Step 6: Verify Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. You should see the MindMesh interface

## Step 7: Test Features

1. **Add a Thought:**
   - Click "Add Thought" button
   - Type a thought and submit
   - Or click "Generate with AI"

2. **View Graph:**
   - Thoughts should appear as nodes
   - Connected thoughts show as edges

3. **Test Stream Mode:**
   - Click "Stream" in header
   - Swipe through thoughts

4. **Test Filters:**
   - Click menu icon (☰)
   - Filter by mood or search

## Troubleshooting

### Database Connection Error
- Verify Supabase URL and key in `.env.local`
- Check that schema was run successfully
- Ensure pgvector extension is enabled

### Gemini API Error
- Verify API key is correct
- Check rate limits (free tier: 60 req/min)
- Ensure key has proper permissions

### Build Errors
- Run `npm install` again
- Delete `node_modules` and `.next` folder
- Run `npm install` and `npm run dev`

### No Thoughts Showing
- Check Supabase table has data
- Verify RLS policies allow SELECT
- Check browser console for errors

## Next Steps

- Customize the design in `tailwind.config.ts`
- Add more features
- Deploy to production (see DEPLOYMENT.md)

## Support

If you encounter issues:
1. Check the README.md
2. Review error messages in console
3. Verify all environment variables are set
4. Check Supabase and Gemini API status

