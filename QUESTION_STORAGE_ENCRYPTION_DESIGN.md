# Question Storage Compression & Encryption Design

## 1. Why we need this
- Questions and passages are currently shipped as plain JSON packs in `content/build/packs` via `scripts/build-content-packs.js`. Anyone with access to the site can scrape and redistribute them.
- Payloads are heavy (~MB per pack) which hurts Time-to-First-Question on low bandwidth or mobile networks.
- We need a zero-secret-in-repo approach: the website may host the encrypted data, but only authorized runtimes can decrypt a question right before it is rendered.

## 2. Goals & non-goals
**Goals**
1. Store every question/passage in a compressed + encrypted format that can sit in public storage (Supabase Storage, CDN, or `public/`).
2. Allow the runtime to decrypt *one* question at a time when the UI needs to render it (question navigator, review modal, analytics, etc.).
3. Add cryptographic auditability: integrity, per-question hashes, rotation, revocation, and tamper detection.
4. Maintain DX parity with the current content pipeline and keep the build + deploy steps reproducible inside CI.

**Non-goals**
- Preventing a user from exfiltrating a question after it is shown on screen (watermarking/DRM is a separate initiative).
- Encrypting answers that are computed in real time (AI explanations, live hints).
- Replacing Supabase RLS or other backend auth layers.

## 2.1 Threat model
### In-scope threats
- Mass scraping by anonymous visitors or compromised user accounts trying to steal the entire catalog.
- Attackers replaying or tampering with ciphertext/manifest blobs hosted on public storage/CDNs.
- Insider threats limited to repo/CI access but without runtime secrets.
- Compromised clients trying to re-use question tokens or hoard wrapped keys beyond their TTL.

### Out-of-scope threats
- Fully compromised browsers/OS kernels or physical device access.
- Nation-state actors with capability to compromise TLS globally.
- Social engineering of support staff or end users.
- Side channels that require privileged process injection (although we still minimize data persistence).

## 3. High-level architecture
```
content/source/*.json --(normalize)--> canonical question objects
   --(chunk+encode)--> Question Binary Records (QBR)
   --(brotli compress)--> Compressed Question Records (CQR)
   --(AES-256-GCM encrypt)--> Sealed Question Records (SQR)
   --(package)--> pack.bin + pack.manifest.json + master manifest
```

- `pack.bin` is a concatenation of SQR blocks ordered by question index.
- `pack.manifest.json` contains lightweight metadata for each question: offsets, lengths, iv, authTag, HKDF salt, SHA-256 of plaintext, semantic tags (skill, difficulty, domain).
- `content/build/manifest.json` now references the encrypted pack, manifest, per-pack key id, and total question count (extending what `scripts/build-content-packs.js` already emits).
- The runtime only downloads pack manifests initially; it lazily range-requests the section of `pack.bin` that corresponds to the targeted question when needed.

## 4. Build-time pipeline additions
1. **Normalization** (existing): keep using `ContentPackBuilder.processPack()` but persist the normalized question array instead of writing JSON immediately.
2. **Chunk layout**: build an array of `{ questionId, normalizedQuestion }`. Each question is encoded as CBOR/MessagePack to shrink structural overhead and maintain deterministic ordering (needed for hashes).
3. **Compression**: run Brotli (quality 9–11) with a custom dictionary derived from the schema keys (`stem`, `options[].label`, etc.). This gives better ratios than gzip on highly repetitive payloads.
4. **Encryption**: use WebCrypto (Node 20+) or libsodium to encrypt each compressed blob:
   - Master pack key `K_pack` is created via HKDF(master_content_key, packId).
   - Per-question key `K_q` = HKDF(K_pack, questionId || version).
   - Encrypt with AES-256-GCM, random 96-bit IV per question, 128-bit auth tag.
   - Associated data = `questionId || packId || plaintext_sha256` to prevent swapping.
5. **Packaging**: append ciphertext bytes and store `[offset,length]` in `pack.manifest.json`. Keep manifest JSON small (no ciphertext).
6. **Integrity & analytics**: log `plaintext_sha256`, `ciphertext_sha256`, `brotli_ratio`, `buildVersion` for monitoring and change tracking.
7. **Tooling**: extend `scripts/build-content-packs.js` to accept `--encrypt` flag. Place shared crypto helpers in `scripts/lib/crypto.ts` to avoid duplicating logic with `encrypt-json.ts`.

