#!/bin/bash

# Test script to verify entitlement system end-to-end
# Usage: ./test-entitlement.sh <JWT_TOKEN>

set -e

JWT_TOKEN=${1:-"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJpYXQiOjE3MzQ0NTA2MDB9.example"}
BASE_URL="https://your-project.supabase.co/functions/v1"

echo "🧪 Testing Content Entitlement System"
echo "JWT: ${JWT_TOKEN:0:20}..."
echo ""

# Test 1: Free pack access
echo "📦 Test 1: Free pack (core) - should return 200"
curl -s -w "Status: %{http_code}\n" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  "$BASE_URL/content?id=core" | head -5

echo ""

# Test 2: Premium pack access (should fail for free user)
echo "💎 Test 2: Premium pack (premium-advanced) - should return 403 for free user"
curl -s -w "Status: %{http_code}\n" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  "$BASE_URL/content?id=premium-advanced" | jq '.error, .entitled, .upgrade_required' 2>/dev/null || echo "Response not JSON"

echo ""

# Test 3: Invalid JWT
echo "🚫 Test 3: Invalid JWT - should return 401"
curl -s -w "Status: %{http_code}\n" \
  -H "Authorization: Bearer invalid-jwt" \
  -H "Content-Type: application/json" \
  "$BASE_URL/content?id=core" | jq '.error' 2>/dev/null || echo "Response not JSON"

echo ""

# Test 4: Missing pack
echo "❓ Test 4: Non-existent pack - should return 404"
curl -s -w "Status: %{http_code}\n" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  "$BASE_URL/content?id=non-existent" | jq '.error' 2>/dev/null || echo "Response not JSON"

echo ""

# Test 5: ETag caching
echo "🏷️  Test 5: ETag caching - first request"
RESPONSE=$(curl -s -i -H "Authorization: Bearer $JWT_TOKEN" "$BASE_URL/content?id=core")
ETAG=$(echo "$RESPONSE" | grep -i "etag:" | cut -d' ' -f2 | tr -d '\r')
echo "ETag: $ETAG"

echo ""
echo "🏷️  Test 5b: ETag caching - 304 Not Modified"
curl -s -w "Status: %{http_code}\n" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "If-None-Match: $ETAG" \
  "$BASE_URL/content?id=core"

echo ""
echo "✅ Entitlement tests completed!"
echo ""
echo "Expected results:"
echo "- Test 1: 200 (free pack accessible)"
echo "- Test 2: 403 with upgrade_required: true (premium pack blocked)"
echo "- Test 3: 401 (invalid auth)"
echo "- Test 4: 404 (pack not found)"
echo "- Test 5: 200 with ETag header"
echo "- Test 5b: 304 (not modified)"