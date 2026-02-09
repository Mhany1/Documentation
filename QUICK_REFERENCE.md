# ⚡ Quick Reference: Environment Setup

## 🔑 Supabase Credentials

### Where to Find Them
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** (gear icon) → **API**
4. Copy the values below

### Required Values
```
Project URL: https://[your-project-id].supabase.co
anon public key: eyJhbGci... (long string)
```

---

## 💻 Local Development Setup

### .env File (Root Directory)
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**Location**: `d:\New folder\documentation\documentation\.env`

**Important**: 
- ✅ This file is gitignored
- ❌ Never commit this file
- 📋 Use `.env.example` as template

---

## ☁️ Vercel Production Setup

### Method 1: Dashboard (Recommended)
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: **docs-smoky-omega**
3. Click **Settings** → **Environment Variables**
4. Add these two variables:

| Name | Value | Environment |
|------|-------|-------------|
| `SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `SUPABASE_ANON_KEY` | `your-anon-key-here` | Production, Preview, Development |

5. Click **Save**
6. Go to **Deployments** → Click **...** → **Redeploy**

### Method 2: CLI
```bash
vercel env add SUPABASE_URL production
# Paste: https://your-project.supabase.co

vercel env add SUPABASE_ANON_KEY production
# Paste: your-anon-key-here

# Redeploy
vercel --prod
```

---

## 🗄️ Database Setup (One-Time)

### Step 1: Create Tables
1. In Supabase dashboard → **SQL Editor**
2. Click **New Query**
3. Copy all content from `database/schema.sql`
4. Click **Run**

### Step 2: Verify Tables Created
1. Go to **Table Editor**
2. You should see:
   - ✅ projects
   - ✅ developers
   - ✅ documentation

---

## 🧪 Test Your Setup

### Local Test
```bash
# Terminal 1
npm start

# Terminal 2
cd api
node index.js

# Open browser: http://localhost:4200
# Try adding a project and developer
```

### Production Test
```bash
# Visit: https://docs-smoky-omega.vercel.app
# Try adding a project and developer
# Refresh page - data should persist!
```

---

## ✅ Verification Checklist

### Supabase
- [ ] Project created
- [ ] Database tables created (3 tables)
- [ ] Project URL copied
- [ ] anon key copied

### Local Environment
- [ ] `.env` file created
- [ ] `SUPABASE_URL` set in `.env`
- [ ] `SUPABASE_ANON_KEY` set in `.env`
- [ ] Dependencies installed (`npm install`)
- [ ] API dependencies installed (`cd api && npm install`)

### Vercel Environment
- [ ] `SUPABASE_URL` added to Vercel
- [ ] `SUPABASE_ANON_KEY` added to Vercel
- [ ] Project redeployed after adding variables

### Functionality
- [ ] Can add projects locally
- [ ] Can add developers locally
- [ ] Can create documentation locally
- [ ] Data persists after refresh locally
- [ ] Can add projects in production
- [ ] Can add developers in production
- [ ] Can create documentation in production
- [ ] Data persists after refresh in production

---

## 🐛 Common Issues & Quick Fixes

### Issue: "Failed to fetch"
**Fix**: Check environment variables are set correctly
```bash
# Local: Check .env file exists and has correct values
cat .env

# Vercel: Check dashboard → Settings → Environment Variables
```

### Issue: "Cannot find module '@supabase/supabase-js'"
**Fix**: Install API dependencies
```bash
cd api
npm install
```

### Issue: Data not saving
**Fix**: Verify Supabase connection
1. Check Supabase dashboard → Table Editor
2. Try manually inserting a row
3. Check browser console for errors

### Issue: 404 on API routes
**Fix**: Verify vercel.json configuration
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" }
  ]
}
```

---

## 📞 Need Help?

1. **Check logs**:
   - Local: Terminal output
   - Vercel: Dashboard → Deployments → View Function Logs
   - Supabase: Dashboard → Logs

2. **Read detailed docs**:
   - [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Complete migration guide
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
   - [API_REFERENCE.md](./API_REFERENCE.md) - API documentation

3. **Verify setup**:
   - Run through checklist above
   - Test locally first, then production

---

## 🎯 Quick Commands

```bash
# Install all dependencies
npm install && cd api && npm install && cd ..

# Start local development
npm start                    # Terminal 1
cd api && node index.js      # Terminal 2

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Check Vercel logs
vercel logs [deployment-url]
```

---

**Last Updated**: 2026-02-05  
**Node Version**: v16 (backend), v22 (frontend build)  
**Production URL**: https://docs-smoky-omega.vercel.app