## 5. Key management
- Define `CONTENT_MASTER_KEY` (32-byte base64) in `.env.local`, `.env.staging`, `.env.prod`. Never commit these.
- Generate the master key with `openssl rand -base64 32` (entropy documented in the runbook) and store the command outputs inside the secrets manager as the system of record.
- During CI/CD, fetch keys from a secret manager (Supabase secrets, Doppler, AWS Secrets Manager). The build step fails if the key is missing.
- Persist `packKeyId` and `keyVersion` inside manifests for future rotation.
- **Rotation**: publish new packs by bumping `keyVersion`, re-encrypting, and updating manifest. Old packs stay decryptable until revoked.
- **Server-side access control**: a Supabase Edge Function (`functions/get-question-token.ts`) issues signed short-lived tokens that wrap `K_q` with a per-session key (XChaCha20-Poly1305). Tokens contain `questionId`, `packId`, `exp`, `userId`, `entitlementScope`, and the wrapped question key. The browser never sees the master key.
- **Escrow & recovery**: store an encrypted copy of the master key inside an HSM-backed vault (KMS wrapped) plus a sealed-secret for DR drills so rotation can happen even if CI secrets are wiped.
- **Compromise playbook**: on suspected key leak, revoke all tokens, push a CI job that regenerates packs with a new `keyVersion`, invalidate CDN cache, and alert SRE via PagerDuty.

## 6. Runtime (client) flow
1. **Boot**: the app downloads `content/build/manifest.json` (already part of the bundle) and hydrates question metadata into the `QuestionsContext` cache.
2. **Request question**:
   - UI asks for `questionId`.
   - `useQuestions()` checks IndexedDB (via `dexie` + `dexie-encrypted`) for a cached ciphertext block; if missing, it fetches `[offset,length]` using HTTP range requests (works on Supabase Storage/CDN).
3. **Key retrieval**: call the `get-question-token` Edge Function with `questionId`. The function enforces RLS/entitlements, logs access, applies per-user/IP rate limits, and returns a token containing the wrapped key + IV/manifest references.
4. **Decryption**:
   - Client unwraps `K_q` using the session key stored in memory (established during login via WebCrypto ECDH). Session key rotates every login and expires after 30 minutes of inactivity, forcing a fresh handshake.
   - Run AES-GCM decrypt with the metadata from the manifest.
   - Verify `plaintext_sha256` before trusting the question.
5. **Decompression & parsing**: run Brotli decompression (WASM `brotli-wasm` or native browser API) and decode CBOR to the `Question` TypeScript interface.
6. **Rendering**: push the hydrated question into React state for that screen.
7. **Caching**: store ciphertext + metadata (never plaintext) in IndexedDB + Service Worker cache. Store plaintext in-memory only, and wipe on route change or after TTL.
8. **Failure handling**: on decrypt/auth failures trigger a silent re-fetch once, then raise telemetry `integrity_violation`, purge the cached ciphertext (in case IndexedDB was tampered with), and surface a generic "Content temporarily unavailable" toast to avoid oracle attacks.
9. **Memory hygiene**: immediately zero-out buffers that held plaintext or keys using typed-array `fill(0)` before releasing references so GC can reclaim cleared memory.

## 7. Per-question rendering optimizations
- **Prefetch window**: when a user sits on question *n*, prefetch the encrypted bytes for *n+1* and request its token to hide latency.
- **Streaming explanations**: explanations can share the same record so that once decrypted, the UI has both the prompt and explanation without extra round-trips.
- **Partial packs**: extremely large packs can be split into shards (~50 questions) to keep `pack.bin` under 1 MB and to reduce range request overhead.

## 7.1 Storage strategies: CDN packs vs Supabase rows
We support two deployment modes for ~5k encrypted question objects. Both keep ciphertext public while revealing plaintext only at render time.

### A. Encrypted pack artifacts (CDN/Storage)

