import { SUPABASE_URL } from "@/integrations/supabase/client";

export type SecurityEventType =
  | "session_token_success"
  | "session_token_error"
  | "decrypt_failure"
  | "integrity_violation";

export type SecurityEventSeverity = "info" | "warning" | "error";

interface SecurityEventPayload {
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const DEFAULT_ENDPOINT = `${SUPABASE_URL}/functions/v1/security-events`;
const SECURITY_ENDPOINT =
  import.meta.env.VITE_SECURITY_EVENT_URL || DEFAULT_ENDPOINT;

function canUseBeacon(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function";
}

export async function recordSecurityEvent(
  type: SecurityEventType,
  severity: SecurityEventSeverity,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const payload: SecurityEventPayload = {
    type,
    severity,
    timestamp: new Date().toISOString(),
    metadata,
  };

  if (!SECURITY_ENDPOINT) {
    if (severity === "error") {
      console.error("[security]", type, metadata);
    } else {
      console.warn("[security]", type, metadata);
    }
    return;
  }

  try {
    if (canUseBeacon()) {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon(SECURITY_ENDPOINT, blob);
      return;
    }

    await fetch(SECURITY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    console.warn("Failed to record security event", type, error);
  }
}
