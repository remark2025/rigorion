-- Check current database schema
-- Run this first to see what tables and columns actually exist

-- 1. List all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. If subscriptions table exists, show its columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'subscriptions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check for subscription-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%subscription%'
ORDER BY table_name;

-- 4. List all functions related to subscription
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%subscription%'
ORDER BY routine_name;