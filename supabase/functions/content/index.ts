import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, if-none-match",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

function json(body: unknown, status = 200, additionalHeaders = {}) {
  return new Response(JSON.stringify(body), { 
    status, 
    headers: { 
      ...cors, 
      "Content-Type": "application/json",
      ...additionalHeaders
    }
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Auth (verify user JWT)
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !user) return json({ error: "Not authenticated" }, 401);

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const route = url.searchParams.get("route") || (id ? "pack" : "manifest");

  try {
    if (route === "manifest") {
      const { data, error } = await supabase.storage.from("question-packs").download("manifest.json");
      if (error) return json({ error: error.message }, 404);
      
      return new Response(data, { 
        status: 200, 
        headers: {
          ...cors,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300, s-maxage=60",
          "Vary": "Accept-Encoding"
        }
      });
    }

    if (route === "pack" && id) {
      // Define free vs paid packs
      const freePacks = ["core", "basic"]; // Whitelist of free packs
      const isPaidPack = !freePacks.includes(id);
      
      console.log(`Pack request: user_id=${user.id}, pack_id=${id}, paid_pack=${isPaidPack}`);
      
      // Check entitlement for paid packs
      if (isPaidPack) {
        const { data: subscription, error: subError } = await supabase
          .rpc('get_subscription_info', { user_uuid: user.id });
        
        if (subError) {
          console.error(`Subscription check failed: user_id=${user.id}, error=${subError.message}`);
          return json({ error: "Unable to verify subscription" }, 500);
        }
        
        // Parse the RPC response to get boolean value
        const hasAccess = subscription?.has_premium_access === true;
        console.log(`Entitlement check: user_id=${user.id}, pack_id=${id}, entitled=${hasAccess}, subscription_data=${JSON.stringify(subscription)}`);
        
        if (!hasAccess) {
          console.log(`Access denied: user_id=${user.id}, pack_id=${id}, entitled=false`);
          return json({ 
            error: "Premium access required",
            pack_id: id,
            entitled: false,
            upgrade_required: true
          }, 403);
        }
      } else {
        console.log(`Free pack access: user_id=${user.id}, pack_id=${id}, entitled=true`);
      }

      // Look for pack file in storage - try different hash formats
      let packData = null;
      let contentHash = "";
      let packPath = "";
      
      // Try to find the pack file (this would normally come from manifest)
      const possiblePaths = [
        `packs/${id}.json`,
        `${id}.json`
      ];
      
      for (const path of possiblePaths) {
        const { data, error } = await supabase.storage.from("question-packs").download(path);
        if (!error && data) {
          packData = data;
          packPath = path;
          
          // Generate content hash
          const textData = await data.text();
          const encoder = new TextEncoder();
          const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(textData));
          contentHash = Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
          break;
        }
      }
      
      if (!packData) {
        console.log(`Pack not found: pack_id=${id}, tried_paths=${possiblePaths.join(', ')}`);
        return json({ error: "Pack not found" }, 404);
      }
      
      // Check If-None-Match for 304 response
      const ifNoneMatch = req.headers.get('If-None-Match');
      if (ifNoneMatch === `"${contentHash}"`) {
        console.log(`304 Not Modified: user_id=${user.id}, pack_id=${id}, etag=${contentHash}`);
        return new Response(null, {
          status: 304,
          headers: {
            ...cors,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'ETag': `"${contentHash}"`,
            'Vary': 'Accept-Encoding'
          }
        });
      }
      
      console.log(`Pack served: user_id=${user.id}, pack_id=${id}, entitled=true, hash=${contentHash.substring(0, 8)}, path=${packPath}`);
      
      return new Response(packData, { 
        status: 200, 
        headers: {
          ...cors,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=31536000, immutable",
          "ETag": `"${contentHash}"`,
          "Vary": "Accept-Encoding"
        }
      });
    }

    return json({ error: "Invalid route or missing pack ID" }, 400);
  } catch (e: any) {
    console.error(`Content function error: ${e?.message}`, e);
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});