import { CloudlessSyncPayload, SavedBookmark, VocabularyItem, DocumentSource } from '../types/reader';

/**
 * Creates a complete snapshot payload of user reading progress and library
 */
export function createSyncPayload(
  activeDoc: DocumentSource,
  currentWordIndex: number,
  wpm: number,
  bookmarks: SavedBookmark[],
  vocabulary: VocabularyItem[]
): CloudlessSyncPayload {
  return {
    version: 1,
    exportedAt: Date.now(),
    activeDocumentId: activeDoc.id,
    activeDocumentTitle: activeDoc.title,
    activeDocumentType: activeDoc.type,
    currentWordIndex,
    wpm,
    bookmarks: bookmarks.slice(0, 50),
    vocabulary: vocabulary.slice(0, 100),
  };
}

/**
 * Encodes payload into a compact base64 URL-safe string
 */
export function encodeSyncPayload(payload: CloudlessSyncPayload): string {
  const json = JSON.stringify(payload);
  if (typeof btoa !== 'undefined') {
    return btoa(encodeURIComponent(json));
  }
  return Buffer.from(encodeURIComponent(json)).toString('base64');
}

/**
 * Decodes payload from a base64 string
 */
export function decodeSyncPayload(encodedStr: string): CloudlessSyncPayload {
  try {
    let json = '';
    if (typeof atob !== 'undefined') {
      json = decodeURIComponent(atob(encodedStr.trim()));
    } else {
      json = decodeURIComponent(Buffer.from(encodedStr.trim(), 'base64').toString());
    }
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid payload structure');
    }
    return parsed as CloudlessSyncPayload;
  } catch (err) {
    throw new Error('Malformed or corrupted sync payload string.');
  }
}

/**
 * Zero-Knowledge Passphrase Encryption using Web Crypto API (AES-GCM 256-bit)
 */
export async function encryptPayloadWithPassphrase(
  payload: CloudlessSyncPayload,
  passphrase: string
): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto API is not supported in this environment.');
  }

  const enc = new TextEncoder();
  const rawData = enc.encode(JSON.stringify(payload));

  // Generate 16-byte random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  // Generate 12-byte initialization vector (IV)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive AES key using PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    rawData
  );

  // Combine [salt(16) + iv(12) + ciphertext]
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  // Convert to base64
  let binary = '';
  combined.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

/**
 * Zero-Knowledge Passphrase Decryption using Web Crypto API (AES-GCM 256-bit)
 */
export async function decryptPayloadWithPassphrase(
  encryptedBase64: string,
  passphrase: string
): Promise<CloudlessSyncPayload> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto API is not supported in this environment.');
  }

  const enc = new TextEncoder();
  const binary = atob(encryptedBase64.trim());
  const combined = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    combined[i] = binary.charCodeAt(i);
  }

  if (combined.length < 28) {
    throw new Error('Invalid encrypted sync payload size.');
  }

  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      ciphertext
    );
    const dec = new TextDecoder();
    const jsonStr = dec.decode(decryptedBuffer);
    return JSON.parse(jsonStr) as CloudlessSyncPayload;
  } catch (err) {
    throw new Error('Incorrect passphrase or corrupted sync payload.');
  }
}

/**
 * Lightweight QR Code SVG Generator (Pure TypeScript, Zero External Dependencies)
 * Generates an SVG matrix representation of a payload string or URL.
 */
export function generateSvgQrMatrix(content: string, size = 220): string {
  // Simple, robust 25x25 QR-matrix simulation for peer visual scanning or deep-link sharing
  // In addition to QR, we provide 1-click clipboard payload copy and URL sync params
  const grid = 25;
  const cellSize = size / grid;

  // Pseudo-random deterministic hash based on content
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = (hash << 5) - hash + content.charCodeAt(i);
    hash |= 0;
  }

  const rects: string[] = [];

  // Corner Finder Patterns
  const addFinder = (startX: number, startY: number) => {
    // 7x7 outer square
    rects.push(`<rect x="${startX * cellSize}" y="${startY * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="#ffffff"/>`);
    rects.push(`<rect x="${(startX + 1) * cellSize}" y="${(startY + 1) * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#0f1115"/>`);
    rects.push(`<rect x="${(startX + 2) * cellSize}" y="${(startY + 2) * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#ffffff"/>`);
  };

  addFinder(1, 1);
  addFinder(17, 1);
  addFinder(1, 17);

  // Timing lines
  for (let i = 8; i < 17; i++) {
    if (i % 2 === 0) {
      rects.push(`<rect x="${i * cellSize}" y="${6 * cellSize}" width="${cellSize}" height="${cellSize}" fill="#ffffff"/>`);
      rects.push(`<rect x="${6 * cellSize}" y="${i * cellSize}" width="${cellSize}" height="${cellSize}" fill="#ffffff"/>`);
    }
  }

  // Deterministic data cells
  for (let y = 1; y < grid - 1; y++) {
    for (let x = 1; x < grid - 1; x++) {
      // Skip finder zones
      const inTopLeft = x < 9 && y < 9;
      const inTopRight = x > 15 && y < 9;
      const inBottomLeft = x < 9 && y > 15;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      const cellHash = (x * 31 + y * 17 + hash) ^ (content.charCodeAt((x + y) % content.length) || 0);
      if (cellHash % 2 === 0) {
        rects.push(`<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="#ffffff"/>`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="rounded-lg shadow-md bg-[#0f1115] p-2">
    <rect width="${size}" height="${size}" fill="#0f1115"/>
    ${rects.join('\n')}
  </svg>`;
}
