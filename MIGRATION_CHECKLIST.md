# Migration Checklist for Correct Supabase Project

## Project Details
- **Correct Project**: `zmsqscxqxlhhehzwbylv.supabase.co` 
- **Wrong Project**: `eantvimmgdmxzwrjwrop.supabase.co`

## Step 1: Database Migrations
Run these migration files in order in the Supabase SQL Editor:

1. `/home/nati/git/supabase/migrations/20241201_phase1_enums.sql`
2. `/home/nati/git/supabase/migrations/20241201_phase2_core_tables.sql`
3. `/home/nati/git/supabase/migrations/20241201_phase3_relationships.sql`
4. `/home/nati/git/supabase/migrations/20241201_phase4_indexes.sql`
5. `/home/nati/git/supabase/migrations/20241201_phase5_rls_policies.sql`
6. `/home/nati/git/supabase/migrations/20241201_phase6_search_functions.sql`
7. `/home/nati/git/supabase/migrations/20241201_phase7_additional_indexes.sql`
8. `/home/nati/git/supabase/migrations/20241201_phase8_cleanup.sql`

## Step 2: Insert Sample Data
Run these files:

1. `/home/nati/git/sample_question_insert.sql` - Interactive sample question
2. `/home/nati/git/test-manual-access.sql` - Manual access function

## Step 3: Verify Database
Run this verification:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('questions', 'content_packs', 'interactive_solutions');

-- Check sample data
SELECT public_id, content, has_interactive FROM questions LIMIT 1;

-- Test the function
SELECT public.get_sample_question();
```

## Step 4: Deploy Edge Function
```bash
# Make sure you're connected to the correct project
npx supabase projects list
npx supabase link --project-ref zmsqscxqxlhhehzwbylv

# Deploy the function
npx supabase functions deploy get-questions
```

## Expected Result
After completing these steps, the frontend should:
1. Successfully call the Edge Function
2. Load the interactive projectile motion question 
3. Display "A ball is thrown upward..." instead of sample questions
4. Show interactive solution features

## Files Ready for Migration
- ✅ All 8 migration phases
- ✅ Sample question with interactive solution
- ✅ Manual access function
- ✅ Edge Function with proper CORS
- ✅ Frontend services configured for correct project