#### Build outputs & mechanics
- **Files**: `pack.bin` (concatenated ciphertext) + `pack.manifest.json` (offsets, IVs, hashes)
- **Hosting**: Supabase Storage, AWS S3 + CloudFront, or any CDN
- **Delivery**: HTTP range requests `bytes=1024-2048` for specific question slice
- **Size**: ~50-200 questions per pack, 500KB-2MB total per pack.bin

#### Performance characteristics
- **Compression**: Excellent (~70% reduction with Brotli dictionary across similar questions)
- **Latency**: 10-50ms range request vs 100-200ms full download
- **Bandwidth**: Minimal (only requested question bytes + manifest metadata)
- **Caching**: Perfect CDN edge caching, 99.9% cache hit rate after warmup

#### Operational details
- **Build time**: 30-60s to encrypt and package 1000 questions
- **Deploy**: Single artifact upload to CDN, atomic manifest update
- **Updates**: Requires full pack regeneration for any single question change
- **Monitoring**: CDN analytics, range request patterns, cache hit rates

#### Cost analysis (1M monthly question views)
- **CDN bandwidth**: ~$50-100/month (range requests + manifest)
- **Storage**: ~$5/month (encrypted packs)
- **Compute**: Build-time only, ~$10/month CI cost

### B. Supabase table/storage rows

#### Build outputs & mechanics  
- **Schema**: `encrypted_questions` table with `question_id`, `ciphertext_blob`, `iv`, `auth_tag`, `metadata_json`
- **Delivery**: RLS query + Storage object fetch or direct JSONB column read
- **Size**: Individual encrypted questions ~2-8KB each

#### Performance characteristics
- **Compression**: Good (per-question Brotli, ~50% reduction)
- **Latency**: 50-150ms per question (DB query + potential Storage fetch)
- **Bandwidth**: Higher overhead (HTTP headers per request, JSON envelope)
- **Caching**: Requires client-side LRU + aggressive IndexedDB strategy

#### Operational details
- **Build time**: 5-15s to insert/update questions individually
- **Deploy**: Row-by-row upserts, can update single questions instantly
- **Updates**: Granular single-question patches without affecting others
- **Monitoring**: Supabase dashboard, per-question access logs, RLS performance

#### Cost analysis (1M monthly question views)
- **Database**: ~$200-400/month (read operations, storage)
- **Bandwidth**: ~$100-200/month (individual fetches)
- **Compute**: Supabase Edge Function executions ~$50-100/month

### Detailed comparison matrix

| Factor | CDN Packs (A) | Supabase Rows (B) |
|--------|---------------|-------------------|
| **Performance** | 🏆 Excellent | ⚠️ Good |
| **Scalability** | 🏆 Infinite (CDN) | ⚠️ Limited (DB) |
| **Cost @ scale** | 🏆 Very low | ❌ High |
| **Update speed** | ❌ Slow (full rebuild) | 🏆 Instant |
| **CRUD tooling** | ❌ Complex | 🏆 Native SQL |
| **Analytics** | ⚠️ CDN logs only | 🏆 Rich per-question |
| **Audit trails** | ❌ Build-time only | 🏆 Full Supabase audit |
| **Content authoring** | ❌ Developer workflow | 🏆 CMS-friendly |

### Security considerations per mode

#### CDN Packs security profile
- **Attack surface**: Static files, range request abuse, manifest tampering
- **Mitigation**: WAF rate limiting, signed URLs, manifest integrity checks
- **Key exposure**: Zero (ciphertext is public, keys via token API)

#### Supabase Rows security profile  
- **Attack surface**: RLS bypass, bulk export, Storage ACL misconfiguration
- **Mitigation**: Strict RLS policies, per-user rate limits, audit logging
- **Key exposure**: Zero (same token API), but more attack vectors

### Hybrid deployment strategy

**Phase 1**: CDN packs for SAT Math/Reading core library (~3000 static questions)
- Best performance for high-volume study sessions
- Stable content with infrequent updates
- Proven at scale for exam prep platforms

**Phase 2**: Supabase rows for dynamic content
- AI-generated explanations and adaptive questions
- Instructor-authored custom problem sets  
- A/B testing variants and personalized content

**Technical bridge**: Both modes share identical:
- Key derivation logic (`K_q = HKDF(K_pack, questionId)`)
- Token API (`get-question-token` Edge Function)
- Client decryption flow (same `QuestionVaultService`)
- Cache strategies (IndexedDB for both ciphertext types)

