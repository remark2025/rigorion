// Client-side encrypted question vault service
export interface SessionToken {
  token: string;
  expiresAt: number;
  packs: Array<{
    id: string;
    keyVersion: string;
    questionCount: number;
    hash: string;
  }>;
}

export interface EncryptedQuestionEntry {
  questionId: string;
  offset: number;
  length: number;
  iv: string; // base64
  authTag: string; // base64
  aadHash: string;
  plaintextSha256: string;
  ciphertextSha256: string;
}

export interface PackManifest {
  packId: string;
  keyVersion: string;
  cipher: string;
  compression: string;
  encoding: string;
  questionCount: number;
  entries: EncryptedQuestionEntry[];
}

export class QuestionVaultService {
  private sessionToken: SessionToken | null = null;
  private manifestCache = new Map<string, PackManifest>();
  private questionCache = new Map<string, any>();

  constructor(private baseUrl: string = '/content/build') {}

  /**
   * Get valid session token (refresh if needed)
   */
  async getSessionToken(): Promise<SessionToken> {
    if (this.sessionToken && this.sessionToken.expiresAt > Date.now() + 5 * 60 * 1000) {
      return this.sessionToken;
    }

    const authToken = localStorage.getItem('sb-access-token'); // Adjust based on your auth
    if (!authToken) {
      throw new Error('Authentication required');
    }

    const response = await fetch('/functions/v1/get-session-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    this.sessionToken = await response.json();
    return this.sessionToken!;
  }

  /**
   * Load pack manifest
   */
  async getPackManifest(packId: string): Promise<PackManifest> {
    if (this.manifestCache.has(packId)) {
      return this.manifestCache.get(packId)!;
    }

    const response = await fetch(`${this.baseUrl}/encrypted/packs/${packId}.manifest.json`);
    if (!response.ok) {
      throw new Error(`Failed to load manifest for pack ${packId}`);
    }

    const manifest = await response.json();
    this.manifestCache.set(packId, manifest);
    return manifest;
  }

  /**
   * Decrypt a single question
   */
  async getQuestion(questionId: string): Promise<any> {
    // Check cache first
    if (this.questionCache.has(questionId)) {
      return this.questionCache.get(questionId);
    }

    // Get session token and find which pack contains this question
    const sessionToken = await this.getSessionToken();
    
    // TODO: We need a way to map questionId -> packId
    // For now, search all available packs
    let packId: string | null = null;
    let questionEntry: EncryptedQuestionEntry | null = null;

    for (const pack of sessionToken.packs) {
      const manifest = await this.getPackManifest(pack.id);
      const entry = manifest.entries.find(e => e.questionId === questionId);
      if (entry) {
        packId = pack.id;
        questionEntry = entry;
        break;
      }
    }

    if (!packId || !questionEntry) {
      throw new Error(`Question ${questionId} not found in any accessible pack`);
    }

    // Fetch encrypted ciphertext using range request
    const packUrl = `${this.baseUrl}/encrypted/packs/${packId}.bin`;
    const response = await fetch(packUrl, {
      headers: {
        'Range': `bytes=${questionEntry.offset}-${questionEntry.offset + questionEntry.length - 1}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch question data: ${response.status}`);
    }

    const ciphertext = new Uint8Array(await response.arrayBuffer());

    // Decrypt the question
    const question = await this.decryptQuestion(
      sessionToken,
      packId,
      questionId,
      questionEntry,
      ciphertext
    );

    // Cache result
    this.questionCache.set(questionId, question);

    return question;
  }

  /**
   * Decrypt question using WebCrypto API
   */
  private async decryptQuestion(
    sessionToken: SessionToken,
    packId: string,
    questionId: string,
    entry: EncryptedQuestionEntry,
    ciphertext: Uint8Array
  ): Promise<any> {
    // Parse JWT to get pack keys (in production, verify signature)
    const payload = JSON.parse(atob(sessionToken.token.split('.')[1]));
    const packClaim = payload.packs[packId];
    
    if (!packClaim) {
      throw new Error(`No access to pack ${packId}`);
    }

    // Decode pack key from base64
    const packKeyBytes = this.base64ToBytes(packClaim.key);
    
    // Derive question-specific key using HKDF
    const questionKey = await this.deriveQuestionKey(
      packKeyBytes,
      questionId,
      entry.questionId // Use stored keyVersion
    );

    // Prepare decryption
    const iv = this.base64ToBytes(entry.iv);
    const authTag = this.base64ToBytes(entry.authTag);

    // Reconstruct full ciphertext with auth tag
    const fullCiphertext = new Uint8Array(ciphertext.length + authTag.length);
    fullCiphertext.set(ciphertext);
    fullCiphertext.set(authTag, ciphertext.length);

    // Create AAD (associated authenticated data)
    const aad = new TextEncoder().encode(`${packId}:${questionId}:${entry.plaintextSha256}`);

    try {
      // Decrypt with AES-GCM
      const compressed = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          additionalData: aad,
        },
        questionKey,
        fullCiphertext
      );

      // Decompress with DecompressionStream (if available)
      const decompressed = await this.decompress(new Uint8Array(compressed));

      // Verify integrity
      const hash = await this.sha256(decompressed);
      if (hash !== entry.plaintextSha256) {
        throw new Error('Integrity check failed');
      }

      // Parse JSON
      const questionText = new TextDecoder().decode(decompressed);
      return JSON.parse(questionText);

    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt question');
    }
  }

  /**
   * Derive question key using HKDF (matching server-side logic)
   */
  private async deriveQuestionKey(
    packKey: Uint8Array,
    questionId: string,
    keyVersion: string
  ): Promise<CryptoKey> {
    const salt = new TextEncoder().encode(`question:${questionId}`);
    const info = new TextEncoder().encode(`content-question:${keyVersion}`);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      packKey,
      { name: 'HKDF' },
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: salt,
        info: info,
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
  }

  /**
   * Decompress data (browser-compatible)
   */
  private async decompress(compressed: Uint8Array): Promise<Uint8Array> {
    if ('DecompressionStream' in window && 'brotli' in DecompressionStream) {
      // Use native browser Brotli if available
      const ds = new DecompressionStream('deflate'); // Fallback to deflate for now
      const stream = new Response(compressed).body!.pipeThrough(ds);
      const decompressed = await new Response(stream).arrayBuffer();
      return new Uint8Array(decompressed);
    } else {
      // For now, assume no compression or add brotli-wasm polyfill
      console.warn('Brotli decompression not available, returning compressed data');
      return compressed;
    }
  }

  /**
   * Calculate SHA-256 hash
   */
  private async sha256(data: Uint8Array): Promise<string> {
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Convert base64 to Uint8Array
   */
  private base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.sessionToken = null;
    this.manifestCache.clear();
    this.questionCache.clear();
  }
}