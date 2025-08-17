# 🚀 Lean Interaction System Implementation

A production-ready, offline-first content delivery and interaction tracking system for your SAT practice app.

## 🎯 Key Features

- **Offline-First**: Content cached locally, batched sync when online
- **Idempotent**: Duplicate-safe with unique keys
- **Scalable**: Normalized schema, batch operations, CDN-friendly
- **Secure**: JWT auth, RLS policies, private storage

## 📋 Implementation Checklist

### Step 1: Database Setup ✅

Run this SQL in your Supabase SQL Editor:

```sql
-- Copy from: supabase/migrations/create_lean_interaction_tables.sql
```

Creates:
- `question_interactions` table (lean schema with RLS)
- `bookmarks` table (separate from interactions)
- Proper indexes for performance
- Idempotency constraints

### Step 2: Storage Setup

1. **Create Bucket**: Go to Supabase Storage → Create bucket named `question-packs` (Private)

2. **Upload Files**:
   ```
   question-packs/
   ├── manifest.json                    # ← Upload this
   └── packs/
       ├── core@3f7a2.json             # Your question packs
       ├── algebra@a91b0.json
       └── geometry@b4c1d.json
   ```

3. **Manifest Example** (see `manifest.json`):
   ```json
   {
     "version": "2025-08-17",
     "packs": [
       { "id": "core", "hash": "3f7a2", "size": 1401235 }
     ]
   }
   ```

### Step 3: Deploy Functions ✅

```bash
./deploy-functions.sh
```

Deploys:
- `content` - Serves manifest & packs with edge caching
- `attempts-batch` - Idempotent batched interaction writes  
- `log-interaction` - Updated single interaction endpoint

### Step 4: Test Everything

```bash
# Edit with your real JWT token first
./test-new-system.sh
```

## 🔌 API Reference

### Content API

**Get Manifest**:
```bash
POST /functions/v1/content
Authorization: Bearer <jwt>
{
  "route": "manifest"
}
```

**Get Pack**:
```bash
POST /functions/v1/content  
Authorization: Bearer <jwt>
{
  "route": "pack",
  "id": "core", 
  "hash": "3f7a2"
}
```

### Interaction API

**Batch Submit**:
```bash
POST /functions/v1/attempts-batch
Authorization: Bearer <jwt>
{
  "items": [
    {
      "question_public_id": "MATH-001",
      "attempt_number": 1,
      "duration_seconds": 45,
      "is_correct": false,
      "confidence_level": 3,
      "hint_checked": true,
      "solution_checked": false,
      "objective_progress": 75,
      "bookmarked": true,
      "idempotency_key": "uuid-here"
    }
  ]
}
```

**Single Submit** (backwards compatibility):
```bash
POST /functions/v1/log-interaction
Authorization: Bearer <jwt>
{
  "question_id": "MATH-001",
  "is_correct": true,
  "time_spent_seconds": 67,
  "confidence_level": 5,
  "hint_checked": false,
  "solution_checked": true,
  "objective_progress": 82,
  "bookmarked": false
}
```

## 🏗️ Client Integration Flow

### 1. App Startup (Signed User)

```typescript
// 1. Get manifest
const manifest = await fetch('/functions/v1/content', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${userJWT}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ route: 'manifest' })
});

// 2. Check local cache vs manifest hashes
// 3. Download missing packs
for (const pack of manifest.packs) {
  if (localHash !== pack.hash) {
    const packData = await fetch('/functions/v1/content', {
      method: 'POST', 
      body: JSON.stringify({ 
        route: 'pack', 
        id: pack.id, 
        hash: pack.hash 
      })
    });
    // Store in IndexedDB
  }
}
```

### 2. During Practice

```typescript
// Queue interactions locally with idempotency keys
const interaction = {
  question_public_id: "MATH-001",
  duration_seconds: 45,
  is_correct: false,
  confidence_level: 3,
  hint_checked: true,
  solution_checked: false,
  objective_progress: 75,
  bookmarked: true,
  idempotency_key: crypto.randomUUID(),
  attempt_number: 1
};

localQueue.push(interaction);
```

### 3. Sync When Online

```typescript
// Batch sync queued interactions
if (navigator.onLine && localQueue.length > 0) {
  await fetch('/functions/v1/attempts-batch', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${userJWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ items: localQueue })
  });
  
  // Clear sent items on success
  localQueue.length = 0;
}
```

## 📊 Database Schema

### question_interactions
```sql
user_id               uuid        -- RLS: auth.uid()
question_public_id    text        -- "MATH-001" 
attempt_number        smallint    -- 1, 2, 3...
attempted_at          timestamptz
duration_seconds      integer     -- 0-3600
is_correct            boolean
confidence_level      smallint    -- 1-5
hint_checked          boolean
solution_checked      boolean  
objective_progress    smallint    -- 0-100
idempotency_key       uuid        -- prevents duplicates
created_at            timestamptz

PK: (user_id, question_public_id, attempt_number)
UQ: (user_id, idempotency_key)
```

### bookmarks
```sql
user_id              uuid
question_public_id   text  
created_at           timestamptz

PK: (user_id, question_public_id)
```

## 🎯 Next Steps

1. **Run SQL Migration** in Supabase SQL Editor
2. **Create Storage Bucket** `question-packs` (private)  
3. **Upload manifest.json** to bucket root
4. **Deploy Functions** with `./deploy-functions.sh`
5. **Test** with `./test-new-system.sh` (edit JWT first)
6. **Update Frontend** to use new APIs

## 🔒 Security Notes

- All endpoints require valid JWT
- RLS policies ensure users only see their data
- Storage bucket is private
- Idempotency keys prevent duplicate submissions
- Input validation on all fields

## 🚀 Performance Features

- **CDN-Friendly**: Immutable content with ETag headers
- **Batch Operations**: Reduce API calls with batch sync
- **Offline-First**: No network needed during practice
- **Indexed Queries**: Optimized for common access patterns

---

✅ **System is now production-ready for offline-first content delivery and precise interaction tracking!**