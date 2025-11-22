import { SUPABASE_URL } from "@/integrations/supabase/client";
import type { Question } from "@/types/QuestionInterface";
import {
  getCachedPackBuffer,
  storePackBuffer,
  isPackCacheSupported,
} from "@/services/encryptedPackCache";
import { recordSecurityEvent } from "@/services/securityTelemetry";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const DEFAULT_MANIFEST_URL =
  import.meta.env.VITE_ENCRYPTED_MANIFEST_URL || "/content/encrypted/manifest.json";
const DEFAULT_CONTENT_BASE =
  import.meta.env.VITE_ENCRYPTED_CONTENT_BASE_URL ||
  DEFAULT_MANIFEST_URL.replace(/[^/]+$/, "");
const SESSION_TOKEN_ENDPOINT =
  import.meta.env.VITE_SESSION_TOKEN_URL || `${SUPABASE_URL}/functions/v1/get-session-token`;

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

interface QuestionIndexEntry {
  packId: string;
  entryIndex: number;
}

interface EncryptedManifest {
  version: string;
  buildTime: string;
  keyVersion: string;
  packs: Record<string, EncryptedPackEntry>;
  questions?: Record<string, QuestionIndexEntry>;
}

interface PackManifestEntry {
  questionId: string;
  offset: number;
  length: number;
  iv: string;
  authTag: string;
  aadHash: string;
  plaintextSha256: string;
  ciphertextSha256: string;
  rawBytes: number;
  compressedBytes: number;
  ciphertextBytes: number;
  brotliRatio: number;
}

interface PackManifest {
  packId: string;
  keyVersion: string;
  cipher: string;
  compression: string;
  encoding: string;
  questionCount: number;
  totalRawBytes: number;
  totalCompressedBytes: number;
  totalCiphertextBytes: number;
  blobHash: string;
  entries: PackManifestEntry[];
}

interface SessionTokenPackClaim {
  keyVersion: string;
  key: string;
  hash: string;
  questionCount: number;
}

interface SessionTokenPayload {
  exp: number;
  packs: Record<string, SessionTokenPackClaim>;
}

interface LoadAllOptions {
  onProgress?: (completed: number, total: number) => void;
}

