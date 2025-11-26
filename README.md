# MindMesh

A network of intrusive thoughts visualization platform - where random thoughts, intrusive ideas, fragments, and chaos are connected visually like a living mind-map.

## 🌟 Features

- **Interactive Graph Visualization** - Explore thoughts as connected nodes in a living mind-map
- **AI-Powered Thought Generation** - Generate random, intrusive thoughts using Google Gemini
- **Thought Stream Mode** - TikTok-style scrolling through thoughts
- **Real-time Updates** - Live thought additions via Supabase Realtime
- **Mood-based Filtering** - Filter thoughts by mood (chaotic, existential, funny, etc.)
- **Search Functionality** - Search through thoughts by keywords
- **Content Moderation** - Automatic content filtering for safety
- **Beautiful UI/UX** - Dark theme with smooth animations

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL with pgvector)
- **AI:** Google Gemini API
- **Visualization:** React Flow
- **Animations:** Framer Motion
- **State Management:** Zustand + TanStack Query

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd mindmesh
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
GOOGLE_GEMINI_API_KEY=your_gemini_key
```

4. **Set up Supabase database**
   - Follow instructions in `supabase/README.md`
   - Run the SQL schema from `supabase/schema.sql`

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── stream/        # Stream view page
│   └── page.tsx       # Main graph view
├── components/         # React components
│   ├── ThoughtGraph.tsx
│   ├── ThoughtNode.tsx
│   ├── ThoughtStream.tsx
│   └── ...
├── lib/               # Utility functions
│   ├── supabase/      # Supabase client
│   ├── gemini/        # Gemini API client
│   └── utils.ts       # Helper functions
├── stores/            # Zustand state stores
├── types/             # TypeScript definitions
├── hooks/             # Custom React hooks
└── supabase/          # Database schema
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Vercel:
```bash
npm i -g vercel
vercel
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## 🔒 Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `GOOGLE_GEMINI_API_KEY` - Your Google Gemini API key

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with Next.js, React Flow, and Supabase
- AI powered by Google Gemini
- Design inspired by modern web aesthetics

