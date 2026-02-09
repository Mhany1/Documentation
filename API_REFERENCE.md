# 📚 Documentation App - API Reference

## Base URLs

- **Local Development**: `http://localhost:3000/api`
- **Production**: `https://docs-smoky-omega.vercel.app/api`

---

## 🔑 Authentication

Currently, the API uses Supabase's anon key for public access. No authentication headers required for basic operations.

For production, consider implementing:
- Supabase Auth with JWT tokens
- Row Level Security (RLS) policies
- API key authentication

---

## 📡 Endpoints

### Projects

#### Get All Projects
```http
GET /api/projects
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Project Name",
    "created_at": "2026-02-05T12:00:00Z"
  }
]
```

#### Create Project
```http
POST /api/projects
Content-Type: application/json

{
  "name": "New Project"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "New Project",
  "created_at": "2026-02-05T12:00:00Z"
}
```

**Notes:**
- Returns existing project if name already exists (case-insensitive)
- Name is required and will be trimmed

---

### Developers

#### Get All Developers
```http
GET /api/developers
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Developer Name",
    "created_at": "2026-02-05T12:00:00Z"
  }
]
```

#### Create Developer
```http
POST /api/developers
Content-Type: application/json

{
  "name": "New Developer"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "New Developer",
  "created_at": "2026-02-05T12:00:00Z"
}
```

**Notes:**
- Returns existing developer if name already exists (case-insensitive)
- Name is required and will be trimmed

---

### Documentation

#### Get All Documentation Entries
```http
GET /api/documentation
```

**Response:**
```json
[
  {
    "id": "uuid",
    "project_id": "uuid",
    "developer_id": "uuid",
    "projectId": "uuid",
    "developerId": "uuid",
    "project_name": "Project Name",
    "developer_name": "Developer Name",
    "projectName": "Project Name",
    "developerName": "Developer Name",
    "description": "...",
    "purpose": "...",
    "location": "...",
    "dependencies": "...",
    "thoughts": "...",
    "challenges": "...",
    "assumptions": "...",
    "approach": "...",
    "alternatives": "...",
    "solution": "...",
    "summary": "...",
    "architecture": "...",
    "created_at": "2026-02-05T12:00:00Z",
    "updated_at": "2026-02-05T12:00:00Z"
  }
]
```

**Notes:**
- Returns both snake_case (database) and camelCase (frontend) field names for compatibility

#### Get Documentation for Specific Project & Developer
```http
GET /api/documentation/:projectId/:developerId
```

**Example:**
```http
GET /api/documentation/123e4567-e89b-12d3-a456-426614174000/987fcdeb-51a2-43f7-8c9d-123456789abc
```

**Response:**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "developer_id": "uuid",
  "description": "...",
  ...
}
```

**Notes:**
- Returns empty object `{}` if no documentation found
- Does not return 404 error

#### Create or Update Documentation
```http
POST /api/documentation
Content-Type: application/json

{
  "id": "uuid (optional - include for update)",
  "projectId": "uuid",
  "developerId": "uuid",
  "projectName": "Project Name",
  "developerName": "Developer Name",
  "description": "Component description",
  "purpose": "Why it exists",
  "location": "File path",
  "dependencies": "Required packages",
  "thoughts": "Initial thoughts",
  "challenges": "Challenges faced",
  "assumptions": "Assumptions made",
  "approach": "Why this approach",
  "alternatives": "Other options considered",
  "solution": "Final solution",
  "summary": "Brief summary",
  "architecture": "Architecture notes"
}
```

**Response:**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "developer_id": "uuid",
  "projectId": "uuid",
  "developerId": "uuid",
  ...
}
```

**Notes:**
- If `id` is provided, updates existing entry
- If `id` is omitted, creates new entry
- `projectId` and `developerId` are required
- `updated_at` is automatically set to current timestamp

---

### PDF Downloads

#### Download Single Project PDF
```http
GET /api/download-pdf/:projectId
```

**Example:**
```http
GET /api/download-pdf/123e4567-e89b-12d3-a456-426614174000
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="Project_Name_Documentation.pdf"`

**Notes:**
- Includes all documentation entries for the specified project
- Organized by developer/contributor
- Formatted with sections: Basic Information, Development Process, Technical Details

#### Download All Projects PDF
```http
GET /api/download-all-projects
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="Full_System_Documentation.pdf"`

**Notes:**
- Includes all documentation entries across all projects
- Organized by project, then by developer
- Suitable for system-wide documentation export

---

## 🔄 CORS Configuration

CORS is enabled for all origins in development. For production, consider restricting to your domain:

```javascript
app.use(cors({
  origin: 'https://docs-smoky-omega.vercel.app'
}));
```

---

## 🛠️ Error Handling

All endpoints return appropriate HTTP status codes:

- **200 OK**: Successful GET/POST
- **400 Bad Request**: Missing required fields
- **404 Not Found**: Route not found
- **500 Internal Server Error**: Database or server error

**Error Response Format:**
```json
{
  "error": "Error message description"
}
```

---

## 📊 Database Schema

### Tables

1. **projects**
   - `id` (UUID, primary key)
   - `name` (TEXT, unique)
   - `created_at` (TIMESTAMPTZ)

2. **developers**
   - `id` (UUID, primary key)
   - `name` (TEXT, unique)
   - `created_at` (TIMESTAMPTZ)

3. **documentation**
   - `id` (UUID, primary key)
   - `project_id` (UUID, foreign key → projects)
   - `developer_id` (UUID, foreign key → developers)
   - `project_name` (TEXT)
   - `developer_name` (TEXT)
   - All documentation fields (TEXT)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)
   - **Constraint**: Unique (project_id, developer_id)

---

## 🧪 Testing

### Using cURL

**Create a project:**
```bash
curl -X POST https://docs-smoky-omega.vercel.app/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project"}'
```

**Get all projects:**
```bash
curl https://docs-smoky-omega.vercel.app/api/projects
```

**Create documentation:**
```bash
curl -X POST https://docs-smoky-omega.vercel.app/api/documentation \
  -H "Content-Type: application/json" \
  -d '{
    "projectId":"uuid-here",
    "developerId":"uuid-here",
    "projectName":"Test Project",
    "developerName":"Test Developer",
    "description":"Test description"
  }'
```

### Using Postman

Import the following collection:

```json
{
  "info": {
    "name": "Documentation App API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Projects",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/projects"
      }
    },
    {
      "name": "Create Project",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/projects",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"name\":\"New Project\"}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://docs-smoky-omega.vercel.app/api"
    }
  ]
}
```

---

## 🚀 Rate Limits

Supabase free tier limits:
- **Database**: 500MB storage
- **API Requests**: Unlimited (with fair use)
- **Bandwidth**: 2GB/month

Vercel free tier limits:
- **Serverless Function Execution**: 100GB-hours/month
- **Bandwidth**: 100GB/month

---

## 📈 Monitoring

Monitor your API usage:

1. **Supabase Dashboard**
   - Go to **Reports** → **API**
   - View request counts, response times, errors

2. **Vercel Dashboard**
   - Go to **Analytics**
   - View function invocations, errors, performance

---

## 🔐 Security Best Practices

1. **Enable RLS** in production (see `database/schema.sql`)
2. **Use environment variables** for sensitive data
3. **Implement authentication** for write operations
4. **Validate input** on both client and server
5. **Rate limit** API endpoints if needed
6. **Monitor** for unusual activity

---

## 📞 Support

- **Documentation**: See `MIGRATION_GUIDE.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Database Schema**: See `database/schema.sql`

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-05
