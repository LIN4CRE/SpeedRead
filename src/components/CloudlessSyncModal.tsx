import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  QrCode, 
  Copy, 
  Check, 
  Lock, 
  Unlock, 
  Download, 
  Upload, 
  ShieldCheck, 
  AlertCircle,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { ThemeColors, DocumentSource, SavedBookmark, VocabularyItem, CloudlessSyncPayload } from '../types/reader';
import { 
  createSyncPayload, 
  encodeSyncPayload, 
  decodeSyncPayload, 
  encryptPayloadWithPassphrase, 
  decryptPayloadWithPassphrase,
  generateSvgQrMatrix 
} from '../utils/cloudlessSync';

interface CloudlessSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDoc: DocumentSource;
  currentWordIndex: number;
  wpm: number;
  bookmarks: SavedBookmark[];
  vocabulary: VocabularyItem[];
  onApplySyncState: (payload: CloudlessSyncPayload) => void;
  theme: ThemeColors;
}

export const CloudlessSyncModal: React.FC<CloudlessSyncModalProps> = ({
  isOpen,
  onClose,
  activeDoc,
  currentWordIndex,
  wpm,
  bookmarks,
  vocabulary,
  onApplySyncState,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'import' | 'crypto'>('qr');
  const [copiedSyncStr, setCopiedSyncStr] = useState(false);
  
  // Import state
  const [importString, setImportString] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; msg: string } | null>(null);

  // Passphrase Crypto state
  const [passphrase, setPassphrase] = useState('');
  const [encryptedOutput, setEncryptedOutput] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [decryptInput, setDecryptInput] = useState('');
  const [decryptPassphrase, setDecryptPassphrase] = useState('');
  const [cryptoError, setCryptoError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate payload
  const currentPayload = createSyncPayload(activeDoc, currentWordIndex, wpm, bookmarks, vocabulary);
  const syncBase64 = encodeSyncPayload(currentPayload);
  const qrSvg = generateSvgQrMatrix(syncBase64, 210);

  const handleCopySyncString = () => {
    navigator.clipboard.writeText(syncBase64);
    setCopiedSyncStr(true);
    setTimeout(() => setCopiedSyncStr(false), 2000);
  };

  const handleApplyImport = () => {
    if (!importString.trim()) return;
    setImportStatus(null);
    try {
      const decoded = decodeSyncPayload(importString);
      onApplySyncState(decoded);
      setImportStatus({
        success: true,
        msg: `Successfully restored position in "${decoded.activeDocumentTitle}" (${decoded.currentWordIndex} words, ${decoded.wpm} WPM)!`,
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setImportStatus({
        success: false,
        msg: err.message || 'Failed to decode sync string. Please check the code format.',
      });
    }
  };

  const handleEncryptPayload = async () => {
    if (!passphrase.trim()) {
      setCryptoError('Please enter a passphrase.');
      return;
    }
    setIsEncrypting(true);
    setCryptoError(null);
    try {
      const enc = await encryptPayloadWithPassphrase(currentPayload, passphrase);
      setEncryptedOutput(enc);
    } catch (err: any) {
      setCryptoError(err.message || 'Encryption failed.');
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDecryptPayload = async () => {
    if (!decryptInput.trim() || !decryptPassphrase.trim()) {
      setCryptoError('Please enter both encrypted text and your passphrase.');
      return;
    }
    setCryptoError(null);
    try {
      const dec = await decryptPayloadWithPassphrase(decryptInput, decryptPassphrase);
      onApplySyncState(dec);
      setImportStatus({
        success: true,
        msg: `Decrypted and mirrored state for "${dec.activeDocumentTitle}"!`,
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setCryptoError(err.message || 'Decryption failed. Check passphrase.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.textBright,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 sm:px-6 py-4 border-b"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
            >
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Cloudless Local-First Multi-Device Sync</h2>
              <p className="text-xs" style={{ color: theme.textDim }}>
                Instant peer-to-peer sync · 100% Zero-Cloud privacy · Web Crypto AES-GCM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: theme.textDim }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b px-6 pt-2 gap-4 text-sm font-medium" style={{ borderColor: theme.border }}>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'qr' ? 'border-current font-bold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'qr' ? theme.accent : theme.textBright }}
          >
            <QrCode className="w-4 h-4" /> Peer QR Sync
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'import' ? 'border-current font-bold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'import' ? theme.accent : theme.textBright }}
          >
            <Upload className="w-4 h-4" /> Receive / Mirror
          </button>
          <button
            onClick={() => setActiveTab('crypto')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'crypto' ? 'border-current font-bold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'crypto' ? theme.accent : theme.textBright }}
          >
            <Lock className="w-4 h-4" /> Zero-Knowledge Crypto
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {importStatus && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                importStatus.success
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/15 border-red-500/30 text-red-400'
              }`}
            >
              {importStatus.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{importStatus.msg}</span>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-4 flex flex-col items-center text-center">
              <div className="p-3 bg-black/40 rounded-2xl border flex items-center justify-center shadow-lg" style={{ borderColor: theme.border }}>
                <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
              </div>

              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm font-bold" style={{ color: theme.textBright }}>
                  Scan to Mirror Reading State
                </h4>
                <p className="text-xs opacity-70 leading-relaxed">
                  Open SpeedRead on your phone and scan or paste the payload code to instantaneously continue reading at word #{currentWordIndex} of <b>"{activeDoc.title}"</b> at {wpm} WPM.
                </p>
              </div>

              <button
                onClick={handleCopySyncString}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-colors"
                style={{
                  backgroundColor: `${theme.accent}15`,
                  borderColor: `${theme.accent}40`,
                  color: theme.accent,
                }}
              >
                {copiedSyncStr ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedSyncStr ? 'Sync Payload Copied!' : 'Copy Device Sync String'}
              </button>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  Paste Device Sync Payload String
                </label>
                <textarea
                  rows={6}
                  value={importString}
                  onChange={(e) => setImportString(e.target.value)}
                  placeholder="Paste base64 device sync string copied from your other browser..."
                  className="w-full p-3 text-xs font-mono rounded-xl border bg-black/20 focus:outline-none resize-none"
                  style={{ borderColor: theme.border, color: theme.textBright }}
                />
              </div>

              <button
                onClick={handleApplyImport}
                disabled={!importString.trim()}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border transition-all disabled:opacity-40"
                style={{
                  backgroundColor: theme.accent,
                  color: '#ffffff',
                  borderColor: theme.accent,
                }}
              >
                <span>Mirror State & Continue Reading</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === 'crypto' && (
            <div className="space-y-4 text-xs">
              {cryptoError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cryptoError}</span>
                </div>
              )}

              {/* Encryption section */}
              <div className="p-4 rounded-xl border bg-white/5 space-y-3" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-2 font-bold" style={{ color: theme.accent }}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Client-Side AES-GCM 256-bit Encryption</span>
                </div>
                <p className="opacity-70 leading-relaxed">
                  Encrypt reading bookmarks, speed velocity, and vocabulary vault with a private passphrase before backing up to GitHub Gist, WebDAV, or notes.
                </p>

                <div className="flex gap-2">
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter private encryption passphrase..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border bg-black/20 focus:outline-none"
                    style={{ borderColor: theme.border, color: theme.textBright }}
                  />
                  <button
                    onClick={handleEncryptPayload}
                    disabled={isEncrypting || !passphrase}
                    className="px-4 py-2 rounded-xl font-bold uppercase tracking-wider border disabled:opacity-40"
                    style={{ backgroundColor: `${theme.accent}20`, borderColor: theme.accent, color: theme.accent }}
                  >
                    Encrypt
                  </button>
                </div>

                {encryptedOutput && (
                  <div className="space-y-1.5 pt-2">
                    <span className="font-semibold opacity-70">Encrypted Ciphertext:</span>
                    <div className="p-2.5 rounded-lg border bg-black/30 font-mono text-[10px] break-all max-h-20 overflow-y-auto" style={{ borderColor: theme.border }}>
                      {encryptedOutput}
                    </div>
                  </div>
                )}
              </div>

              {/* Decryption section */}
              <div className="p-4 rounded-xl border bg-white/5 space-y-3" style={{ borderColor: theme.border }}>
                <span className="font-bold">Restore Encrypted Backup:</span>
                <textarea
                  rows={3}
                  value={decryptInput}
                  onChange={(e) => setDecryptInput(e.target.value)}
                  placeholder="Paste encrypted ciphertext..."
                  className="w-full p-2.5 text-[11px] font-mono rounded-xl border bg-black/20 focus:outline-none resize-none"
                  style={{ borderColor: theme.border, color: theme.textBright }}
                />
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={decryptPassphrase}
                    onChange={(e) => setDecryptPassphrase(e.target.value)}
                    placeholder="Enter decryption passphrase..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border bg-black/20 focus:outline-none"
                    style={{ borderColor: theme.border, color: theme.textBright }}
                  />
                  <button
                    onClick={handleDecryptPayload}
                    disabled={!decryptInput || !decryptPassphrase}
                    className="px-4 py-2 rounded-xl font-bold uppercase tracking-wider border disabled:opacity-40"
                    style={{ backgroundColor: `${theme.accent}20`, borderColor: theme.accent, color: theme.accent }}
                  >
                    Decrypt & Restore
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
