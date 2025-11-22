import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

interface SecurityEventPayload {
  type: "session_token_success" | "session_token_error" | "decrypt_failure" | "integrity_violation";
  severity: "info" | "warning" | "error";
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:5173", 
  "http://localhost:8081",
  "https://sat-cram.com",
  "https://app.sat-cram.com",
]);

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isDevelopment = origin?.startsWith("http://localhost:") ?? false;
  const allowed = origin && (allowedOrigins.has(origin) || isDevelopment);
  
  if (!allowed) {
    return { "Vary": "Origin" };
  }
  
  return {
    "Access-Control-Allow-Origin": origin ?? "",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function securityHeaders(): Record<string, string> {
  return {
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      headers: { ...cors, ...securityHeaders() } 
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { ...cors, ...securityHeaders() },
    });
  }

  try {
    // Parse the security event payload
    const payload: SecurityEventPayload = await req.json();
    
    // Validate required fields
    if (!payload.type || !payload.severity || !payload.timestamp) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields: type, severity, timestamp" 
      }), {
        status: 400,
        headers: { ...cors, ...securityHeaders(), "Content-Type": "application/json" },
      });
    }

    // Get client IP for context
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Enhanced event data with context
    const eventData = {
      ...payload,
      context: {
        ip: clientIP,
        userAgent,
        receivedAt: new Date().toISOString(),
        source: "question-vault",
      },
    };

    // Initialize Supabase client for logging
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      
      // Store in security_events table (create table if needed)
      const { error: dbError } = await supabase
        .from("security_events")
        .insert(eventData)
        .select();

      if (dbError) {
        console.warn("Failed to store security event in database:", dbError);
        // Continue execution - we'll still log to console
      }
    }

    // Always log to console for immediate visibility
    const logLevel = payload.severity === "error" ? "error" : 
                    payload.severity === "warning" ? "warn" : "info";
    
    console[logLevel as keyof Console](
      `🔒 Security Event [${payload.type}]:`,
      JSON.stringify(eventData, null, 2)
    );

    // For critical events, add extra alerting
    if (payload.severity === "error") {
      if (payload.type === "decrypt_failure" || payload.type === "integrity_violation") {
        console.error(`🚨 CRITICAL SECURITY EVENT: ${payload.type}`, payload.metadata);
      }
    }

    return new Response(JSON.stringify({ 
      status: "recorded",
      timestamp: new Date().toISOString() 
    }), {
      status: 200,
      headers: { 
        ...cors, 
        ...securityHeaders(), 
        "Content-Type": "application/json" 
      },
    });

  } catch (error) {
    console.error("❌ Security events endpoint error:", error);
    
    return new Response(JSON.stringify({ 
      error: "Failed to process security event" 
    }), {
      status: 500,
      headers: { 
        ...cors, 
        ...securityHeaders(), 
        "Content-Type": "application/json" 
      },
    });
  }
});