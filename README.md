# 📚 Documentation Management System

A full-stack documentation management application for tracking project documentation across multiple developers and projects.

**Live Demo**: [https://docs-smoky-omega.vercel.app](https://docs-smoky-omega.vercel.app)

---

## ✨ Features

- 🎯 **Project Management**: Create and manage multiple projects
- 👥 **Developer Tracking**: Track contributions from multiple developers
- 📝 **Rich Documentation**: Comprehensive documentation fields including:
  - Description, Purpose, Location
  - Dependencies, Thoughts, Challenges
  - Assumptions, Approach, Alternatives
  - Solution, Summary, Architecture
- 📄 **PDF Export**: Download documentation as formatted PDFs
  - Single project export
  - Full system export
- ☁️ **Cloud Persistence**: Data stored in Supabase (PostgreSQL)
- 🚀 **Serverless Backend**: Node.js v16 API on Vercel
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Angular 14
- **Language**: TypeScript 4.7
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router
- **Forms**: Reactive Forms

### Backend
- **Runtime**: Node.js v16
- **Framework**: Express.js
- **Platform**: Vercel Serverless Functions
- **PDF Generation**: PDFKit

### Database
- **Provider**: Supabase (PostgreSQL)
- **ORM**: Supabase JS Client
- **Storage**: Cloud-based (free tier)

### Deployment
- **Hosting**: Vercel
- **CI/CD**: Automatic deployments from Git
- **Environment**: Production + Preview environments

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Supabase account (free)
- Vercel account (free, optional for deployment)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd documentation
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd api
npm install
cd ..
```

### 3. Set Up Supabase
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `database/schema.sql` in Supabase SQL Editor
3. Copy your Project URL and anon key

### 4. Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your Supabase credentials
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run Locally
```bash
# Terminal 1: Start Angular dev server
npm start
# Opens at http://localhost:4200

# Terminal 2: Start backend API
cd api
node index.js
# Runs at http://localhost:3000
```

### 6. Deploy to Vercel (Optional)
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

---

## 📖 Documentation

- **[Migration Guide](./MIGRATION_GUIDE.md)**: Complete guide for localStorage → Supabase migration
- **[Deployment Guide](./DEPLOYMENT.md)**: Step-by-step deployment instructions
- **[API Reference](./API_REFERENCE.md)**: Complete API documentation
- **[Database Schema](./database/schema.sql)**: SQL schema for Supabase

---

## 🏗️ Project Structure

```
documentation/
├── api/                          # Backend serverless functions
│   ├── index.js                  # Main API with all endpoints
│   ├── package.json              # Backend dependencies (Node v16)
│   └── node_modules/
├── database/
│   └── schema.sql                # Supabase database schema
├── src/                          # Angular frontend
│   ├── app/
│   │   ├── start-page/           # Project/developer selection
│   │   ├── next-page/            # Documentation form
│   │   ├── developers.service.ts # Developer API service
│   │   ├── projects.service.ts   # Project API service
│   │   ├── documentation.service.ts # Documentation API service
│   │   └── models.ts             # TypeScript interfaces
│   ├── environments/
│   │   ├── environment.ts        # Dev environment config
│   │   └── environment.prod.ts   # Prod environment config
│   └── assets/
├── vercel.json                   # Vercel configuration
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── package.json                  # Frontend dependencies
├── MIGRATION_GUIDE.md            # Migration documentation
├── DEPLOYMENT.md                 # Deployment guide
├── API_REFERENCE.md              # API documentation
└── README.md                     # This file
```

---

## 🔌 API Endpoints

### Base URL
- **Local**: `http://localhost:3000/api`
- **Production**: `https://docs-smoky-omega.vercel.app/api`

### Endpoints
- `GET/POST /api/projects` - Manage projects
- `GET/POST /api/developers` - Manage developers
- `GET/POST /api/documentation` - Manage documentation
- `GET /api/documentation/:projectId/:developerId` - Get specific doc
- `GET /api/download-pdf/:projectId` - Download project PDF
- `GET /api/download-all-projects` - Download all PDFs

See [API_REFERENCE.md](./API_REFERENCE.md) for detailed documentation.

---

## 🗄️ Database Schema

### Tables
1. **projects** - Project information
2. **developers** - Developer/contributor information
3. **documentation** - Documentation entries (one per project-developer pair)

See [database/schema.sql](./database/schema.sql) for complete schema.

---

## 🔧 Development

### Build for Production
```bash
npm run build
# Output in dist/documentation/
```

### Run Tests
```bash
npm test
```

### Lint (Disabled)
```bash
npm run lint
# TSLint is deprecated, consider migrating to ESLint
```

---

## 🌐 Environment Variables

### Required Variables
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon/public key

### Local Development
Set in `.env` file (see `.env.example`)

### Production (Vercel)
Set in Vercel Dashboard → Settings → Environment Variables

---

## 🔐 Security

- ✅ Environment variables for sensitive data
- ✅ `.env` files gitignored
- ✅ CORS configured for API
- ⚠️ RLS disabled for development (enable in production)
- 🔒 Consider adding authentication for production use

---

## 📊 Features Roadmap

- [ ] User authentication (Supabase Auth)
- [ ] Real-time collaboration
- [ ] Version history for documentation
- [ ] Search and filter functionality
- [ ] Export to Markdown/HTML
- [ ] Code syntax highlighting
- [ ] File attachments
- [ ] Comments and reviews

---

## 🐛 Troubleshooting

### Common Issues

**"Failed to fetch" errors**
- Check environment variables are set correctly
- Verify Supabase project is active
- Check browser console for detailed errors

**API returns 404**
- Verify `vercel.json` routing configuration
- Check API endpoint paths match

**Data not persisting**
- Check Supabase Table Editor to verify data
- Ensure environment variables are set in Vercel
- Redeploy after adding environment variables

See [DEPLOYMENT.md](./DEPLOYMENT.md) for more troubleshooting tips.

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## 📞 Support

For detailed documentation, see:
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [API Reference](./API_REFERENCE.md)

---

**Built with ❤️ using Angular, Node.js, and Supabase**

