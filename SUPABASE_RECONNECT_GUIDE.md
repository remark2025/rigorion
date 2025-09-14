# Supabase JWT Token Expired - Reconnection Guide

## Issue
The JWT token has expired, which means you need to re-authenticate with Supabase.

## Solution Steps

### 1. Re-login to Supabase CLI
```bash
npx supabase login
```
This will open your browser for authentication.

### 2. Link to Your Project (if needed)
```bash
npx supabase projects list
npx supabase link --project-ref zmsqscxqxlhhehzwbylv
```

### 3. Verify Connection
```bash
npx supabase status
```

### 4. Run the Comprehensive Questions Insert
Once connected, go to your Supabase Dashboard SQL Editor and run:
- `/home/nati/git/comprehensive_questions_insert.sql`

### 5. Deploy Edge Function (if needed)
```bash
npx supabase functions deploy get-questions
```

## What's Ready to Insert

The `comprehensive_questions_insert.sql` file contains:

- ✅ **5 diverse SAT questions** across Math, Reading, and Writing
- ✅ **Interactive solutions** with step builders and visualizations
- ✅ **3 content packs** for organization
- ✅ **1 reading passage** about climate change
- ✅ **Detailed solution steps** for each question
- ✅ **Rich interactive render payloads** for frontend

## Expected Result After Insert

Your app will show **6 total questions** (including the original projectile motion):
1. **MATH-ALG-QUAD-001** - Projectile motion (existing)
2. **MATH-COMPLEX-001** - Complex numbers with interactive plane
3. **MATH-QUAD-GRAPH-001** - Quadratic vertex finder
4. **MATH-STATS-001** - Normal distribution analyzer
5. **READ-CLIMATE-001** - Reading comprehension with passage
6. **WRITE-GRAMMAR-001** - Writing style and tone

All with full interactive solutions and step-by-step guidance!