# 🚀 Encrypted Questions Deployment Checklist

## Pre-Deployment Setup

### 1. Generate Security Keys
```bash
# Generate fresh keys for each environment
node -e "console.log('CONTENT_MASTER_KEY=' + crypto.randomBytes(32).toString('base64'))"
node -e "console.log('SESSION_TOKEN_SECRET=' + crypto.randomBytes(32).toString('base64'))"

# CRITICAL: Use different keys for dev/staging/production!
```

### 2. Deploy Edge Functions
```bash
# Deploy security events endpoint
supabase functions deploy security-events

# Deploy session token endpoint (if not already deployed)
supabase functions deploy get-session-token

# Verify both functions are live
supabase functions list
```

### 3. Configure Edge Function Secrets

**For each environment (dev/staging/prod):**
```bash
# Set via Supabase CLI
supabase secrets set CONTENT_MASTER_KEY=your-env-specific-master-key
supabase secrets set SESSION_TOKEN_SECRET=your-env-specific-token-secret
supabase secrets set ENCRYPTED_MANIFEST_URL=your-cdn-manifest-url
```

**Required secrets:**
- ✅ `CONTENT_MASTER_KEY` (32-byte base64, unique per env)
- ✅ `SESSION_TOKEN_SECRET` (32-byte base64, unique per env)  
- ✅ `ENCRYPTED_MANIFEST_URL` (public CDN URL)

### 4. Build & Upload Encrypted Content
```bash
# Build encrypted packs
npm run content:build -- --encrypt

# Upload to CDN (choose your platform):
# AWS S3: aws s3 sync content/build/encrypted/ s3://bucket/content/encrypted/
# Supabase: supabase storage cp content/build/encrypted/ supabase://storage/
# Static: cp -r content/build/encrypted/ public/content/build/encrypted/
```

## Production Rollout Strategy

### Phase 1: Infrastructure Validation
- [ ] Deploy edge functions 
- [ ] Upload encrypted content to CDN
- [ ] Run smoke tests: `node scripts/smoke-test-encryption.js`
- [ ] Verify security events logging

### Phase 2: Canary Release (10% traffic)
- [ ] Enable for limited users via feature flag
- [ ] Monitor security events for 24h
- [ ] Verify performance metrics < 50ms load time
- [ ] Check error rates < 0.1%

### Phase 3: Full Rollout (100%)
- [ ] Gradual rollout: 10% → 50% → 100%
- [ ] Monitor throughout transition
- [ ] Have instant rollback ready

## Monitoring & Alerts

### Key Metrics
- **Security**: Zero decrypt_failure/integrity_violation events
- **Performance**: Question load P95 < 50ms
- **Reliability**: Edge function success > 99.5%
- **Cache**: CDN hit rate > 95%

### Emergency Rollback
```typescript
// In QuestionsContext.tsx - instant fallback
const useEncryptedQuestions = () => false;
```

## Success Criteria
- [ ] Zero security violations for 48 hours
- [ ] Performance targets met
- [ ] Security telemetry working
- [ ] No user-reported issues

## Post-Deployment

### Key Rotation (Quarterly)
- [ ] Q1: Rotate CONTENT_MASTER_KEY
- [ ] Q2: Rotate SESSION_TOKEN_SECRET
- [ ] Q3: Rotate both (coordinated)
- [ ] Q4: Security audit