**Migration path**: Pack ID routing allows seamless backend switching
```typescript
// Client automatically detects storage mode per pack
const storageMode = manifest.packs[packId].storage_mode; // 'cdn' | 'supabase'
const vault = new QuestionVaultService(storageMode);
```

### Final recommendation with rationale

**Default choice**: Start with **CDN packs (Mode A)** for the following reasons:

1. **Proven scale**: Handles 10M+ monthly question views without breaking sweat
2. **Cost efficiency**: 5-10x cheaper at scale than database-per-question 
3. **Performance**: Sub-50ms time-to-first-question vs 100-200ms with DB
4. **Security**: Simpler attack surface with fewer moving parts

**Switch to Supabase rows (Mode B)** when you need:
- Real-time content authoring (teacher dashboards, AI question generation)
- Granular analytics (per-question engagement, completion rates)  
- Frequent content updates (daily question variations, personalization)
- Rich metadata queries (skill tagging, difficulty progression)

Both paths maintain identical security properties and can coexist in the same application.

## 8. Telemetry & observability
- Emit structured security events whenever `get-question-token` is called, when rate limits trigger, when the client fails to decrypt, and when the hash check fails (fields: `userId`, `questionId`, `ip`, `ua`, `entitlementScope`).
- Track compression ratios, build sizes, and decrypt latency in Grafana dashboards.
- Add synthetic tests in CI to decrypt a random sample of questions to ensure manifests and pack files stay aligned.
- Feed the logs into anomaly detection that flags bulk-download attempts (token velocity > threshold) and geo anomalies.

### 8.1 Protection controls
- Edge function enforces per-user + per-IP rate limits (e.g., 30 question tokens/minute) with exponential backoff and alerts when thresholds are exceeded.
- DDoS resilience: run the function behind Supabase Edge rate limiter + CDN WAF, and pre-warm caches for manifests so bots never hit the origin for static blobs.
- Responses always include strict security headers (`CSP`, `HSTS`, `X-Frame-Options`) and never echo internal errors to the client.

## 9. Implementation roadmap
1. **Prototype (Week 1)**
   - Implement `scripts/lib/crypto.ts` helpers (HKDF, AES-GCM) and update `build-content-packs.js` to emit encrypted packs behind `--encrypt`.
   - Ship a CLI tool `node scripts/decrypt-question.js <packId> <questionId>` for local debugging.
2. **Edge function + client wiring (Week 2)**
   - Build `supabase/functions/get-question-token/index.ts` with RLS checks.
   - Add a `QuestionVaultService` in `src/services` that knows how to fetch ciphertext, cache it, request a token, and decrypt.
   - Update `QuestionsContext` to hydrate from the encrypted source instead of the plain JSON modules.
3. **Perf hardening (Week 3)**
   - Introduce prefetch window + IndexedDB caching.
   - Add Brotli dictionary tuning + fallback to gzip for Safari < 16.4.
4. **Security polish (Week 4)**
   - Automated rotation tests, failure alerts, and a runbook for re-encrypting packs.
   - Pen-test review to ensure secrets never land in logs/devtools.

## 10. Security testing & validation
- **Automated tests**: extend `scripts/test-security.sh` (new) to run Jest suites that verify unauthorized access fails, key rotation preserves readability, manifests align with ciphertext offsets, and decryption buffers are cleared.
- **Pen tests**: quarterly engagement that attempts to dump keys from browser memory, replay tokens, and tamper with manifests.
- **Chaos drills**: simulate CI secret loss, Supabase compromise, and CDN tampering to make sure the recovery+revocation playbook stays sharp.
- **Observability checks**: alert if decrypt failure rate > 0.5% or if rate limiters trip more than 5 times per minute.

## 11. Open questions
- Do we need offline access? If yes, we must persist wrapped keys securely (possibly via WebCrypto `CryptoKey` objects pinned in IndexedDB).
- How do we handle collaborative review sessions where multiple users need the same decrypted payload simultaneously? Consider server-side rendering that decrypts once and streams HTML.
- For AI-generated questions, do we reuse the same pipeline or maintain a separate dynamic service? Probably reuse but store the ciphertext in Supabase tables instead of static packs.
