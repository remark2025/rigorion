#!/bin/bash

# Upload content packs to Supabase Storage
# You need to provide your SERVICE_ROLE_KEY

set -e

# Configuration
PROJECT_REF="zmsqscxqxlhhehzwbylv"
BUCKET="question-packs"
BASE_URL="https://${PROJECT_REF}.supabase.co/storage/v1/object"

# You need to set this environment variable or provide it as argument
SERVICE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-$1}

if [ -z "$SERVICE_KEY" ]; then
  echo "❌ Error: SERVICE_ROLE_KEY required"
  echo "Usage: ./upload-packs.sh <SERVICE_ROLE_KEY>"
  echo "Or set SUPABASE_SERVICE_ROLE_KEY environment variable"
  exit 1
fi

echo "📦 Uploading content packs to Supabase Storage..."
echo "Project: $PROJECT_REF"
echo "Bucket: $BUCKET"
echo ""

# Upload manifest.json
echo "📄 Uploading manifest.json..."
curl -X POST "$BASE_URL/$BUCKET/manifest.json" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -T "content/build/manifest.json"

if [ $? -eq 0 ]; then
  echo "✅ Manifest uploaded successfully"
else
  echo "❌ Failed to upload manifest"
  exit 1
fi

echo ""

# Upload pack files
echo "📦 Uploading pack files..."

for pack_file in content/build/packs/*.json; do
  if [ -f "$pack_file" ]; then
    filename=$(basename "$pack_file")
    echo "📦 Uploading $filename..."
    
    curl -X POST "$BASE_URL/$BUCKET/packs/$filename" \
      -H "Authorization: Bearer $SERVICE_KEY" \
      -H "Content-Type: application/json" \
      -T "$pack_file"
    
    if [ $? -eq 0 ]; then
      echo "✅ $filename uploaded successfully"
    else
      echo "❌ Failed to upload $filename"
    fi
    echo ""
  fi
done

echo "🎉 Upload complete!"
echo ""
echo "Now test with: ./test-entitlement.sh"