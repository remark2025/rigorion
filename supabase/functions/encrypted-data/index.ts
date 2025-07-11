
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Simple implementation of Simon64/128 for Deno
function rotateLeft(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

function simonRound(x: number, y: number, k: number): [number, number] {
  const tmp = x;
  x = y ^ ((rotateLeft(x, 1) & rotateLeft(x, 8)) ^ rotateLeft(x, 2) ^ k);
  y = tmp;
  return [x, y];
}

function generateRoundKeys(key: Uint8Array): Uint32Array {
  const Z = [
    1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1,
    0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1,
    1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0,
    1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0
  ];

  const keyWords = new Uint32Array(4);
  for (let i = 0; i < 4; i++) {
    keyWords[i] = (key[i * 4] | (key[i * 4 + 1] << 8) | (key[i * 4 + 2] << 16) | (key[i * 4 + 3] << 24)) >>> 0;
  }

  const roundKeys = new Uint32Array(44);
  for (let i = 0; i < 4; i++) {
    roundKeys[i] = keyWords[i];
  }

  let z = 0;
  for (let i = 4; i < 44; i++) {
    let tmp = rotateLeft(roundKeys[i - 1], 3);
    tmp = tmp ^ roundKeys[i - 3];
    tmp = tmp ^ (tmp >>> 1);
    roundKeys[i] = (~roundKeys[i - 4] ^ tmp ^ Z[z] ^ 3) >>> 0;
    z = (z + 1) % 62;
  }

  return roundKeys;
}

function simonEncrypt(plaintext: string, key: string): Uint8Array {
  // Convert key to bytes
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(key);
  if (keyBytes.length !== 16) {
    throw new Error("Key must be 16 bytes (128 bits)");
  }

  // Pad plaintext to multiple of 8 bytes
  const textBytes = encoder.encode(plaintext);
  const paddingLength = 8 - (textBytes.length % 8);
  const paddedBytes = new Uint8Array(textBytes.length + paddingLength);
  paddedBytes.set(textBytes);
  paddedBytes[textBytes.length] = paddingLength; // Store padding length

  // Generate round keys
  const roundKeys = generateRoundKeys(keyBytes);

  // Encrypt blocks
  const ciphertext = new Uint8Array(paddedBytes.length);
  for (let i = 0; i < paddedBytes.length; i += 8) {
    // Split block into two 32-bit words
    let x = (paddedBytes[i] | (paddedBytes[i + 1] << 8) | (paddedBytes[i + 2] << 16) | (paddedBytes[i + 3] << 24)) >>> 0;
    let y = (paddedBytes[i + 4] | (paddedBytes[i + 5] << 8) | (paddedBytes[i + 6] << 16) | (paddedBytes[i + 7] << 24)) >>> 0;

    // Apply 44 rounds
    for (let j = 0; j < 44; j++) {
      [x, y] = simonRound(x, y, roundKeys[j]);
    }

    // Store result
    ciphertext[i] = x & 0xFF;
    ciphertext[i + 1] = (x >>> 8) & 0xFF;
    ciphertext[i + 2] = (x >>> 16) & 0xFF;
    ciphertext[i + 3] = (x >>> 24) & 0xFF;
    ciphertext[i + 4] = y & 0xFF;
    ciphertext[i + 5] = (y >>> 8) & 0xFF;
    ciphertext[i + 6] = (y >>> 16) & 0xFF;
    ciphertext[i + 7] = (y >>> 24) & 0xFF;
  }

  return ciphertext;
}

function bytesToBase64(bytes: Uint8Array): string {
  const binString = Array.from(bytes)
    .map(byte => String.fromCharCode(byte))
    .join("");
  return btoa(binString);
}

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Generate sample data
    const sampleData = {
      id: "123456",
      timestamp: new Date().toISOString(),
      user: "demo-user",
      items: [
        { name: "Item 1", value: 42 },
        { name: "Item 2", value: 73 },
        { name: "Item 3", value: 128 }
      ],
      metadata: {
        source: "encrypted-data",
        version: "1.0.0"
      }
    };

    // Convert to JSON string
    const jsonData = JSON.stringify(sampleData);
    
    // Use a fixed key for demo purposes (in production, use environment variables)
    const encryptionKey = "1234567890abcdef"; // Must be 16 bytes / 128 bits
    
    // Encrypt the data
    const encryptedBytes = simonEncrypt(jsonData, encryptionKey);
    
    // Convert to base64 for transport
    const encryptedBase64 = bytesToBase64(encryptedBytes);
    
    console.log("Sending encrypted data (base64):", encryptedBase64.substring(0, 20) + "...");
    
    // Return the encrypted data
    return new Response(
      JSON.stringify({ 
        data: encryptedBase64,
        encrypted: true 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 500 
      }
    );
  }
});
