import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  BookOpen, 
  Clock, 
  List, 
  Trash2, 
  Play, 
  FileUp, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Bookmark
} from 'lucide-react';
import { DocumentSource, DocumentChapter, SavedBookmark, ThemeColors } from '../types/reader';
import { parsePdfFile } from '../utils/pdfParser';
import { parseEpubFile } from '../utils/epubParser';
import { tokenizeText } from '../utils/orp';
import { SAMPLE_LIBRARY, createDocumentFromSample } from '../utils/sampleTexts';

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeDocument: DocumentSource | null;
  onSelectDocument: (doc: DocumentSource, startWordIndex?: number) => void;
  onJumpToWord: (wordIndex: number) => void;
  currentWordIndex: number;
  bookmarks: SavedBookmark[];
  onRemoveBookmark: (docId: string) => void;
  theme: ThemeColors;
}

export const DocumentDrawer: React.FC<DocumentDrawerProps> = ({
  isOpen,
  onClose,
  activeDocument,
  onSelectDocument,
  onJumpToWord,
  currentWordIndex,
  bookmarks,
  onRemoveBookmark,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples' | 'bookmarks' | 'chapters'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [pastedTitle, setPastedTitle] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<string>('');
  const [parsePercent, setParsePercent] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsParsing(true);
    setParsePercent(0);

    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.pdf')) {
        setParseStatus('Loading PDF document...');
        const doc = await parsePdfFile(file, (p) => {
          setParsePercent(p.percent);
          setParseStatus(`Processing page ${p.currentPage} of ${p.totalPages}...`);
        });
        onSelectDocument(doc, 0);
        onClose();
      } else if (fileName.endsWith('.epub')) {
        setParseStatus('Unpacking EPUB chapters...');
        const doc = await parseEpubFile(file, (p) => {
          setParsePercent(p.percent);
          setParseStatus(p.status || `Reading section ${p.currentChapter}/${p.totalChapters}...`);
        });
        onSelectDocument(doc, 0);
        onClose();
      } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        setParseStatus('Reading plain text...');
        const text = await file.text();
        const words = tokenizeText(text);
        const doc: DocumentSource = {
          id: `txt-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          type: 'txt',
          totalWords: words.length,
          chapters: [{
            id: 'full',
            title: 'Complete Text',
            startWordIndex: 0,
            wordCount: words.length,
          }],
          rawText: text,
          words,
          fileSize: file.size,
          dateAdded: Date.now(),
        };
        onSelectDocument(doc, 0);
        onClose();
      } else {
        throw new Error('Unsupported format. Please select a PDF (.pdf), EPUB (.epub), or Text (.txt) file.');
      }
    } catch (err: unknown) {
      console.error('File parsing error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to parse file.';
      setErrorMsg(msg);
    } finally {
      setIsParsing(false);
      setParsePercent(0);
      setParseStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLoadPasted = () => {
    const trimmed = pastedText.trim();
    if (!trimmed) {
      setErrorMsg('Please paste some text first.');
      return;
    }

    const words = tokenizeText(trimmed);
    const title = pastedTitle.trim() || `Pasted Note (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;

    const doc: DocumentSource = {
      id: `paste-${Date.now()}`,
      title,
      type: 'paste',
      totalWords: words.length,
      chapters: [{
        id: 'paste-full',
        title: 'Document Body',
        startWordIndex: 0,
        wordCount: words.length,
      }],
      rawText: trimmed,
      words,
      dateAdded: Date.now(),
    };

    onSelectDocument(doc, 0);
    setPastedText('');
    setPastedTitle('');
    onClose();
  };

  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_LIBRARY.find(s => s.id === sampleId);
    if (!sample) return;
    const doc = createDocumentFromSample(sample);
    onSelectDocument(doc, 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.textBright,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: theme.accent }} />
            <div>
              <h2 className="font-semibold text-lg">Document Library & Reader</h2>
              {activeDocument && (
                <p className="text-xs truncate max-w-sm" style={{ color: theme.textDim }}>
                  Active: {activeDocument.title} ({activeDocument.totalWords.toLocaleString()} words)
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border transition-colors hover:opacity-80 active:scale-95"
            style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.textDim }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          className="flex items-center px-6 border-b gap-4 text-xs font-medium overflow-x-auto"
          style={{ borderColor: theme.border, backgroundColor: theme.bg }}
        >
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'upload' ? 'border-current font-bold' : 'border-transparent opacity-60'
            }`}
            style={{ color: activeTab === 'upload' ? theme.accent : theme.textDim }}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Upload (PDF / ePub / TXT)</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`py-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'paste' ? 'border-current font-bold' : 'border-transparent opacity-60'
            }`}
            style={{ color: activeTab === 'paste' ? theme.accent : theme.textDim }}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Text</span>
          </button>

          <button
            onClick={() => setActiveTab('samples')}
            className={`py-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'samples' ? 'border-current font-bold' : 'border-transparent opacity-60'
            }`}
            style={{ color: activeTab === 'samples' ? theme.accent : theme.textDim }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sample Library</span>
          </button>

          {bookmarks.length > 0 && (
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`py-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'bookmarks' ? 'border-current font-bold' : 'border-transparent opacity-60'
              }`}
              style={{ color: activeTab === 'bookmarks' ? theme.accent : theme.textDim }}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved History ({bookmarks.length})</span>
            </button>
          )}

          {activeDocument && activeDocument.chapters.length > 1 && (
            <button
              onClick={() => setActiveTab('chapters')}
              className={`py-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'chapters' ? 'border-current font-bold' : 'border-transparent opacity-60'
              }`}
              style={{ color: activeTab === 'chapters' ? theme.accent : theme.textDim }}
            >
              <List className="w-3.5 h-3.5" />
              <span>Chapters / Pages ({activeDocument.chapters.length})</span>
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.epub,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => !isParsing && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group ${
                  isParsing ? 'opacity-70 pointer-events-none' : 'hover:border-opacity-100 hover:scale-[1.01]'
                }`}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                }}
              >
                {isParsing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.accent }} />
                    <p className="font-medium text-sm">{parseStatus || 'Extracting reading text...'}</p>
                    {parsePercent > 0 && (
                      <div className="w-48 bg-slate-700/30 rounded-full h-2 overflow-hidden mt-1">
                        <div
                          className="h-full transition-all duration-200"
                          style={{
                            width: `${parsePercent}%`,
                            backgroundColor: theme.accent,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md"
                      style={{ backgroundColor: theme.surface, color: theme.accent }}
                    >
                      <Upload className="w-7 h-7" />
                    </div>
                    <h3 className="font-semibold text-base mb-1">Upload PDF, ePub, or Text Document</h3>
                    <p className="text-xs max-w-sm mb-4" style={{ color: theme.textDim }}>
                      Drop your files here or click to browse. Automatically cleans formatting and extracts chapters & pages.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-mono" style={{ color: theme.textDim }}>
                      <span className="px-2 py-0.5 rounded border" style={{ borderColor: theme.border }}>.pdf</span>
                      <span className="px-2 py-0.5 rounded border" style={{ borderColor: theme.border }}>.epub</span>
                      <span className="px-2 py-0.5 rounded border" style={{ borderColor: theme.border }}>.txt</span>
                      <span className="px-2 py-0.5 rounded border" style={{ borderColor: theme.border }}>.md</span>
                    </div>
                  </>
                )}
              </div>

              {/* Instant Book Starters */}
              <div className="pt-2">
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: theme.textDim }}>
                  Or Start Instantly with a Book:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleSelectSample('sample-harry-potter-ch1')}
                    className="p-3.5 rounded-xl border flex items-center justify-between text-left transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: theme.bg, borderColor: theme.accent }}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: theme.accent }}>
                        <span>⚡ Featured Book</span>
                      </div>
                      <div className="font-semibold text-sm mt-0.5" style={{ color: theme.textBright }}>
                        Harry Potter & Sorcerer's Stone
                      </div>
                      <div className="text-xs opacity-70" style={{ color: theme.textDim }}>
                        Chapter 1: The Boy Who Lived
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0 ml-2" style={{ backgroundColor: theme.accent }}>
                      Read
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectSample('sample-video-speed-challenge')}
                    className="p-3.5 rounded-xl border flex items-center justify-between text-left transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <span>🎯 Video Drill</span>
                      </div>
                      <div className="font-semibold text-sm mt-0.5" style={{ color: theme.textBright }}>
                        600 WPM Challenge
                      </div>
                      <div className="text-xs opacity-70" style={{ color: theme.textDim }}>
                        Exact training drill from the video
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg text-xs font-semibold border shrink-0 ml-2" style={{ borderColor: theme.border, color: theme.textBright }}>
                      Test
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2" style={{ color: theme.textDim }}>
                <div className="p-3 rounded-xl border" style={{ borderColor: theme.border, backgroundColor: theme.bg }}>
                  <span className="font-semibold block mb-0.5" style={{ color: theme.textBright }}>PDF Parsing</span>
                  <span>Instant page-by-page tokenization with metadata detection.</span>
                </div>
                <div className="p-3 rounded-xl border" style={{ borderColor: theme.border, backgroundColor: theme.bg }}>
                  <span className="font-semibold block mb-0.5" style={{ color: theme.textBright }}>ePub Books</span>
                  <span>Full spine extraction, table of contents & chapter jumps.</span>
                </div>
                <div className="p-3 rounded-xl border" style={{ borderColor: theme.border, backgroundColor: theme.bg }}>
                  <span className="font-semibold block mb-0.5" style={{ color: theme.textBright }}>Zero Cloud Upload</span>
                  <span>100% private client-side processing directly in your browser.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PASTE TEXT */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider font-semibold mb-1.5" style={{ color: theme.textDim }}>
                  Document Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Article on Quantum Computing"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.textBright }}
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider font-semibold mb-1.5" style={{ color: theme.textDim }}>
                  Paste Text Content
                </label>
                <textarea
                  placeholder="Paste article, book chapter, or essay here..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={8}
                  className="w-full p-4 rounded-xl border text-sm font-sans focus:outline-none resize-none"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.textBright }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono" style={{ color: theme.textDim }}>
                <span>
                  Estimated words:{' '}
                  <strong style={{ color: theme.textBright }}>
                    {pastedText.trim() ? pastedText.trim().split(/\s+/).length.toLocaleString() : 0}
                  </strong>
                </span>

                <button
                  onClick={handleLoadPasted}
                  disabled={!pastedText.trim()}
                  className="px-5 py-2 rounded-xl text-white font-semibold text-xs transition-transform active:scale-95 disabled:opacity-40"
                  style={{ backgroundColor: theme.accent }}
                >
                  Load & Start Reading
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SAMPLE LIBRARY */}
          {activeTab === 'samples' && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: theme.textDim }}>
                Select any curated reading sample below to immediately test the RSVP speed reader engine:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {SAMPLE_LIBRARY.map((sample) => (
                  <div
                    key={sample.id}
                    className="p-4 rounded-xl border flex items-center justify-between gap-4 transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ backgroundColor: theme.surface, color: theme.accent }}>
                          {sample.category}
                        </span>
                        <h4 className="font-semibold text-sm" style={{ color: theme.textBright }}>
                          {sample.title}
                        </h4>
                      </div>
                      <p className="text-xs mt-1" style={{ color: theme.textDim }}>
                        Author: {sample.author} · {sample.chapters.length} Chapters
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectSample(sample.id)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl text-white flex items-center gap-1.5 transition-transform active:scale-95 shrink-0"
                      style={{ backgroundColor: theme.accent }}
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Read</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SAVED BOOKMARKS */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: theme.textDim }}>
                Your reading progress across previous documents:
              </p>

              {bookmarks.length === 0 ? (
                <div className="text-center py-8 text-xs" style={{ color: theme.textDim }}>
                  No saved reading bookmarks yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {bookmarks.map((bm) => {
                    const percent = bm.totalWords > 0 ? ((bm.lastWordIndex / bm.totalWords) * 100).toFixed(1) : '0';
                    const isCurrent = activeDocument?.id === bm.documentId;

                    return (
                      <div
                        key={bm.documentId}
                        className="p-3.5 rounded-xl border flex items-center justify-between gap-3"
                        style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                      >
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm truncate" style={{ color: theme.textBright }}>
                            {bm.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs font-mono mt-0.5" style={{ color: theme.textDim }}>
                            <span>{percent}% done</span>
                            <span>·</span>
                            <span>{bm.lastWordIndex.toLocaleString()} / {bm.totalWords.toLocaleString()} w</span>
                            <span>·</span>
                            <span>{new Date(bm.lastReadTimestamp).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isCurrent ? (
                            <button
                              onClick={() => {
                                onJumpToWord(bm.lastWordIndex);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                              style={{ backgroundColor: theme.accent }}
                            >
                              Jump to {percent}%
                            </button>
                          ) : (
                            <span className="text-[11px] opacity-60" style={{ color: theme.textDim }}>
                              (Re-open file to resume)
                            </span>
                          )}

                          <button
                            onClick={() => onRemoveBookmark(bm.documentId)}
                            className="p-2 rounded-lg border hover:text-red-400 transition-colors"
                            style={{ borderColor: theme.border, color: theme.textDim }}
                            title="Remove bookmark"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CHAPTERS & PAGES */}
          {activeTab === 'chapters' && activeDocument && (
            <div className="space-y-2">
              <p className="text-xs" style={{ color: theme.textDim }}>
                Jump directly to any section of <strong style={{ color: theme.textBright }}>{activeDocument.title}</strong>:
              </p>

              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {activeDocument.chapters.map((chap, idx) => {
                  const isCurrentChapter =
                    currentWordIndex >= chap.startWordIndex &&
                    (idx === activeDocument.chapters.length - 1 || currentWordIndex < activeDocument.chapters[idx + 1].startWordIndex);

                  return (
                    <button
                      key={chap.id}
                      onClick={() => {
                        onJumpToWord(chap.startWordIndex);
                        onClose();
                      }}
                      className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isCurrentChapter ? 'ring-2 font-bold' : 'hover:opacity-90'
                      }`}
                      style={{
                        backgroundColor: isCurrentChapter ? theme.surfaceHover : theme.bg,
                        borderColor: isCurrentChapter ? theme.accent : theme.border,
                        color: isCurrentChapter ? theme.accent : theme.textBright,
                      }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs font-mono opacity-60">#{idx + 1}</span>
                        <span className="text-sm truncate">{chap.title}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono opacity-70 shrink-0">
                        {chap.pageNumber && <span>p.{chap.pageNumber}</span>}
                        <span>{chap.wordCount.toLocaleString()} w</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
