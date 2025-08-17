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

  // Auth (verify user JWT)
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !user) return json({ error: "Not authenticated" }, 401);

  const { route, id, hash } = await req.json().catch(() => ({}));

  try {
    if (route === "manifest") {
      const { data, error } = await supabase.storage.from("question-packs").download("manifest.json");
      if (error) return json({ error: error.message }, 404);
      const headers = {
        ...cors,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, s-maxage=60"
      };
      return new Response(data, { status: 200, headers });
    }

    if (route === "pack" && id && hash) {
      // Define free vs paid packs
      const freePacks = ["core", "basic"]; // Whitelist of free packs
      const isPaidPack = !freePacks.includes(id);
      
      console.log(`Pack request: user_id=${user.id}, pack_id=${id}, paid_pack=${isPaidPack}`);
      
      // Check entitlement for paid packs
      if (isPaidPack) {
        const { data: subscription, error: subError } = await supabase
          .rpc('get_subscription_info', { user_uuid: user.id });
        
        const hasAccess = subscription?.has_premium_access || false;
        console.log(`Entitlement check: user_id=${user.id}, pack_id=${id}, entitled=${hasAccess}`);
        
        if (subError) {
          console.error(`Subscription check failed: user_id=${user.id}, error=${subError.message}`);
          return json({ error: "Unable to verify subscription" }, 500);
        }
        
        if (!hasAccess) {
          console.log(`Access denied: user_id=${user.id}, pack_id=${id}, entitled=false`);
          return json({ 
            error: "Premium access required",
            pack_id: id,
            entitled: false,
            upgrade_required: true
          }, 403);
        }
      }

      const path = `packs/${id}@${hash}.json`;
      const { data, error } = await supabase.storage.from("question-packs").download(path);
      if (error) {
        console.log(`Pack not found: pack_id=${id}, hash=${hash}, error=${error.message}`);
        return json({ error: "Pack not found" }, 404);
      }
      
      console.log(`Pack served: user_id=${user.id}, pack_id=${id}, entitled=true`);
      const headers = {
        ...cors,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": `"${hash}"`
      };
      return new Response(data, { status: 200, headers });
    }

    return json({ error: "Invalid route" }, 400);
  } catch (e: any) {
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});