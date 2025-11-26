# MindMesh Deployment Guide

## Prerequisites

1. **Supabase Account**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Complete database setup (see `supabase/README.md`)

2. **Google Gemini API Key**
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. **Vercel Account** (or alternative hosting)
   - Sign up at [vercel.com](https://vercel.com)

## Step 1: Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini API
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

## Step 2: Database Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL from `supabase/schema.sql`
4. Verify tables are created in **Table Editor**

## Step 3: Build and Test Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Test production build locally
npm start
```

## Step 4: Deploy to Vercel

### Option A: Via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_GEMINI_API_KEY`
6. Click "Deploy"

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add GOOGLE_GEMINI_API_KEY

# Deploy to production
vercel --prod
```

## Step 5: Post-Deployment

1. **Verify Environment Variables**
   - Check that all environment variables are set in Vercel dashboard
   - Ensure they're available in production

2. **Test the Application**
   - Visit your deployed URL
   - Test thought submission
   - Test AI generation
   - Test graph visualization

3. **Monitor Performance**
   - Check Vercel analytics
   - Monitor Supabase usage
   - Check API rate limits

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify Supabase URL and key are correct
   - Check RLS policies are set correctly
   - Ensure pgvector extension is enabled

2. **API Errors**
   - Verify Gemini API key is correct
   - Check rate limits
   - Review API logs in Vercel

3. **Build Errors**
   - Check TypeScript errors: `npm run build`
   - Verify all dependencies are installed
   - Check environment variables are set

## Alternative Deployment Options

### Netlify

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables
5. Deploy

### Railway

1. Connect GitHub repository
2. Add environment variables
3. Railway will auto-detect Next.js
4. Deploy

## Performance Optimization

1. **Enable Edge Functions** (Vercel)
   - Use Edge Runtime for API routes when possible

2. **Optimize Images**
   - Use Next.js Image component
   - Configure image domains

3. **Caching**
   - Configure React Query cache times
   - Use Supabase caching strategies

## Security Checklist

- [ ] Environment variables are not committed to git
- [ ] RLS policies are enabled in Supabase
- [ ] Content moderation is active
- [ ] API keys are secured
- [ ] HTTPS is enabled
- [ ] CORS is configured correctly

## Monitoring

Set up monitoring for:
- Error rates
- API response times
- Database query performance
- User activity
- Rate limit usage

## Support

For issues or questions:
1. Check the README.md
2. Review Supabase documentation
3. Check Next.js documentation
4. Review error logs in Vercel