function base64ToUint8Array(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");
  const globalAny = globalThis as typeof globalThis & { Buffer?: typeof Buffer; atob?: (value: string) => string };
  let binary: string;
  if (typeof globalAny?.atob === "function") {
    binary = globalAny.atob(padded);
  } else if (globalAny.Buffer) {
    binary = globalAny.Buffer.from(padded, "base64").toString("binary");
  } else {
    throw new Error("Base64 decoding not supported in this environment");
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hkdfSha256(
  ikm: Uint8Array,
  salt: Uint8Array,
  info: Uint8Array,
  length: number,
): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({
    name: "HKDF",
    hash: "SHA-256",
    salt,
    info,
  }, keyMaterial, length * 8);
  return new Uint8Array(bits);
}

async function brotliDecompress(data: Uint8Array): Promise<Uint8Array> {
  const globalAny = globalThis as typeof globalThis & { DecompressionStream?: any };
  if (!globalAny.DecompressionStream) {
    throw new Error("Brotli decompression not supported in this environment");
  }
  const stream = new globalAny.DecompressionStream("br");
  const writer = stream.writable.getWriter();
  await writer.write(data);
  await writer.close();
  const response = new Response(stream.readable);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

async function sha256Hex(data: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

class SessionTokenManager {
  private token: string | null = null;
  private expiresAtMs = 0;

  async getToken(): Promise<string> {
    const now = Date.now();
    if (this.token && now < this.expiresAtMs - 60_000) {
      return this.token;
    }
    await this.refreshToken();
    if (!this.token) {
      throw new Error("Unable to fetch content session token");
    }
    return this.token;
  }

  private getSupabaseAuthToken(): string {
    if (typeof window === "undefined") {
      return "";
    }
    const stored = localStorage.getItem("sb-zmsqscxqxlhhehzwbylv-auth-token");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.access_token || "";
      } catch (error) {
        console.warn("Failed to parse Supabase auth token", error);
      }
    }
    return "";
  }

  private async refreshToken(): Promise<void> {
    const authToken = this.getSupabaseAuthToken();
    if (!authToken) {
      throw new Error("User authentication required for secure content");
    }
    try {
      const response = await fetch(SESSION_TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        await recordSecurityEvent("session_token_error", "error", {
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error(`Unable to obtain session token (${response.status})`);
      }

      const data = await response.json();
      this.token = data.token;
      this.expiresAtMs = (data.expiresAt || 0) * 1000;

      await recordSecurityEvent("session_token_success", "info", {
        expiresAt: data.expiresAt,
        packs: Array.isArray(data.packs) ? data.packs.length : undefined,
      });
    } catch (error) {
      await recordSecurityEvent("session_token_error", "error", {
        message: error instanceof Error ? error.message : "token_fetch_failed",
      });
      throw error;
    }
  }
}

export class QuestionVaultService {
  private manifestUrl = DEFAULT_MANIFEST_URL;
  private assetBaseUrl = DEFAULT_CONTENT_BASE;
  private manifest: EncryptedManifest | null = null;
  private manifestPromise: Promise<EncryptedManifest> | null = null;
  private packManifestCache = new Map<string, PackManifest>();
  private packBufferCache = new Map<string, ArrayBuffer>();
  private questionCache = new Map<string, Question>();
  private packKeyCache = new Map<string, { keyBytes: Uint8Array; keyVersion: string }>();
  private tokenManager = new SessionTokenManager();
  private activeSessionToken: string | null = null;
  private packCacheEnabled = isPackCacheSupported();

  isSupported(): boolean {
    const globalAny = globalThis as typeof globalThis & { crypto?: Crypto; DecompressionStream?: any };
    return Boolean(globalAny?.crypto?.subtle) && Boolean(globalAny?.DecompressionStream);
  }

  async loadAllQuestions(options?: LoadAllOptions): Promise<Question[]> {
    const manifest = await this.loadManifest();
    if (!manifest.questions) {
      throw new Error("Encrypted manifest is missing question index");
    }

    const questionIds = Object.keys(manifest.questions);
    const results: Question[] = [];
    for (let index = 0; index < questionIds.length; index += 1) {
      const questionId = questionIds[index];
      const question = await this.getQuestion(questionId);
      results.push(question);
      options?.onProgress?.(index + 1, questionIds.length);
    }
    return results;
  }

  async getQuestion(questionId: string): Promise<Question> {
    if (this.questionCache.has(questionId)) {
      return this.questionCache.get(questionId)!;
    }

    const manifest = await this.loadManifest();
    if (!manifest.questions) {
      throw new Error("Encrypted manifest missing question index");
    }

    const questionRef = manifest.questions[questionId];
    if (!questionRef) {
      throw new Error(`Question ${questionId} not found in manifest`);
    }

    const packEntry = manifest.packs[questionRef.packId];
    if (!packEntry) {
      throw new Error(`Pack ${questionRef.packId} missing from manifest`);
    }

    await this.ensureSessionKeys();
    const packKeyInfo = this.packKeyCache.get(questionRef.packId);
    if (!packKeyInfo) {
      throw new Error(`Missing key material for pack ${questionRef.packId}`);
    }

    const packManifest = await this.loadPackManifest(packEntry);
    const entry = packManifest.entries[questionRef.entryIndex];
    if (!entry) {
      throw new Error(`Manifest entry ${questionRef.entryIndex} not found for pack ${packEntry.id}`);
    }

    const ciphertext = await this.getCiphertextSlice(packEntry, entry.offset, entry.length);
    const questionKeyBytes = await hkdfSha256(
      packKeyInfo.keyBytes,
      encoder.encode(`question:${entry.questionId}`),
      encoder.encode(`content-question:${packKeyInfo.keyVersion}`),
      32,
    );

    const cryptoKey = await crypto.subtle.importKey("raw", questionKeyBytes, "AES-GCM", false, ["decrypt"]);
    let decryptedBytes: Uint8Array;
    try {
      const decrypted = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: base64ToUint8Array(entry.iv),
          additionalData: encoder.encode(`${packEntry.id}:${entry.questionId}:${entry.plaintextSha256}`),
          tagLength: 128,
        },
        cryptoKey,
        ciphertext,
      );
      decryptedBytes = new Uint8Array(decrypted);
    } catch (error) {
      await recordSecurityEvent("decrypt_failure", "error", {
        packId: packEntry.id,
        questionId: entry.questionId,
        reason: "aes-gcm",
        message: error instanceof Error ? error.message : "decrypt_error",
      });
      throw error;
    }

    const computedHash = await sha256Hex(decryptedBytes);
    if (computedHash !== entry.plaintextSha256) {
      await recordSecurityEvent("integrity_violation", "error", {
        packId: packEntry.id,
        questionId: entry.questionId,
        expected: entry.plaintextSha256,
        actual: computedHash,
      });
      throw new Error("Question integrity check failed");
    }

    const decompressed = await brotliDecompress(decryptedBytes);
    const json = decoder.decode(decompressed);
    const question = JSON.parse(json) as Question;
    this.questionCache.set(questionId, question);
    return question;
  }

  private async ensureSessionKeys(): Promise<void> {
    const token = await this.tokenManager.getToken();
    if (token === this.activeSessionToken) {
      return;
    }
    const payload = this.decodeTokenPayload(token);
    if (!payload?.packs) {
      throw new Error("Session token missing pack claims");
    }

    this.packKeyCache.clear();
    Object.entries(payload.packs).forEach(([packId, info]) => {
      this.packKeyCache.set(packId, {
        keyBytes: base64ToUint8Array(info.key),
        keyVersion: info.keyVersion,
      });
    });
    this.activeSessionToken = token;
  }

  private decodeTokenPayload(token: string): SessionTokenPayload | null {
    try {
      const [, payloadBase64] = token.split(".");
      if (!payloadBase64) return null;
      const bytes = base64ToUint8Array(payloadBase64);
      const json = new TextDecoder().decode(bytes);
      return JSON.parse(json) as SessionTokenPayload;
    } catch (error) {
      console.error("Failed to decode session token", error);
      return null;
    }
  }

  private async loadManifest(): Promise<EncryptedManifest> {
    if (this.manifest) {
      return this.manifest;
    }
    if (!this.manifestPromise) {
      this.manifestPromise = fetch(this.manifestUrl, { cache: "no-cache" })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Failed to load encrypted manifest (${response.status})`);
          }
          const data = await response.json() as EncryptedManifest;
          this.manifest = data;
          return data;
        })
        .catch((error) => {
          this.manifestPromise = null;
          throw error;
        });
    }
    return this.manifestPromise;
  }

  private async loadPackManifest(pack: EncryptedPackEntry): Promise<PackManifest> {
    if (this.packManifestCache.has(pack.id)) {
      return this.packManifestCache.get(pack.id)!;
    }
    const url = this.resolveAssetUrl(pack.manifestFile);
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) {
      throw new Error(`Failed to load pack manifest for ${pack.id}`);
    }
    const json = await response.json() as PackManifest;
    this.packManifestCache.set(pack.id, json);
    return json;
  }

  private async getCiphertextSlice(
    pack: EncryptedPackEntry,
    offset: number,
    length: number,
  ): Promise<ArrayBuffer> {
    const cachedBuffer = this.packBufferCache.get(pack.id);
    if (cachedBuffer) {
      return cachedBuffer.slice(offset, offset + length);
    }

    if (this.packCacheEnabled) {
      const persisted = await getCachedPackBuffer(pack.id, pack.hash);
      if (persisted) {
        this.packBufferCache.set(pack.id, persisted);
        return persisted.slice(offset, offset + length);
      }

      const buffer = await this.downloadFullPack(pack);
      return buffer.slice(offset, offset + length);
    }

    // Fallback to range request when we are not caching entire packs
    return this.fetchCiphertextRange(pack, offset, length);
  }

  private async downloadFullPack(pack: EncryptedPackEntry): Promise<ArrayBuffer> {
    const url = this.resolveAssetUrl(pack.packFile);
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) {
      throw new Error(`Failed to download encrypted pack ${pack.id}`);
    }
    const buffer = await response.arrayBuffer();
    this.packBufferCache.set(pack.id, buffer);
    if (this.packCacheEnabled) {
      storePackBuffer(pack.id, pack.hash, buffer).catch((err) => {
        console.warn("Failed to persist encrypted pack buffer", err);
      });
    }
    return buffer;
  }

  private async fetchCiphertextRange(
    pack: EncryptedPackEntry,
    offset: number,
    length: number,
  ): Promise<ArrayBuffer> {
    const url = this.resolveAssetUrl(pack.packFile);
    const end = offset + length - 1;
    const response = await fetch(url, {
      headers: {
        Range: `bytes=${offset}-${end}`,
      },
    });
    if (response.status !== 206 && !response.ok) {
      throw new Error(`Failed to fetch ciphertext range for pack ${pack.id}`);
    }
    return response.arrayBuffer();
  }

  private resolveAssetUrl(relativePath: string): string {
    const trimmedBase = this.assetBaseUrl.replace(/\/$/, "");
    const trimmedRelative = relativePath.replace(/^\//, "");
    if (/^https?:\/\//i.test(trimmedBase)) {
      return new URL(trimmedRelative, `${trimmedBase}/`).toString();
    }
    return `${trimmedBase}/${trimmedRelative}`;
  }
}

export const questionVaultService = new QuestionVaultService();
