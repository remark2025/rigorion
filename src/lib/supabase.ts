
// lib/supabase.ts
// Re-export the supabase client from integrations to avoid duplicate instances
import { supabase } from '@/integrations/supabase/client';

export { supabase };
