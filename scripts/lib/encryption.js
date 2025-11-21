import crypto from 'crypto';
import { brotliCompressSync, constants as zlibConstants } from 'zlib';

const BROTLI_OPTIONS = {
  params: {
    [zlibConstants.BROTLI_PARAM_MODE]: zlibConstants.BROTLI_MODE_TEXT,
    [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
    [zlibConstants.BROTLI_PARAM_SIZE_HINT]: 0,
  },
};

const INFO_PACK = Buffer.from('content-pack', 'utf8');
const INFO_QUESTION_PREFIX = 'content-question:';

function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }
  if (value && typeof value === 'object') {
    const sortedKeys = Object.keys(value).sort();
    const result = {};
    for (const key of sortedKeys) {
      result[key] = canonicalize(value[key]);
    }
    return result;
  }
  return value;
}

export function encodeQuestionPayload(question) {
  const canonical = canonicalize(question);
  const json = JSON.stringify(canonical);
  return Buffer.from(json, 'utf8');
}

export function compressPayload(buffer) {
  return brotliCompressSync(buffer, BROTLI_OPTIONS);
}

export function encryptPayload({ key, plaintext, aad }) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  if (aad && aad.length > 0) {
    cipher.setAAD(aad);
  }
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { ciphertext, iv, authTag };
}

export function hashBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function bufferToBase64(buffer) {
  return buffer.toString('base64');
}

export function getBrotliRatio(rawLength, compressedLength) {
  if (!rawLength) {
    return 1;
  }
  return Number((compressedLength / rawLength).toFixed(6));
}

export function getMasterContentKey() {
  const keyBase64 = process.env.CONTENT_MASTER_KEY;
  if (!keyBase64) {
    throw new Error('CONTENT_MASTER_KEY is required when --encrypt is used.');
  }
  const key = Buffer.from(keyBase64, 'base64');
  if (key.length !== 32) {
    throw new Error('CONTENT_MASTER_KEY must be a 32-byte key encoded in base64.');
  }
  return key;
}

export function derivePackKey(masterKey, packId) {
  const salt = Buffer.from(`pack:${packId}`, 'utf8');
  return crypto.hkdfSync('sha256', masterKey, salt, INFO_PACK, 32);
}

export function deriveQuestionKey(packKey, questionId, keyVersion) {
  const salt = Buffer.from(`question:${questionId}`, 'utf8');
  const info = Buffer.from(`${INFO_QUESTION_PREFIX}${keyVersion}`, 'utf8');
  return crypto.hkdfSync('sha256', packKey, salt, info, 32);
}

export function makeAad(packId, questionId, plaintextHash) {
  return Buffer.from(`${packId}:${questionId}:${plaintextHash}`, 'utf8');
}
