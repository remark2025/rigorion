# Edge Function Deployment Instructions

## Manual Deployment Steps

Since you need to manually deploy the Edge Function, here are the instructions:

### 1. Deploy the Edge Function

```bash
# First login to Supabase (if not already logged in)
npx supabase login

# Deploy the get-questions function
npx supabase functions deploy get-questions
```

### 2. Verify Deployment

After deployment, test the function directly:

```bash
# Test the Edge Function endpoint
curl -X GET "https://[YOUR_PROJECT_ID].supabase.co/functions/v1/get-questions" \
  -H "Authorization: Bearer [YOUR_ANON_KEY]" \
  -H "Content-Type: application/json"
```

Replace:
- `[YOUR_PROJECT_ID]` with your actual Supabase project ID
- `[YOUR_ANON_KEY]` with your Supabase anon key

### 3. Expected Response

You should get a response like:

```json
{
  "questions": [
    {
      "id": "MATH-ALG-QUAD-001",
      "content": "A ball is thrown upward...",
      "interactiveSolution": {
        "renderPayload": { ... }
      }
    }
  ],
  "success": true,
  "count": 1
}
```

### 4. Frontend Integration

The frontend has been updated to:

1. **First try**: Edge Function (bypasses PostgREST completely)
2. **Second try**: RPC Function (bypasses schema cache)  
3. **Third try**: Direct database access
4. **Fourth try**: Legacy secure service
5. **Fallback**: Sample questions (25 hardcoded)

### 5. Verify Frontend Works

After deploying the Edge Function:

1. Open your app in the browser
2. Go to the Practice page
3. Check browser console - you should see:
   ```
   🚀 Attempting to load questions using Edge Function...
   Edge Function test result: true
   🎯 Loaded 1 questions from Edge Function!
   First question: { id: "MATH-ALG-QUAD-001", content: "A ball is thrown upward..." }
   ```

4. The interactive question with projectile motion should display instead of the 25 sample questions

## Troubleshooting

If the Edge Function fails:

1. **Check deployment logs**:
   ```bash
   npx supabase functions logs get-questions
   ```

2. **Check browser network tab** for the Edge Function call

3. **Check console logs** for detailed error messages

4. The app will automatically fall back to other methods if the Edge Function fails

## Function Configuration

The Edge Function is configured to:
- Use service role key for direct database access (bypasses RLS)
- Return transformed questions compatible with frontend
- Include CORS headers for browser access
- Handle errors gracefully

Once deployed, your app should finally show the interactive database question instead of the hardcoded sample questions!