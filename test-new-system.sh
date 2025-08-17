#!/bin/bash

# Test script for the new lean interaction system
# Replace YOUR_JWT_TOKEN with a real user token

JWT_TOKEN="eyJhbGciOiJIUzI1NiIsImtpZCI6IkJ3MTIvWTRsOU9lUnk4UVQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3ptc3FzY3hxeGxoaGVoendieWx2LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJjNWVmMDdkMi0xZjBiLTQxYzgtYWE2OS0wOWY2MmI5NGRlMGMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU1NDUwNTAyLCJpYXQiOjE3NTU0NDY5MDIsImVtYWlsIjoicmlnb3Jpb25wbGNAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6InJpZ29yaW9ucGxjQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiTmF0aSIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiYzVlZjA3ZDItMWYwYi00MWM4LWFhNjktMDlmNjJiOTRkZTBjIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTU0MzAwMzN9XSwic2Vzc2lvbl9pZCI6IjY5ODExNmIwLTVhMmYtNGViMi1iZjMwLTljZWJkOGRlYTVlYiIsImlzX2Fub255bW91cyI6ZmFsc2V9.gW0Hgol0yIvPjmc3KL665esq0903XSIVbqzC9Hehf2k"
BASE_URL="https://zmsqscxqxlhhehzwbylv.supabase.co/functions/v1"

echo "🧪 Testing New Lean Interaction System"
echo "======================================"

echo ""
echo "1️⃣ Testing content/manifest endpoint..."
curl -X POST "$BASE_URL/content" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"route":"manifest"}' \
  --silent | jq '.'

echo ""
echo "2️⃣ Testing content/pack endpoint..."
curl -X POST "$BASE_URL/content" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"route":"pack","id":"core","hash":"3f7a2"}' \
  --silent | jq '.'

echo ""
echo "3️⃣ Testing attempts-batch endpoint..."
curl -X POST "$BASE_URL/attempts-batch" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
        "idempotency_key": "'$(uuidgen)'"
      },
      {
        "question_public_id": "MATH-002", 
        "attempt_number": 1,
        "duration_seconds": 32,
        "is_correct": true,
        "confidence_level": 4,
        "hint_checked": false,
        "solution_checked": false,
        "objective_progress": 78,
        "bookmarked": false,
        "idempotency_key": "'$(uuidgen)'"
      }
    ]
  }' \
  --silent | jq '.'

echo ""
echo "4️⃣ Testing single log-interaction endpoint..."
curl -X POST "$BASE_URL/log-interaction" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": "MATH-003",
    "is_correct": true,
    "time_spent_seconds": 67,
    "confidence_level": 5,
    "hint_checked": false,
    "solution_checked": true,
    "objective_progress": 82,
    "bookmarked": false,
    "idempotency_key": "'$(uuidgen)'"
  }' \
  --silent | jq '.'

echo ""
echo "5️⃣ Testing idempotency (sending same request twice)..."
IDEM_KEY=$(uuidgen)
echo "Using idempotency key: $IDEM_KEY"

echo "First request:"
curl -X POST "$BASE_URL/attempts-batch" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "question_public_id": "MATH-IDEM-TEST",
        "attempt_number": 1,
        "duration_seconds": 99,
        "is_correct": false,
        "confidence_level": 2,
        "hint_checked": true,
        "solution_checked": true,
        "objective_progress": 50,
        "idempotency_key": "'$IDEM_KEY'"
      }
    ]
  }' \
  --silent | jq '.'

echo "Second request (should not create duplicate):"
curl -X POST "$BASE_URL/attempts-batch" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "question_public_id": "MATH-IDEM-TEST",
        "attempt_number": 1,
        "duration_seconds": 99,
        "is_correct": false,
        "confidence_level": 2,
        "hint_checked": true,
        "solution_checked": true,
        "objective_progress": 50,
        "idempotency_key": "'$IDEM_KEY'"
      }
    ]
  }' \
  --silent | jq '.'

echo ""
echo "✅ Test completed!"
echo "💡 Check your Supabase dashboard to verify:"
echo "   - question_interactions table has the test data"
echo "   - bookmarks table has bookmarked questions"
echo "   - No duplicate entries with same idempotency_key"