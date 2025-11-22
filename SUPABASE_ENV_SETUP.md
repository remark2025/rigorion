# Supabase Edge Function Environment Variables Setup

## 🎯 Required Variables for get-session-token Function

### 1. CONTENT_MASTER_KEY
**Purpose**: Master encryption key for deriving pack/question keys
**Format**: Base64-encoded 32-byte key
**Example**: `HJdEk8LAWJbDJlfDru4LdjpwkBNSBKRDGqcVJX//4pc=`
**Generate**: `node -e "console.log(crypto.randomBytes(32).toString('base64'))"`

### 2. SESSION_TOKEN_SECRET  
**Purpose**: Signs JWT session tokens containing pack keys
**Format**: Base64-encoded 32-byte key
**Example**: `bA/05d2mDRzBhWVen4uEuBxcbf2BOw2Zc9C1ceH91JA=`
**Generate**: `node -e "console.log(crypto.randomBytes(32).toString('base64'))"`

### 3. ENCRYPTED_MANIFEST_URL
**Purpose**: URL where the edge function fetches the encrypted manifest
**Format**: Full HTTPS URL pointing to your uploaded manifest.json
**Examples**:
- Production: `https://cdn.yoursite.com/content/encrypted/manifest.json`
- Netlify: `https://your-app.netlify.app/content/build/encrypted/manifest.json` 
- Vercel: `https://your-app.vercel.app/content/build/encrypted/manifest.json`
- Custom CDN: `https://d1234567890.cloudfront.net/content/encrypted/manifest.json`

### 4. SUPABASE_URL
**Purpose**: Your Supabase project URL (usually auto-provided)
**Format**: `https://your-project-id.supabase.co`
**Note**: This is typically automatically available in Supabase functions

### 5. SUPABASE_SERVICE_ROLE_KEY
**Purpose**: Service role key for auth validation (usually auto-provided)
**Format**: JWT string starting with `eyJ...`
**Note**: This is typically automatically available in Supabase functions

## 🚀 How to Set These Variables

### Method 1: Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Settings** → **Environment Variables**
4. Click **Add variable** for each:
   - Name: `CONTENT_MASTER_KEY`, Value: `your-generated-key`
   - Name: `SESSION_TOKEN_SECRET`, Value: `your-generated-secret`
   - Name: `ENCRYPTED_MANIFEST_URL`, Value: `https://your-domain.com/content/encrypted/manifest.json`

### Method 2: Supabase CLI
```bash
# Set environment variables via CLI
supabase secrets set CONTENT_MASTER_KEY=your-key-here
supabase secrets set SESSION_TOKEN_SECRET=your-secret-here
supabase secrets set ENCRYPTED_MANIFEST_URL=https://your-domain.com/content/encrypted/manifest.json
```

## 📍 Where to Host Your Encrypted Content

You need to upload `content/build/encrypted/` to a publicly accessible location:

### Option A: Same Domain as Your App
- Upload to: `public/content/build/encrypted/`
- URL becomes: `https://your-app.com/content/build/encrypted/manifest.json`
- **Pros**: Simple, no CORS issues
- **Cons**: Content served from same origin as app

### Option B: CDN (Recommended)
- Upload to: AWS S3 + CloudFront, Cloudflare R2, etc.
- URL becomes: `https://cdn.yoursite.com/content/encrypted/manifest.json`
- **Pros**: Better performance, separate from app infrastructure
- **Cons**: Need to configure CORS headers

### Option C: Static Hosting Services
- **Netlify**: Upload to `public/` folder → `https://your-app.netlify.app/content/build/encrypted/manifest.json`
- **Vercel**: Upload to `public/` folder → `https://your-app.vercel.app/content/build/encrypted/manifest.json`

## 🧪 Testing Your Configuration

### Test 1: Verify Environment Variables
```bash
# Test that your edge function can access variables
supabase functions invoke get-session-token --method POST \
  --header "Authorization: Bearer fake-token-for-testing"

# Should return error about invalid token (good - means env vars loaded)
# Should NOT return error about missing CONTENT_MASTER_KEY (bad - means env var missing)
```

### Test 2: Verify Manifest URL Access
```bash
# Test that your manifest is publicly accessible
curl -I https://your-domain.com/content/encrypted/manifest.json

# Should return: HTTP/2 200 OK
# Should NOT return: 404 Not Found or 403 Forbidden
```

### Test 3: End-to-End Test
```javascript
// Browser console test (with valid auth token)
fetch('/functions/v1/get-session-token', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + yourAuthToken,
    'Content-Type': 'application/json'
  },
  body: '{}'
}).then(r => r.json()).then(console.log);

// Should return: {token: "eyJ...", expiresAt: 1234567890, packs: [...]}
```

## ⚠️ Security Notes

1. **Never commit these keys to git** - they're production secrets
2. **Use different keys per environment** (dev/staging/prod)
3. **Rotate keys quarterly** or if compromised
4. **Monitor access logs** for unusual patterns
5. **Backup keys securely** (password manager, encrypted vault)

## 🔧 Common Issues & Solutions

### Issue: "ENCRYPTED_MANIFEST_URL is not configured"
**Solution**: Set the environment variable in Supabase dashboard

### Issue: "Failed to fetch encrypted manifest: 404"  
**Solution**: Verify your content is uploaded and URL is correct

### Issue: "CONTENT_MASTER_KEY must be 32 bytes"
**Solution**: Regenerate key with: `node -e "console.log(crypto.randomBytes(32).toString('base64'))"`

### Issue: "Rate limit exceeded"
**Solution**: Wait 60 seconds, or increase rate limit in edge function

### Issue: CORS errors when fetching manifest
**Solution**: Add CORS headers to your CDN/hosting configuration