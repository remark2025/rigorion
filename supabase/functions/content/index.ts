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
      // Optional: Check premium access for paid content
      // const { data: subscription } = await supabase
      //   .rpc('get_subscription_info', { user_uuid: user.id });
      // if (!subscription?.has_premium_access) {
      //   return json({ error: "Premium access required" }, 403);
      // }

      const path = `packs/${id}@${hash}.json`;
      const { data, error } = await supabase.storage.from("question-packs").download(path);
      if (error) return json({ error: "Pack not found" }, 404);
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