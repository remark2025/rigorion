import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" }});
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Auth
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !user) return json({ error: "Not authenticated" }, 401);

  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body?.items) ? body.items : [];
  
  // Validation
  if (items.length === 0) return json({ error: "No items provided" }, 400);
  
  const MAX_BATCH_SIZE = 50;
  if (items.length > MAX_BATCH_SIZE) {
    return json({ 
      error: `Batch too large. Maximum ${MAX_BATCH_SIZE} items allowed.`,
      max_batch_size: MAX_BATCH_SIZE,
      received: items.length,
      suggestion: `Split into ${Math.ceil(items.length / MAX_BATCH_SIZE)} smaller batches`
    }, 413);
  }

  // Normalize + basic validation
  const rows = items.map((it: any) => ({
    user_id: user.id,
    question_public_id: String(it.question_public_id || it.question_id), // Handle both field names
    attempt_number: Number(it.attempt_number ?? 1),
    attempted_at: it.attempted_at ?? new Date().toISOString(),
    duration_seconds: Math.max(0, Math.min(3600, Number(it.duration_seconds || it.time_spent_seconds || 0))), // Handle both field names
    is_correct: typeof it.is_correct === "boolean" ? it.is_correct : null,
    confidence_level: it.confidence_level ?? null,
    hint_checked: !!it.hint_checked,
    solution_checked: !!it.solution_checked,
    objective_progress: it.objective_progress ? Math.max(0, Math.min(100, Number(it.objective_progress))) : null,
    idempotency_key: it.idempotency_key || crypto.randomUUID()
  }));

  try {
    // Process bookmarks first (separate table)
    const bookmarkedItems = items.filter((it: any) => it.bookmarked);
    if (bookmarkedItems.length > 0) {
      const bookmarkRows = bookmarkedItems.map((it: any) => ({
        user_id: user.id,
        question_public_id: String(it.question_public_id || it.question_id)
      }));
      
      // Upsert bookmarks (ignore conflicts)
      await supabase
        .from("bookmarks")
        .upsert(bookmarkRows, { onConflict: "user_id,question_public_id" });
    }

    // Idempotent upsert for question interactions:
    // 1) Try insert; conflicts on (user_id, idempotency_key) are ignored
    const { error: insertErr } = await supabase
      .from("question_interactions")
      .insert(rows, { returning: "minimal", defaultToNull: false })
      .select(); // ensures Deno runtime sends a single request

    if (insertErr && !String(insertErr.message).includes("duplicate key")) {
      console.error("Insert error:", insertErr);
      return json({ error: insertErr.message }, 500);
    }

    // 2) For already-inserted idempotent keys, we're done (exactly-once achieved)
    return json({ 
      success: true, 
      processed: rows.length,
      bookmarks_processed: bookmarkedItems.length
    });

  } catch (error: any) {
    console.error("Batch processing error:", error);
    return json({ error: error?.message ?? "Unknown error" }, 500);
  }
});