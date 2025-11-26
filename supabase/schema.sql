-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create thoughts table
CREATE TABLE IF NOT EXISTS thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  embedding vector(768), -- For storing embeddings (adjust dimension as needed)
  tags TEXT[] DEFAULT '{}',
  mood VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  connections UUID[] DEFAULT '{}'
);

-- Create user_submissions table (optional, for tracking anonymous submissions)
CREATE TABLE IF NOT EXISTS user_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thought_id UUID REFERENCES thoughts(id) ON DELETE CASCADE,
  ip_hash VARCHAR(64), -- Hashed IP for anonymous tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_thoughts_created_at ON thoughts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thoughts_mood ON thoughts(mood);
CREATE INDEX IF NOT EXISTS idx_thoughts_tags ON thoughts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_thoughts_embedding ON thoughts USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable Row Level Security
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Thoughts are viewable by everyone" ON thoughts;
DROP POLICY IF EXISTS "Anyone can insert thoughts" ON thoughts;
DROP POLICY IF EXISTS "User submissions are viewable by everyone" ON user_submissions;
DROP POLICY IF EXISTS "Anyone can insert user submissions" ON user_submissions;

-- RLS Policies for thoughts (public read, authenticated write)
CREATE POLICY "Thoughts are viewable by everyone" ON thoughts
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert thoughts" ON thoughts
  FOR INSERT WITH CHECK (true);

-- RLS Policies for user_submissions
CREATE POLICY "User submissions are viewable by everyone" ON user_submissions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert user submissions" ON user_submissions
  FOR INSERT WITH CHECK (true);

-- Function to find similar thoughts using embeddings
CREATE OR REPLACE FUNCTION find_similar_thoughts(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  text TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    thoughts.id,
    thoughts.text,
    1 - (thoughts.embedding <=> query_embedding) as similarity
  FROM thoughts
  WHERE thoughts.embedding IS NOT NULL
    AND 1 - (thoughts.embedding <=> query_embedding) > match_threshold
  ORDER BY thoughts.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to update connections for a thought
CREATE OR REPLACE FUNCTION update_thought_connections(thought_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  thought_embedding vector(768);
  similar_thought_ids UUID[];
BEGIN
  -- Get the embedding for this thought
  SELECT embedding INTO thought_embedding
  FROM thoughts
  WHERE id = thought_id;
  
  -- If embedding exists, find similar thoughts
  IF thought_embedding IS NOT NULL THEN
    SELECT ARRAY_AGG(id) INTO similar_thought_ids
    FROM find_similar_thoughts(thought_embedding, 0.6, 3);
    
    -- Update connections
    UPDATE thoughts
    SET connections = COALESCE(similar_thought_ids, '{}')
    WHERE id = thought_id;
  END IF;
END;
$$;

