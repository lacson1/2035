# Vercel Serverless Functions Migration Guide

## Overview

Yes, your backend **can** be converted to Vercel serverless functions, but it requires several architectural changes. This guide outlines what needs to be modified.

## ✅ What Works Well with Serverless

- REST API endpoints
- Prisma ORM (with proper connection pooling)
- JWT authentication
- Stateless operations
- Most of your current routes

## ⚠️ What Needs Changes

### 1. **File Uploads** (Critical)
**Current:** Multer saves files to local filesystem (`/uploads/documents/`)
**Serverless Solution:** Use external storage
- **Vercel Blob Storage** (recommended for Vercel)
- **AWS S3** (more flexible)
- **Cloudinary** (good for images)

### 2. **Static File Serving**
**Current:** `app.use('/uploads', express.static('uploads'))`
**Serverless Solution:** Serve from external storage URLs directly

### 3. **Prisma Connection Pooling**
**Current:** Direct Prisma client connection
**Serverless Solution:** Use Prisma Data Proxy or connection pooling
- **Prisma Data Proxy** (easiest, managed by Prisma)
- **PgBouncer** (self-hosted option)
- **Connection pooling service** (like Supabase)

### 4. **Redis Caching**
**Current:** ioredis with local/remote Redis
**Serverless Solution:** Use Upstash Redis (serverless Redis)

### 5. **Express App Structure**
**Current:** Single Express app with routes
**Serverless Solution:** Convert to individual API route handlers

## 📁 New Project Structure

```
backend/
├── api/                          # Vercel serverless functions
│   ├── auth/
│   │   ├── login.ts
│   │   ├── register.ts
│   │   └── me.ts
│   ├── patients/
│   │   ├── index.ts              # GET /api/patients
│   │   └── [id].ts               # GET /api/patients/:id
│   ├── hubs/
│   │   └── index.ts
│   └── ...
├── lib/                          # Shared utilities
│   ├── prisma.ts                 # Prisma client with pooling
│   ├── redis.ts                  # Upstash Redis client
│   ├── storage.ts                # File storage abstraction
│   └── auth.ts                   # Auth utilities
├── prisma/
│   └── schema.prisma
├── vercel.json                   # Vercel configuration
└── package.json
```

## 🔧 Implementation Steps

### Step 1: Setup Prisma for Serverless

**Option A: Prisma Data Proxy (Recommended)**

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

**Option B: Connection Pooling with PgBouncer**

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Use pooled connection URL
    },
  },
})
```

### Step 2: Setup Upstash Redis

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
```

### Step 3: Setup File Storage (Vercel Blob)

```typescript
// lib/storage.ts
import { put, list, del } from '@vercel/blob'

export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const blob = await put(filename, file, {
    access: 'public',
    contentType,
  })
  return blob.url
}

export async function deleteFile(url: string) {
  await del(url)
}
```

### Step 4: Convert Express Routes to Serverless Functions

**Example: Patients Route**

```typescript
// api/patients/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../../lib/prisma'
import { requireAuth } from '../../lib/auth'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Auth check
    const user = await requireAuth(req)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Query params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 100
    const skip = (page - 1) * limit

    // Fetch patients
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.patient.count(),
    ])

    return res.status(200).json({
      data: patients,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

**Example: File Upload Route**

```typescript
// api/patients/[id]/imaging/[studyId]/upload-report.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../../../../../lib/prisma'
import { uploadFile } from '../../../../../lib/storage'
import { requireAuth } from '../../../../../lib/auth'

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await requireAuth(req)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id: patientId, studyId } = req.query

    // Parse multipart form data
    const formData = await parseMultipartFormData(req)
    const file = formData.file

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Upload to Vercel Blob
    const fileUrl = await uploadFile(
      file.buffer,
      `documents/${Date.now()}-${file.filename}`,
      file.contentType
    )

    // Get imaging study
    const study = await prisma.imagingStudy.findUnique({
      where: { id: studyId as string },
    })

    // Create document record
    const document = await prisma.document.create({
      data: {
        patientId: patientId as string,
        documentType: 'imaging_report',
        title: `${study?.type} Report`,
        fileName: file.filename,
        fileUrl,
        fileSize: file.size,
        mimeType: file.contentType,
        uploadedById: user.userId,
      },
    })

    // Update imaging study
    await prisma.imagingStudy.update({
      where: { id: studyId as string },
      data: { reportUrl: fileUrl },
    })

    return res.status(200).json({
      data: { reportUrl: fileUrl },
      document,
      message: 'Report uploaded successfully',
    })
  } catch (error) {
    console.error('Error uploading report:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

### Step 5: Vercel Configuration

```json
// vercel.json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database_url",
    "UPSTASH_REDIS_REST_URL": "@upstash_redis_url",
    "UPSTASH_REDIS_REST_TOKEN": "@upstash_redis_token",
    "BLOB_READ_WRITE_TOKEN": "@blob_token",
    "JWT_SECRET": "@jwt_secret"
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

## 📦 Required Package Changes

### Remove:
- `express` (use Vercel's built-in request/response)
- `multer` (use Vercel Blob or form-data parser)
- `ioredis` (use `@upstash/redis`)

### Add:
```json
{
  "dependencies": {
    "@vercel/node": "^3.0.0",
    "@vercel/blob": "^0.20.0",
    "@upstash/redis": "^1.30.0",
    "formidable": "^3.5.0"
  },
  "devDependencies": {
    "@types/formidable": "^3.4.5"
  }
}
```

## 🔄 Migration Checklist

- [ ] Setup Prisma Data Proxy or connection pooling
- [ ] Migrate Redis to Upstash
- [ ] Setup Vercel Blob Storage for file uploads
- [ ] Convert Express routes to serverless functions
- [ ] Update file upload middleware to use Blob Storage
- [ ] Remove Express app.listen() and convert to handlers
- [ ] Update static file serving to use Blob URLs
- [ ] Test all endpoints
- [ ] Update environment variables in Vercel
- [ ] Deploy and monitor

## ⚡ Performance Considerations

1. **Cold Starts**: First request may be slower (200-500ms)
   - Mitigation: Use Vercel Pro plan for better performance
   - Keep functions warm with scheduled pings

2. **Database Connections**: 
   - Use Prisma Data Proxy to avoid connection limits
   - Or use connection pooling service

3. **File Size Limits**:
   - Vercel Blob: 4.5GB per file
   - Function timeout: 10s (Hobby), 60s (Pro)

4. **Rate Limits**:
   - Vercel Hobby: 100GB bandwidth/month
   - Consider CDN for static assets

## 🚀 Alternative: Hybrid Approach

Keep Express backend but deploy to:
- **Railway** (easy Express deployment)
- **Render** (free tier available)
- **Fly.io** (global edge deployment)
- **DigitalOcean App Platform**

These platforms support your current Express setup with minimal changes.

## 📚 Resources

- [Vercel Serverless Functions Docs](https://vercel.com/docs/functions)
- [Prisma Data Proxy](https://www.prisma.io/docs/data-platform/data-proxy)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)

## 💡 Recommendation

**For your healthcare app, I recommend:**

1. **Short-term**: Deploy Express backend to Railway/Render (minimal changes)
2. **Long-term**: Gradually migrate to serverless if you need:
   - Global edge deployment
   - Automatic scaling
   - Pay-per-use pricing

The serverless migration is **feasible** but requires significant refactoring. Consider your team's capacity and timeline before committing.

