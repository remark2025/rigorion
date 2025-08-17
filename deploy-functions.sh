#!/bin/bash

echo "🚀 Deploying Edge Functions..."

echo "📦 Deploying content function..."
supabase functions deploy content

echo "📦 Deploying attempts-batch function..."
supabase functions deploy attempts-batch

echo "📦 Deploying log-interaction function (updated)..."
supabase functions deploy log-interaction

echo "✅ All functions deployed!"
echo ""
echo "🔧 Next steps:"
echo "1. Run the SQL migration in Supabase SQL Editor"
echo "2. Create 'question-packs' storage bucket (private)"
echo "3. Upload manifest.json to the bucket root"
echo "4. Test with your JWT token"