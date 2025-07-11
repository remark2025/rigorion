import { writeFileSync } from "fs";
import { subtle, getRandomValues } from "crypto";

const jsonData = {
  questions: [
    {
      id: "q1",
      title: "Nati",
      content: "What is 2 + 2?",
      choices: [
        { id: "a", text: "3" },
        { id: "b", text: "4" },
        { id: "c", text: "5" }
      ],
      answer: "b"
    },
    {
      id: "q2",
      title: "Science Trivia",
      content: "What planet is known as the Red Planet?",
      choices: [
        { id: "a", text: "Earth" },
        { id: "b", text: "Mars" },
        { id: "c", text: "Venus" }
      ],
      answer: "b"
    },
    {
      id: "q3",
      title: "Literature Insight",
      content: "Who wrote 'Romeo and Juliet'?",
      choices: [
        { id: "a", text: "Charles Dickens" },
        { id: "b", text: "William Shakespeare" },
        { id: "c", text: "Jane Austen" }
      ],
      answer: "b"
    }
  ],
  quotes: [
    {
      id: "qt1",
      text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
      author: "NATI"
    },
    {
      id: "qt2",
      text: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson"
    },
    {
      id: "qt3",
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt"
    }
  ]
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

async function generateKey(): Promise<{ key: CryptoKey; base64: string }> {
  const raw = getRandomValues(new Uint8Array(32));
  const base64 = toBase64(raw.buffer);

  const key = await subtle.importKey(
    "raw",
    raw,
    "AES-GCM",
    false,
    ["encrypt"]
  );

  return { key, base64 };
}

async function encryptValue(value: any, cryptoKey: CryptoKey): Promise<string> {
  const iv = getRandomValues(new Uint8Array(12));
  const data = encoder.encode(JSON.stringify(value));

  const encrypted = await subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    data
  );

  return `${toBase64(iv)}:${toBase64(encrypted)}`;
}

async function encryptAll() {
  const { key, base64 } = await generateKey();
  console.log(`🔐 Encryption Key (Base64):\n${base64}\n⚠️ Save this securely in your .env.local as VITE_ENCRYPTION_KEY`);

  const encryptedQuestions: Record<string, string> = {};
  const encryptedQuotes: Record<string, string> = {};

  for (const question of jsonData.questions) {
    encryptedQuestions[question.id] = await encryptValue(question, key);
  }

  for (const quote of jsonData.quotes) {
    encryptedQuotes[quote.id] = await encryptValue(quote, key);
  }

  const result = {
    questions: encryptedQuestions,
    quotes: encryptedQuotes
  };

  writeFileSync("secure-data.json", JSON.stringify(result, null, 2));
  console.log("✅ Encrypted JSON saved to secure-data.json");
}

encryptAll().catch(console.error);
