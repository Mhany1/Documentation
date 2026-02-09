-- ============================================
-- Documentation App - Supabase Database Schema
-- ============================================
-- This schema supports a documentation management system
-- with projects, developers, and their documentation entries.
--
-- Run this in Supabase SQL Editor to set up your database.
-- ============================================

-- ============================================
-- 1. PROJECTS TABLE
-- ============================================
-- Stores all projects in the system
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster name-based lookups and sorting
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);

-- ============================================
-- 2. DEVELOPERS TABLE
-- ============================================
-- Stores all developers/contributors in the system
CREATE TABLE IF NOT EXISTS developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster name-based lookups and sorting
CREATE INDEX IF NOT EXISTS idx_developers_name ON developers(name);

-- ============================================
-- 3. DOCUMENTATION TABLE
-- ============================================
-- Stores documentation entries
-- Each entry is tied to one project and one developer
CREATE TABLE IF NOT EXISTS documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign keys
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  
  -- Denormalized names for easier querying and PDF generation
  project_name TEXT,
  developer_name TEXT,
  
  -- Documentation fields
  description TEXT,
  purpose TEXT,
  location TEXT,
  dependencies TEXT,
  thoughts TEXT,
  challenges TEXT,
  assumptions TEXT,
  approach TEXT,
  alternatives TEXT,
  solution TEXT,
  summary TEXT,
  architecture TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: One documentation entry per project-developer pair
  CONSTRAINT unique_project_developer UNIQUE(project_id, developer_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_documentation_project ON documentation(project_id);
CREATE INDEX IF NOT EXISTS idx_documentation_developer ON documentation(developer_id);
CREATE INDEX IF NOT EXISTS idx_documentation_composite ON documentation(project_id, developer_id);
CREATE INDEX IF NOT EXISTS idx_documentation_updated ON documentation(updated_at DESC);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- For development/testing: Disable RLS (open access)
-- Uncomment these lines for quick setup:
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE developers DISABLE ROW LEVEL SECURITY;
ALTER TABLE documentation DISABLE ROW LEVEL SECURITY;

-- For production: Enable RLS with permissive policies
-- Comment out the DISABLE lines above and uncomment these:

-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documentation ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all operations)
-- Adjust these based on your authentication requirements

-- DROP POLICY IF EXISTS "Allow all for projects" ON projects;
-- CREATE POLICY "Allow all for projects" 
--   ON projects 
--   FOR ALL 
--   USING (true)
--   WITH CHECK (true);

-- DROP POLICY IF EXISTS "Allow all for developers" ON developers;
-- CREATE POLICY "Allow all for developers" 
--   ON developers 
--   FOR ALL 
--   USING (true)
--   WITH CHECK (true);

-- DROP POLICY IF EXISTS "Allow all for documentation" ON documentation;
-- CREATE POLICY "Allow all for documentation" 
--   ON documentation 
--   FOR ALL 
--   USING (true)
--   WITH CHECK (true);

-- ============================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before any update on documentation
DROP TRIGGER IF EXISTS set_updated_at ON documentation;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON documentation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert sample data for testing:

-- INSERT INTO projects (name) VALUES 
--   ('Frontend Dashboard'),
--   ('Backend API'),
--   ('Mobile App')
-- ON CONFLICT (name) DO NOTHING;

-- INSERT INTO developers (name) VALUES 
--   ('Alice Johnson'),
--   ('Bob Smith'),
--   ('Charlie Brown')
-- ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 7. VERIFICATION QUERIES
-- ============================================

-- Run these to verify your setup:

-- Check tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('projects', 'developers', 'documentation');

-- Check indexes
-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('projects', 'developers', 'documentation');

-- Check RLS status
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('projects', 'developers', 'documentation');

-- ============================================
-- SCHEMA COMPLETE ✓
-- ============================================
-- Your database is now ready to use!
-- 
-- Next steps:
-- 1. Copy your Supabase URL and anon key
-- 2. Add them to your .env file (local)
-- 3. Add them to Vercel environment variables (production)
-- 4. Deploy and test!
-- ============================================
