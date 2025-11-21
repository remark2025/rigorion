import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";
import { create, getNumericDate, Header, Payload } from "https://deno.land/x/djwt@v2.9/mod.ts";

const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

const allowedOrigins = new Set<string>([
  "http://localhost:3000",
  "http://localhost:5173",
  "https://sat-cram.com",
  "https://app.sat-cram.com",
]);

interface EncryptedPackEntry {
  id: string;
  questionCount: number;
  keyVersion: string;
  packFile: string;
  manifestFile: string;
  hash: string;
  size: number;
  lastModified: string;
}

interface EncryptedManifest {
  version: string;
  buildTime: string;
  keyVersion: string;
  packs: Record<string, EncryptedPackEntry>;
}

let cachedManifest: { data: EncryptedManifest; fetchedAt: number } | null = null;
const MANIFEST_CACHE_TTL_MS = 5 * 60 * 1000;

const encoder = new TextEncoder();

function decodeBase64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function encodeBytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function hkdfSha256(
  ikm: Uint8Array,
  salt: Uint8Array,
  info: Uint8Array,
  length: number,
): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const derivedBits = await crypto.subtle.deriveBits({
    name: "HKDF",
    hash: "SHA-256",
    salt,
    info,
  }, keyMaterial, length * 8);
  return new Uint8Array(derivedBits);
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function fetchEncryptedManifest(): Promise<EncryptedManifest> {
  if (cachedManifest && Date.now() - cachedManifest.fetchedAt < MANIFEST_CACHE_TTL_MS) {
    return cachedManifest.data;
  }

  const manifestUrl = Deno.env.get("ENCRYPTED_MANIFEST_URL");
  if (!manifestUrl) {
    throw new Error("ENCRYPTED_MANIFEST_URL is not configured");
  }

  const response = await fetch(manifestUrl, { headers: { "Cache-Control": "no-cache" } });
  if (!response.ok) {
    throw new Error(`Failed to fetch encrypted manifest: ${response.status}`);
  }

  const data = await response.json() as EncryptedManifest;
  cachedManifest = { data, fetchedAt: Date.now() };
  return data;
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isDevelopment = origin?.startsWith("http://localhost:") ?? false;
  const allowed = origin && (allowedOrigins.has(origin) || isDevelopment);
  if (!allowed) {
    return { "Vary": "Origin" };
  }
  return {
    "Access-Control-Allow-Origin": origin ?? "",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function securityHeaders(): Record<string, string> {
  return {
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Referrer-Policy": "same-origin",
  };
}

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimiter.get(identifier);
  if (!entry || now > entry.resetTime) {
    rateLimiter.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count += 1;
  return true;
}

function rateLimitHeaders(identifier: string): Record<string, string> {
  const entry = rateLimiter.get(identifier);
  if (!entry) return {};
  return {
    "X-RateLimit-Limit": RATE_LIMIT_MAX.toString(),
    "X-RateLimit-Remaining": Math.max(0, RATE_LIMIT_MAX - entry.count).toString(),
    "X-RateLimit-Reset": Math.max(0, Math.floor((entry.resetTime - Date.now()) / 1000)).toString(),
  };
}

interface TokenRequestBody {
  packIds?: string[];
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { ...cors, ...securityHeaders() } });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { ...cors, ...securityHeaders() },
    });
  }

  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing bearer token" }), {
        status: 401,
        headers: { ...cors, ...securityHeaders(), "Content-Type": "application/json" },
      });
    }

    const jwtToken = authHeader.replace("Bearer ", "");
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateKey = `session:${clientIP}`;
    if (!checkRateLimit(rateKey)) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...cors, ...securityHeaders(), ...rateLimitHeaders(rateKey), "Content-Type": "application/json", "Retry-After": "60" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: authData, error: authError } = await supabase.auth.getUser(jwtToken);
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...cors, ...securityHeaders(), "Content-Type": "application/json" },
      });
    }

    const manifest = await fetchEncryptedManifest();
    const requested: TokenRequestBody = await req.json().catch(() => ({}));
    const requestedPackIds = requested.packIds && requested.packIds.length > 0
      ? requested.packIds
      : Object.keys(manifest.packs);

    const masterKeyBase64 = Deno.env.get("CONTENT_MASTER_KEY");
    if (!masterKeyBase64) {
      throw new Error("CONTENT_MASTER_KEY is not configured");
    }

    const masterKey = decodeBase64ToBytes(masterKeyBase64);
    if (masterKey.length !== 32) {
      throw new Error("CONTENT_MASTER_KEY must be 32 bytes");
    }

    const infoPack = encoder.encode("content-pack");
    const packClaims: Record<string, { keyVersion: string; key: string; hash: string; questionCount: number }> = {};

    for (const packId of requestedPackIds) {
      const packEntry = manifest.packs[packId];
      if (!packEntry) continue;
      const salt = encoder.encode(`pack:${packId}`);
      const packKey = await hkdfSha256(masterKey, salt, infoPack, 32);
      packClaims[packId] = {
        keyVersion: packEntry.keyVersion,
        key: encodeBytesToBase64(packKey),
        hash: packEntry.hash,
        questionCount: packEntry.questionCount,
      };
    }

    if (Object.keys(packClaims).length === 0) {
      return new Response(JSON.stringify({ error: "No allowed packs" }), {
        status: 403,
        headers: { ...cors, ...securityHeaders(), "Content-Type": "application/json" },
      });
    }

    const sessionSecretBase64 = Deno.env.get("SESSION_TOKEN_SECRET");
    if (!sessionSecretBase64) {
      throw new Error("SESSION_TOKEN_SECRET missing");
    }
    const sessionSecret = decodeBase64ToBytes(sessionSecretBase64);

    const now = getNumericDate(0);
    const exp = getNumericDate(60 * 60 * 8); // 8 hours
    const ipHash = await sha256Hex(`${clientIP}:${sessionSecretBase64}`);

    const payload: Payload = {
      iss: "question-vault",
      sub: authData.user.id,
      aud: "question-content",
      iat: now,
      exp,
      packs: packClaims,
      ctx: {
        tier: authData.user.app_metadata?.tier || "standard",
        ipHash,
      },
    };

    const header: Header = { alg: "HS256", typ: "JWT" };
    const token = await create(header, payload, sessionSecret);

    const responseBody = {
      token,
      expiresAt: exp,
      packs: Object.entries(packClaims).map(([packId, info]) => ({
        id: packId,
        keyVersion: info.keyVersion,
        questionCount: info.questionCount,
        hash: info.hash,
      })),
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        ...cors,
        ...securityHeaders(),
        ...rateLimitHeaders(rateKey),
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("❌ session token error", error);
    return new Response(JSON.stringify({ error: "Unable to issue session token" }), {
      status: 500,
      headers: { ...securityHeaders(), "Content-Type": "application/json" },
    });
  }
});
