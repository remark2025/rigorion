# 🚀 Encrypted Questions Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Generate Secrets
```bash
# Generate and save these securely (never commit to git)
CONTENT_MASTER_KEY=$(node -e "console.log(crypto.randomBytes(32).toString('base64'))")
SESSION_TOKEN_SECRET=$(node -e "console.log(crypto.randomBytes(32).toString('base64'))")

echo "CONTENT_MASTER_KEY=$CONTENT_MASTER_KEY"
echo "SESSION_TOKEN_SECRET=$SESSION_TOKEN_SECRET"
```

### 2. Build Encrypted Content
```bash
# Use same key for all environments
CONTENT_MASTER_KEY="your_key_here" npm run content:build -- --encrypt

# Verify output
ls -la content/build/encrypted/
cat content/build/encrypted/manifest.json
```

### 3. Upload Manifest to CDN
```bash
# Upload content/build/encrypted/ to your CDN/storage
# Get public URL for manifest.json
# Example: https://your-cdn.com/content/build/encrypted/manifest.json
```

## 🔧 Supabase Configuration

### 1. Deploy Edge Function
```bash
# Login to Supabase
supabase login

# Deploy function
supabase functions deploy get-session-token

# Verify deployment
supabase functions list
```

### 2. Set Environment Variables
Go to Supabase Dashboard → Settings → Environment Variables:

```
CONTENT_MASTER_KEY=your_32_byte_base64_key
SESSION_TOKEN_SECRET=your_32_byte_base64_key  
ENCRYPTED_MANIFEST_URL=https://your-cdn.com/content/build/encrypted/manifest.json
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Test Edge Function
```bash
curl -X POST https://your-project.supabase.co/functions/v1/get-session-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 🎯 Client Integration

### 1. Update Question Components
Replace existing question loading with encrypted service:

```typescript
// Before
const { question } = useQuestion(questionId);

// After  
const { question } = useEncryptedQuestion(questionId);
```

### 2. Test Local Integration
```bash
# Start dev server
npm run dev

# Test question loading
# Check browser console for errors
# Verify network requests to /functions/v1/get-session-token
```

## 🔍 Validation Tests

### ✅ Encryption Working
- [ ] Build with --encrypt produces binary .bin files
- [ ] Manifest contains proper offsets and hashes
- [ ] Hexdump shows encrypted ciphertext (not plaintext)

### ✅ Edge Function Working  
- [ ] Function deploys without errors
- [ ] Returns valid JWT tokens with pack keys
- [ ] Rate limiting works (try 31+ requests/minute)
- [ ] CORS headers allow your domain

### ✅ Client Decryption Working
- [ ] SessionToken fetch succeeds
- [ ] Question decryption works end-to-end
- [ ] Cache prevents unnecessary re-fetches
- [ ] Error handling shows user-friendly messages

### ✅ Performance Acceptable
- [ ] First question load < 2 seconds
- [ ] Subsequent questions < 500ms
- [ ] Memory usage stable (no leaks)
- [ ] Browser compatibility (Chrome, Firefox, Safari)

## 🚨 Rollback Plan

### If Issues Detected:
1. **Revert to plain JSON**: Remove `--encrypt` flag from build
2. **Feature flag**: Add `ENABLE_ENCRYPTION=false` environment variable
3. **Gradual rollout**: Start with 10% of users using encrypted flow

### Emergency Contacts:
- CDN Issues: [Your CDN support]
- Supabase Issues: Supabase support
- Security Issues: [Your security team]

## 📊 Success Metrics

### Week 1 Targets:
- [ ] 0 decryption errors in logs
- [ ] < 1% performance regression 
- [ ] No user complaints about question loading
- [ ] All encrypted questions accessible

### Month 1 Targets:
- [ ] 95% cache hit rate for session tokens
- [ ] < 0.1% question access failures
- [ ] Cost reduction vs unencrypted baseline
- [ ] Security audit passing grade

## 🔄 Maintenance Tasks

### Weekly:
- [ ] Monitor error rates in Supabase logs
- [ ] Check CDN cache hit rates
- [ ] Review unusual access patterns

### Monthly:
- [ ] Rotate CONTENT_MASTER_KEY (if needed)
- [ ] Update encryption metrics dashboard
- [ ] Security review of access logs

### Quarterly:
- [ ] Penetration test encrypted system
- [ ] Performance benchmark vs baseline
- [ ] Review and update security policies