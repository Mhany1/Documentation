# 🚀 Quick Deployment Guide

## Prerequisites
- [x] Supabase account (free tier)
- [x] Vercel account (free tier)
- [x] Node.js installed locally

---

## 📋 Step-by-Step Deployment

### 1️⃣ Set Up Supabase Database

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Choose a name, password, and region
   - Wait for setup to complete (~2 minutes)

2. **Run Database Schema**
   - In Supabase dashboard → **SQL Editor**
   - Click "New Query"
   - Copy contents from `database/schema.sql`
   - Click "Run" to execute

3. **Get API Credentials**
   - Go to **Settings** → **API**
   - Copy:
     - **Project URL**: `https://xxxxx.supabase.co`
     - **anon public key**: `eyJhbGci...`

### 2️⃣ Configure Local Environment

1. **Create .env file** (in project root)
   ```bash
   cp .env.example .env
   ```

2. **Edit .env** with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Install dependencies**
   ```bash
   npm install
   cd api
   npm install
   cd ..
   ```

### 3️⃣ Test Locally

1. **Start Angular dev server**
   ```bash
   npm start
   ```
   - Opens at http://localhost:4200

2. **Start backend API** (in new terminal)
   ```bash
   cd api
   node index.js
   ```
   - Runs at http://localhost:3000

3. **Test the app**
   - Add a developer
   - Add a project
   - Create documentation
   - Refresh page - data should persist!

### 4️⃣ Deploy to Vercel

#### Option A: Vercel Dashboard (Easiest)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Supabase integration"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Click "Deploy"

3. **Add Environment Variables**
   - In Vercel dashboard → **Settings** → **Environment Variables**
   - Add:
     - `SUPABASE_URL` = `https://your-project.supabase.co`
     - `SUPABASE_ANON_KEY` = `your-anon-key`
   - Click "Save"

4. **Redeploy**
   - Go to **Deployments** tab
   - Click "..." → "Redeploy"

#### Option B: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add environment variables**
   ```bash
   vercel env add SUPABASE_URL
   # Paste your Supabase URL when prompted
   
   vercel env add SUPABASE_ANON_KEY
   # Paste your anon key when prompted
   ```

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

### 5️⃣ Verify Production Deployment

1. **Visit your production URL**
   - Example: https://docs-smoky-omega.vercel.app

2. **Test functionality**
   - [ ] Add a developer
   - [ ] Add a project
   - [ ] Create documentation
   - [ ] Refresh page - data persists ✓
   - [ ] Open in incognito/different browser - data is there ✓
   - [ ] Download PDF - works ✓

3. **Check Supabase**
   - Go to Supabase → **Table Editor**
   - You should see your data in the tables!

---

## ✅ Post-Deployment Checklist

- [ ] Supabase database is set up
- [ ] Tables created successfully
- [ ] Local .env file configured
- [ ] Vercel environment variables set
- [ ] App deployed to Vercel
- [ ] Production URL is accessible
- [ ] Data persists across refreshes
- [ ] Data accessible from different devices
- [ ] PDF downloads work in production

---

## 🐛 Common Issues

### "Failed to fetch" in production
**Fix**: Ensure environment variables are set in Vercel and redeploy.

### API returns 404
**Fix**: Check `vercel.json` routing configuration.

### CORS errors
**Fix**: Backend already has CORS enabled. Clear browser cache.

### Data not saving
**Fix**: 
1. Check Supabase Table Editor - is data appearing?
2. Check browser console for errors
3. Verify environment variables are correct

---

## 🎉 Success!

Your app is now fully deployed with cloud database persistence!

**Architecture:**
- **Frontend**: Angular (Vercel)
- **Backend**: Node.js v16 Serverless Functions (Vercel)
- **Database**: PostgreSQL (Supabase)
- **Storage**: Cloud-based (no localStorage)

**Benefits:**
- ✅ Data persists forever
- ✅ Accessible from any device
- ✅ Multi-user ready
- ✅ Automatic backups
- ✅ 100% free tier

---

## 📚 Next Steps

- Enable RLS policies for production security
- Add user authentication (Supabase Auth)
- Set up real-time subscriptions
- Add data export/import features
- Monitor usage in Supabase dashboard

---

**Need help?** Check `MIGRATION_GUIDE.md` for detailed documentation.
