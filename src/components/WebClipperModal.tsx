import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  Scissors, 
  Bookmark, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ThemeColors, DocumentSource } from '../types/reader';
import { extractCleanArticle, fetchArticleFromUrl, generateSpeedReadBookmarklet } from '../utils/webClipper';
import { tokenizeText } from '../utils/orp';

interface WebClipperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportDocument: (doc: DocumentSource) => void;
  theme: ThemeColors;
}

export const WebClipperModal: React.FC<WebClipperModalProps> = ({
  isOpen,
  onClose,
  onImportDocument,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'paste' | 'bookmarklet'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteHtml, setPasteHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopiedBookmarklet, setIsCopiedBookmarklet] = useState(false);

  if (!isOpen) return null;

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await fetchArticleFromUrl(urlInput.trim());
      if (!result.cleanedText || result.wordCount === 0) {
        throw new Error('No article body could be extracted from this page.');
      }

      const words = tokenizeText(result.cleanedText);
      const newDoc: DocumentSource = {
        id: `clipped_${Date.now()}`,
        title: result.title || 'Clipped Web Article',
        author: result.byline || new URL(urlInput).hostname,
        type: 'paste',
        totalWords: words.length,
        chapters: [{
          id: 'chap_1',
          title: result.title || 'Article Content',
          startWordIndex: 0,
          wordCount: words.length,
        }],
        rawText: result.cleanedText,
        words,
        dateAdded: Date.now(),
      };

      onImportDocument(newDoc);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch article. Please paste the article text or HTML directly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPastedText = () => {
    if (!pasteHtml.trim()) return;
    setErrorMsg(null);

    try {
      const title = pasteTitle.trim() || 'Pasted Article';
      const result = extractCleanArticle(pasteHtml, title);
      const words = tokenizeText(result.cleanedText);

      if (words.length === 0) {
        throw new Error('Could not find any readable text to extract.');
      }

      const newDoc: DocumentSource = {
        id: `clipped_paste_${Date.now()}`,
        title: result.title || title,
        author: result.byline || 'Clipped Source',
        type: 'paste',
        totalWords: words.length,
        chapters: [{
          id: 'chap_1',
          title: result.title || title,
          startWordIndex: 0,
          wordCount: words.length,
        }],
        rawText: result.cleanedText,
        words,
        dateAdded: Date.now(),
      };

      onImportDocument(newDoc);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing pasted text.');
    }
  };

  const bookmarkletCode = generateSpeedReadBookmarklet();

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setIsCopiedBookmarklet(true);
    setTimeout(() => setIsCopiedBookmarklet(false), 2000);
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
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Instant Web Clipper & Readability Mode</h2>
              <p className="text-xs" style={{ color: theme.textDim }}>
                Extract and stream clean articles into RSVP without ads, cookie walls, or popups
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
            onClick={() => { setActiveTab('url'); setErrorMsg(null); }}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'url' ? 'border-current font-bold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'url' ? theme.accent : theme.textBright }}
          >
            <Globe className="w-4 h-4" /> Fetch URL
          </button>
          <button
            onClick={() => { setActiveTab('paste'); setErrorMsg(null); }}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'paste' ? 'border-current font-bold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'paste' ? theme.accent : theme.textBright }}
          >
            <FileText className="w-4 h-4" /> Clean HTML / Text
          </button>
          <button
            onClick={() => { setActiveTab('bookmarklet'); setErrorMsg(null); }}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'bookmarklet' ? 'border-current font-bold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'bookmarklet' ? theme.accent : theme.textBright }}
          >
            <Bookmark className="w-4 h-4" /> 1-Click Bookmarklet
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  Article or Blog URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/blog/great-article"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-black/20 focus:outline-none"
                  style={{ borderColor: theme.border, color: theme.textBright }}
                />
              </div>

              <div className="p-4 rounded-xl border bg-white/5 space-y-2 text-xs" style={{ borderColor: theme.border }}>
                <p className="font-semibold flex items-center gap-1.5" style={{ color: theme.accent }}>
                  <Sparkles className="w-4 h-4" /> Mozilla Readability Extraction
                </p>
                <p className="opacity-70 leading-relaxed">
                  SpeedRead extracts core narrative text, parses headline structure, and strips away cookie banners, header links, and third-party tracking scripts.
                </p>
              </div>

              <button
                onClick={handleFetchUrl}
                disabled={isLoading || !urlInput.trim()}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border transition-all disabled:opacity-40"
                style={{
                  backgroundColor: theme.accent,
                  color: '#ffffff',
                  borderColor: theme.accent,
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting Article Prose...
                  </>
                ) : (
                  <>
                    <span>Clip & Start Reading</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  Document / Article Title (Optional)
                </label>
                <input
                  type="text"
                  value={pasteTitle}
                  onChange={(e) => setPasteTitle(e.target.value)}
                  placeholder="e.g. Deep Work Summary"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border bg-black/20 focus:outline-none"
                  style={{ borderColor: theme.border, color: theme.textBright }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  Raw HTML or Web Article Text
                </label>
                <textarea
                  rows={8}
                  value={pasteHtml}
                  onChange={(e) => setPasteHtml(e.target.value)}
                  placeholder="Paste article HTML source or unformatted web page copy here..."
                  className="w-full p-3 text-xs font-mono rounded-xl border bg-black/20 focus:outline-none resize-none"
                  style={{ borderColor: theme.border, color: theme.textBright }}
                />
              </div>

              <button
                onClick={handleProcessPastedText}
                disabled={!pasteHtml.trim()}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border transition-all disabled:opacity-40"
                style={{
                  backgroundColor: theme.accent,
                  color: '#ffffff',
                  borderColor: theme.accent,
                }}
              >
                <span>Clean & Start Reading</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === 'bookmarklet' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border bg-white/5 space-y-2" style={{ borderColor: theme.border }}>
                <h4 className="font-bold text-sm" style={{ color: theme.accent }}>
                  SpeedRead Bookmarklet
                </h4>
                <p className="opacity-70 leading-relaxed">
                  Add this bookmarklet to your browser's bookmarks bar. Whenever you are reading an article on any website (Medium, Substack, Wikipedia, The Verge, etc.), click the bookmarklet to open it in SpeedRead instantly!
                </p>
              </div>

              <div className="space-y-2">
                <label className="font-semibold uppercase tracking-wider opacity-70">
                  Bookmarklet Code
                </label>
                <div
                  className="p-3 rounded-xl border bg-black/40 font-mono text-[11px] break-all select-all max-h-24 overflow-y-auto"
                  style={{ borderColor: theme.border }}
                >
                  {bookmarkletCode}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyBookmarklet}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-colors"
                  style={{
                    backgroundColor: `${theme.accent}15`,
                    borderColor: `${theme.accent}40`,
                    color: theme.accent,
                  }}
                >
                  {isCopiedBookmarklet ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {isCopiedBookmarklet ? 'Copied Bookmarklet!' : 'Copy Bookmarklet Code'}
                </button>
              </div>

              <div className="p-3 rounded-xl border bg-black/20 space-y-1.5 opacity-80" style={{ borderColor: theme.border }}>
                <span className="font-bold">How to install in Chrome / Safari / Firefox:</span>
                <ol className="list-decimal list-inside space-y-1 opacity-80">
                  <li>Press <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">Ctrl+Shift+O</kbd> (or <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">Cmd+Shift+B</kbd>) to show Bookmarks bar.</li>
                  <li>Right-click bookmarks bar → "Add Page" / "New Bookmark".</li>
                  <li>Name it <b>"SpeedRead RSVP"</b> and paste the code above as the URL.</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
