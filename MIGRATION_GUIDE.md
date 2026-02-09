# 🚀 Migration Guide: localStorage → Supabase Cloud Database

## Overview
This project has been migrated from localStorage to **Supabase** (free cloud PostgreSQL database) while maintaining deployment on Vercel with Node.js v16 serverless functions.

---

## 📊 Database Schema

### Supabase Tables

#### 1. **projects** table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_projects_name ON projects(name);
```

#### 2. **developers** table
```sql
CREATE TABLE developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_developers_name ON developers(name);
```

#### 3. **documentation** table
```sql
CREATE TABLE documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  project_name TEXT,
  developer_name TEXT,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one documentation entry per project-developer combination
  UNIQUE(project_id, developer_id)
);

-- Indexes for faster queries
CREATE INDEX idx_documentation_project ON documentation(project_id);
CREATE INDEX idx_documentation_developer ON documentation(developer_id);
CREATE INDEX idx_documentation_composite ON documentation(project_id, developer_id);
```

---

## 🔑 Supabase Setup

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/login (100% free tier available)
3. Click **"New Project"**
4. Fill in:
   - **Project Name**: `documentation-app` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier

### Step 2: Create Database Tables
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the SQL schema above (all three tables)
4. Click **"Run"** to execute

### Step 3: Configure Row Level Security (RLS)
For development/testing, you can disable RLS or set permissive policies:

```sql
-- Disable RLS for development (enable in production with proper policies)
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE developers DISABLE ROW LEVEL SECURITY;
ALTER TABLE documentation DISABLE ROW LEVEL SECURITY;
```

**For production**, enable RLS and create policies:
```sql
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentation ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all for projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all for developers" ON developers FOR ALL USING (true);
CREATE POLICY "Allow all for documentation" ON documentation FOR ALL USING (true);
```

### Step 4: Get API Credentials
1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

---

## ⚙️ Environment Configuration

### Local Development (.env)

Create a `.env` file in the **root directory**:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Never commit `.env` to Git! It's already in `.gitignore`.

### Vercel Production Deployment

#### Option 1: Vercel Dashboard (Recommended)
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - **Name**: `SUPABASE_URL`  
     **Value**: `https://your-project.supabase.co`
   - **Name**: `SUPABASE_ANON_KEY`  
     **Value**: `your-anon-key-here`
5. Click **Save**
6. **Redeploy** your project for changes to take effect

#### Option 2: Vercel CLI
```bash
vercel env add SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add SUPABASE_ANON_KEY
# Paste your Supabase anon key when prompted
```

---

## 🏗️ Project Structure

```
documentation/
├── api/                          # Vercel serverless functions
│   ├── index.js                  # Main API with Supabase integration
│   ├── package.json              # Backend dependencies (Node v16)
│   └── node_modules/
├── src/                          # Angular frontend
│   ├── app/
│   │   ├── developers.service.ts # REST API calls (no localStorage)
│   │   ├── projects.service.ts   # REST API calls (no localStorage)
│   │   └── documentation.service.ts # REST API calls
│   └── environments/
│       ├── environment.ts        # Dev: http://localhost:3000/api
│       └── environment.prod.ts   # Prod: /api (relative)
├── vercel.json                   # Vercel routing configuration
├── package.json                  # Frontend dependencies
└── .env                          # Local environment variables (gitignored)
```

---

## 🔌 API Endpoints

All endpoints are available at:
- **Local**: `http://localhost:3000/api`
- **Production**: `https://docs-smoky-omega.vercel.app/api`

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
  ```json
  { "name": "Project Name" }
  ```

### Developers
- `GET /api/developers` - Get all developers
- `POST /api/developers` - Create developer
  ```json
  { "name": "Developer Name" }
  ```

### Documentation
- `GET /api/documentation` - Get all documentation entries
- `GET /api/documentation/:projectId/:developerId` - Get specific entry
- `POST /api/documentation` - Save/update documentation
  ```json
  {
    "id": "uuid-if-updating",
    "projectId": "uuid",
    "developerId": "uuid",
    "projectName": "string",
    "developerName": "string",
    "description": "string",
    "purpose": "string",
    ...
  }
  ```

### PDF Downloads
- `GET /api/download-pdf/:projectId` - Download single project PDF
- `GET /api/download-all-projects` - Download all projects PDF

---

## 🚀 Deployment Steps

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Install API dependencies
cd api
npm install
cd ..
```

### 2. Local Development
```bash
# Create .env file with Supabase credentials
echo "SUPABASE_URL=https://your-project.supabase.co" > .env
echo "SUPABASE_ANON_KEY=your-anon-key" >> .env

# Start Angular dev server
npm start

# In another terminal, start backend API
cd api
node index.js
```

### 3. Deploy to Vercel
```bash
# Install Vercel CLI (if not already)
npm i -g vercel

# Deploy
vercel

# Follow prompts, then set environment variables in Vercel dashboard
```

### 4. Verify Deployment
1. Visit your production URL: `https://docs-smoky-omega.vercel.app`
2. Add a developer and project
3. Create documentation
4. Refresh the page - data should persist!
5. Open in a new device/browser - data should be there!

---

## ✅ Migration Checklist

- [x] Supabase project created
- [x] Database tables created with schema
- [x] RLS policies configured
- [x] Backend API using Supabase client
- [x] Environment variables set locally (.env)
- [x] Environment variables set in Vercel
- [x] Frontend services using REST API
- [x] localStorage removed from data persistence
- [x] CORS configured correctly
- [x] Node v16 specified in api/package.json
- [x] Vercel.json configured for API routing
- [x] Production deployment tested
- [x] Data persists across refreshes
- [x] Data accessible from different devices

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" errors
**Solution**: Check that environment variables are set in Vercel dashboard and redeploy.

### Issue: CORS errors in production
**Solution**: The backend already has CORS enabled. Ensure you're using relative paths (`/api`) in production.

### Issue: 404 on API routes
**Solution**: Verify `vercel.json` routing configuration is correct.

### Issue: Data not persisting
**Solution**: 
1. Check Supabase dashboard → Table Editor to see if data is being saved
2. Verify environment variables are correct
3. Check browser console for API errors

### Issue: "Cannot find module '@supabase/supabase-js'"
**Solution**: Run `cd api && npm install` to install backend dependencies.

---

## 📈 Benefits of This Migration

### Before (localStorage)
- ❌ Data lost on browser clear
- ❌ Not accessible across devices
- ❌ No collaboration possible
- ❌ Limited storage (5-10MB)
- ❌ Client-side only

### After (Supabase)
- ✅ Data persists permanently
- ✅ Accessible from any device
- ✅ Multi-user collaboration ready
- ✅ Unlimited storage (free tier: 500MB)
- ✅ Real-time capabilities available
- ✅ Automatic backups
- ✅ SQL queries and analytics
- ✅ RESTful API architecture

---

## 🔒 Security Notes

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use anon key for frontend** - It's safe for client-side use with RLS
3. **Enable RLS in production** - Protect your data with proper policies
4. **Rotate keys if exposed** - Can be done in Supabase dashboard

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Node.js on Vercel](https://vercel.com/docs/runtimes#official-runtimes/node-js)

---

## 🎉 Success!

Your app is now using a cloud database! Data will persist across:
- ✅ Browser refreshes
- ✅ Different devices
- ✅ Different browsers
- ✅ Server restarts (Vercel cold starts)

**Production URL**: https://docs-smoky-omega.vercel.app
