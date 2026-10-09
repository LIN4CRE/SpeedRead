import { describe, it, expect } from 'vitest';
import { 
  createSyncPayload, 
  encodeSyncPayload, 
  decodeSyncPayload, 
  generateSvgQrMatrix,
  encryptPayloadWithPassphrase,
  decryptPayloadWithPassphrase
} from '../src/utils/cloudlessSync';
import { DocumentSource, SavedBookmark, VocabularyItem } from '../src/types/reader';

describe('Cloudless Local-First Sync', () => {
  const dummyDoc: DocumentSource = {
    id: 'doc_123',
    title: 'Frankenstein',
    type: 'sample',
    totalWords: 5000,
    chapters: [],
    rawText: '',
    words: [],
    dateAdded: Date.now(),
  };

  const dummyBookmarks: SavedBookmark[] = [
    {
      documentId: 'doc_123',
      title: 'Frankenstein',
      type: 'sample',
      lastWordIndex: 250,
      totalWords: 5000,
      wpm: 650,
      lastReadTimestamp: Date.now(),
    },
  ];

  const dummyVocab: VocabularyItem[] = [
    {
      id: 'v_1',
      word: 'ineffable',
      cleanWord: 'ineffable',
      contextSentence: 'An ineffable sight.',
      documentTitle: 'Frankenstein',
      timestamp: Date.now(),
      definition: 'Indescribable',
      repetition: 1,
      intervalDays: 1,
      easeFactor: 2.5,
      nextReviewDate: Date.now(),
    },
  ];

  it('creates, encodes, and decodes payload without data corruption', () => {
    const payload = createSyncPayload(dummyDoc, 250, 650, dummyBookmarks, dummyVocab);
    const encoded = encodeSyncPayload(payload);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(20);

    const decoded = decodeSyncPayload(encoded);
    expect(decoded.activeDocumentTitle).toBe('Frankenstein');
    expect(decoded.currentWordIndex).toBe(250);
    expect(decoded.wpm).toBe(650);
    expect(decoded.bookmarks).toHaveLength(1);
    expect(decoded.vocabulary).toHaveLength(1);
    expect(decoded.vocabulary[0].cleanWord).toBe('ineffable');
  });

  it('generates a valid SVG QR matrix', () => {
    const svg = generateSvgQrMatrix('sample-sync-payload', 200);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('<rect');
    expect(svg).toContain('viewBox="0 0 200 200"');
  });

  it('performs Zero-Knowledge AES-GCM encryption and decryption with passphrase', async () => {
    const payload = createSyncPayload(dummyDoc, 500, 700, dummyBookmarks, dummyVocab);
    const secretPassphrase = 'MyMasterPassphrase!2026';

    const encrypted = await encryptPayloadWithPassphrase(payload, secretPassphrase);
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toContain('Frankenstein');

    const decrypted = await decryptPayloadWithPassphrase(encrypted, secretPassphrase);
    expect(decrypted.activeDocumentTitle).toBe('Frankenstein');
    expect(decrypted.currentWordIndex).toBe(500);
    expect(decrypted.wpm).toBe(700);
  });

  it('fails decryption gracefully on wrong passphrase', async () => {
    const payload = createSyncPayload(dummyDoc, 500, 700, dummyBookmarks, dummyVocab);
    const encrypted = await encryptPayloadWithPassphrase(payload, 'correct-pass');

    await expect(decryptPayloadWithPassphrase(encrypted, 'wrong-pass')).rejects.toThrow();
  });
});
