import React, { useState } from 'react';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  Sparkles, 
  Zap, 
  List, 
  Bookmark, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Globe, 
  X,
  FileUp,
  Clock,
  CheckCircle2,
  Layers,
  ArrowRight,
  Cookie,
  Save,
  Coffee,
  Heart
} from 'lucide-react';
import { DocumentSource, DocumentChapter, SavedBookmark, ThemeColors } from '../types/reader';
import { SAMPLE_LIBRARY, createDocumentFromSample } from '../utils/sampleTexts';
import { tokenizeText } from '../utils/orp';
import { parsePdfFile } from '../utils/pdfParser';
import { parseEpubFile } from '../utils/epubParser';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeDoc: DocumentSource;
  onSelectDocument: (doc: DocumentSource, startWordIndex?: number) => void;
  currentWordIndex: number;
  onJumpToWord: (index: number) => void;
  bookmarks: SavedBookmark[];
  onRemoveBookmark: (docId: string) => void;
  onOpenFreeBooks: () => void;
  onOpenSaveStates?: () => void;
  theme: ThemeColors;
  wpm: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeDoc,
  onSelectDocument,
  currentWordIndex,
  onJumpToWord,
  bookmarks,
  onRemoveBookmark,
  onOpenFreeBooks,
  onOpenSaveStates,
  theme,
  wpm,
}) => {
  const [activeTab, setActiveTab] = useState<'chapters' | 'library' | 'history'>('chapters');
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'beginner' | 'classics' | 'scifi'>('all');
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setDropStatus] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedContent, setPastedContent] = useState('');

  const progressPercent = activeDoc.totalWords > 0 
    ? Math.min(100, (currentWordIndex / activeDoc.totalWords) * 100) 
    : 0;
  
  const wordsRemaining = Math.max(0, activeDoc.totalWords - currentWordIndex);
  const minutesRemaining = wpm > 0 ? (wordsRemaining / wpm).toFixed(0) : '0';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    setIsParsing(true);

    try {
      if (fileName.endsWith('.pdf')) {
        setDropStatus('Extracting PDF book...');
        const doc = await parsePdfFile(file);
        onSelectDocument(doc, 0);
      } else if (fileName.endsWith('.epub')) {
        setDropStatus('Unpacking ePub chapters...');
        const doc = await parseEpubFile(file);
        onSelectDocument(doc, 0);
      } else {
        const text = await file.text();
        const words = tokenizeText(text);
        const doc: DocumentSource = {
          id: `txt-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          type: 'txt',
          totalWords: words.length,
          chapters: [{ id: '1', title: 'Complete Text', startWordIndex: 0, wordCount: words.length }],
          rawText: text,
          words,
          dateAdded: Date.now(),
        };
        onSelectDocument(doc, 0);
      }
    } catch (err) {
      console.error('File load failed:', err);
    } finally {
      setIsParsing(false);
      setDropStatus('');
      e.target.value = '';
    }
  };

  const handleLoadPasted = () => {
    const trimmed = pastedContent.trim();
    if (!trimmed) return;
    const words = tokenizeText(trimmed);
    const title = pastedTitle.trim() || `Pasted Note (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
    const doc: DocumentSource = {
      id: `paste-${Date.now()}`,
      title,
      type: 'paste',
      totalWords: words.length,
      chapters: [{ id: '1', title: 'Document Text', startWordIndex: 0, wordCount: words.length }],
      rawText: trimmed,
      words,
      dateAdded: Date.now(),
    };
    onSelectDocument(doc, 0);
    setPastedContent('');
    setPastedTitle('');
    setShowPasteBox(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-80 sm:w-88 flex flex-col border-r transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.textBright,
        }}
      >
        {/* 1. Header */}
        <div 
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: theme.border, backgroundColor: theme.bg }}
        >
          <div className="flex items-center gap-2.5">
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
            >
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Reading Studio</h2>
              <p className="text-[10px] font-mono" style={{ color: theme.textDim }}>
                Bookshelf & Chapters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border transition-all active:scale-95 hover:opacity-80"
            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textDim }}
            title="Close sidebar (B)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Active Book Status Card */}
        <div className="p-4 border-b" style={{ borderColor: theme.border }}>
          <div 
            className="p-3.5 rounded-xl border flex flex-col gap-2.5"
            style={{ backgroundColor: theme.bg, borderColor: theme.border }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span 
                  className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-semibold tracking-wider inline-block mb-1"
                  style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
                >
                  {activeDoc.type} · NOW READING
                </span>
                <h3 className="font-semibold text-xs leading-snug truncate" style={{ color: theme.textBright }}>
                  {activeDoc.title}
                </h3>
                {activeDoc.author && (
                  <p className="text-[10px] truncate" style={{ color: theme.textDim }}>
                    {activeDoc.author}
                  </p>
                )}
              </div>
            </div>

            {/* Progress metrics */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono" style={{ color: theme.textDim }}>
                <span>{progressPercent.toFixed(1)}% complete</span>
                <span>~{minutesRemaining} min left</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.surfaceHover }}>
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%`, backgroundColor: theme.accent }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono pt-0.5" style={{ color: theme.textDim }}>
                <span>{currentWordIndex.toLocaleString()} / {activeDoc.totalWords.toLocaleString()} words</span>
                <span>{wpm} WPM</span>
              </div>
            </div>

            {/* Quick Save State / Break Trigger */}
            {onOpenSaveStates && (
              <button
                onClick={onOpenSaveStates}
                className="mt-1 w-full py-1.5 px-2.5 rounded-lg border text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: `${theme.accent}12`, borderColor: `${theme.accent}30`, color: theme.accent }}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save State / Cookie Break</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Navigation Tabs */}
        <div 
          className="flex border-b text-xs font-medium"
          style={{ borderColor: theme.border, backgroundColor: theme.bg }}
        >
          <button
            onClick={() => setActiveTab('chapters')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'chapters' ? 'font-bold border-current' : 'border-transparent opacity-60'
            }`}
            style={{ color: activeTab === 'chapters' ? theme.accent : theme.textDim }}
          >
            <List className="w-3.5 h-3.5" />
            <span>Contents ({activeDoc.chapters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'library' ? 'font-bold border-current' : 'border-transparent opacity-60'
            }`}
            style={{ color: activeTab === 'library' ? theme.accent : theme.textDim }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history' ? 'font-bold border-current' : 'border-transparent opacity-60'
            }`}
            style={{ color: activeTab === 'history' ? theme.accent : theme.textDim }}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved ({bookmarks.length})</span>
          </button>
        </div>

        {/* 4. Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* TAB 1: CHAPTERS & PAGES */}
          {activeTab === 'chapters' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase pb-1" style={{ color: theme.textDim }}>
                <span>Table of Contents</span>
                <span>{activeDoc.chapters.length} Sections</span>
              </div>

              {activeDoc.chapters.map((chap, idx) => {
                const isCurrent =
                  currentWordIndex >= chap.startWordIndex &&
                  (idx === activeDoc.chapters.length - 1 || currentWordIndex < activeDoc.chapters[idx + 1].startWordIndex);

                return (
                  <button
                    key={chap.id}
                    onClick={() => onJumpToWord(chap.startWordIndex)}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all group ${
                      isCurrent ? 'ring-2 font-bold shadow-sm' : 'hover:opacity-90'
                    }`}
                    style={{
                      backgroundColor: isCurrent ? theme.surfaceHover : theme.bg,
                      borderColor: isCurrent ? theme.accent : theme.border,
                      color: isCurrent ? theme.accent : theme.textBright,
                    }}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-[10px] font-mono opacity-60">
                        {chap.pageNumber ? `Page ${chap.pageNumber}` : `Section ${idx + 1}`}
                      </div>
                      <div className="truncate font-medium text-xs">
                        {chap.title}
                      </div>
                    </div>

                    <div className="text-[10px] font-mono opacity-70 shrink-0">
                      {chap.wordCount.toLocaleString()} w
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: LIBRARY & NEW BOOKS */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              {/* Add New File Dropzone */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider font-semibold mb-1.5" style={{ color: theme.textDim }}>
                  Load Book or Document
                </label>
                <label 
                  className="p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-opacity-100 group"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                >
                  <input
                    type="file"
                    accept=".pdf,.epub,.txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <FileUp className="w-6 h-6 mb-1.5 transition-transform group-hover:scale-110" style={{ color: theme.accent }} />
                  <span className="font-semibold text-xs" style={{ color: theme.textBright }}>
                    {isParsing ? parseStatus : 'Upload PDF / ePub / TXT'}
                  </span>
                  <span className="text-[10px] mt-0.5 opacity-60" style={{ color: theme.textDim }}>
                    Or drag and drop anywhere
                  </span>
                </label>
              </div>

              {/* Paste Text Toggle */}
              <div>
                {!showPasteBox ? (
                  <button
                    onClick={() => setShowPasteBox(true)}
                    className="w-full p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium transition-colors hover:opacity-90"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.textDim }}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Paste Text or Article</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl border space-y-2 animate-fadeIn" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
                    <input
                      type="text"
                      placeholder="Title (optional)"
                      value={pastedTitle}
                      onChange={(e) => setPastedTitle(e.target.value)}
                      className="w-full p-2 rounded-lg border text-xs focus:outline-none"
                      style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textBright }}
                    />
                    <textarea
                      placeholder="Paste text here..."
                      value={pastedContent}
                      onChange={(e) => setPastedContent(e.target.value)}
                      rows={4}
                      className="w-full p-2 rounded-lg border text-xs focus:outline-none resize-none"
                      style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textBright }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleLoadPasted}
                        disabled={!pastedContent.trim()}
                        className="flex-1 py-1.5 rounded-lg font-semibold text-xs text-white disabled:opacity-40"
                        style={{ backgroundColor: theme.accent }}
                      >
                        Read
                      </button>
                      <button
                        onClick={() => setShowPasteBox(false)}
                        className="px-3 py-1.5 rounded-lg border text-xs"
                        style={{ borderColor: theme.border, color: theme.textDim }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Curated Classic Books */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold" style={{ color: theme.textDim }}>
                    Free Books & Speed Drills
                  </span>
                  <span className="text-[10px] font-mono opacity-60" style={{ color: theme.textDim }}>
                    {SAMPLE_LIBRARY.length} Titles
                  </span>
                </div>

                {/* Filter Chips */}
                <div className="flex gap-1 mb-2.5 overflow-x-auto pb-0.5">
                  <button
                    onClick={() => setLibraryFilter('all')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                      libraryFilter === 'all' ? 'font-bold' : 'opacity-60'
                    }`}
                    style={{
                      backgroundColor: libraryFilter === 'all' ? `${theme.accent}25` : theme.bg,
                      color: libraryFilter === 'all' ? theme.accent : theme.textDim,
                    }}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setLibraryFilter('scifi')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                      libraryFilter === 'scifi' ? 'font-bold' : 'opacity-60'
                    }`}
                    style={{
                      backgroundColor: libraryFilter === 'scifi' ? `${theme.accent}25` : theme.bg,
                      color: libraryFilter === 'scifi' ? theme.accent : theme.textDim,
                    }}
                  >
                    Sci-Fi & Thriller
                  </button>
                  <button
                    onClick={() => setLibraryFilter('classics')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                      libraryFilter === 'classics' ? 'font-bold' : 'opacity-60'
                    }`}
                    style={{
                      backgroundColor: libraryFilter === 'classics' ? `${theme.accent}25` : theme.bg,
                      color: libraryFilter === 'classics' ? theme.accent : theme.textDim,
                    }}
                  >
                    Philosophy & Classics
                  </button>
                  <button
                    onClick={() => setLibraryFilter('beginner')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                      libraryFilter === 'beginner' ? 'font-bold' : 'opacity-60'
                    }`}
                    style={{
                      backgroundColor: libraryFilter === 'beginner' ? `${theme.accent}25` : theme.bg,
                      color: libraryFilter === 'beginner' ? theme.accent : theme.textDim,
                    }}
                  >
                    Youth
                  </button>
                </div>

                <div className="space-y-1.5">
                  {SAMPLE_LIBRARY.filter((sample) => {
                    const cat = sample.category.toLowerCase();
                    if (libraryFilter === 'beginner') {
                      return cat.includes('beginner') || cat.includes('children') || cat.includes('fables');
                    }
                    if (libraryFilter === 'scifi') {
                      return cat.includes('sci-fi') || cat.includes('mystery') || cat.includes('thriller') || cat.includes('gothic') || cat.includes('detective');
                    }
                    if (libraryFilter === 'classics') {
                      return cat.includes('philosophy') || cat.includes('strategy') || cat.includes('classics') || cat.includes('drama') || cat.includes('science &');
                    }
                    return true;
                  }).map((sample) => {
                    const isBeginner = sample.category.toLowerCase().includes('beginner') || sample.category.toLowerCase().includes('children');
                    const isSelected = activeDoc.id === sample.id;

                    return (
                      <button
                        key={sample.id}
                        onClick={() => onSelectDocument(createDocumentFromSample(sample), 0)}
                        className={`w-full text-left p-2.5 rounded-xl border flex flex-col gap-1 transition-all group ${
                          isSelected ? 'ring-2 font-semibold shadow-sm' : 'hover:opacity-95'
                        }`}
                        style={{
                          backgroundColor: isSelected ? theme.surfaceHover : theme.bg,
                          borderColor: isSelected ? theme.accent : theme.border,
                          color: isSelected ? theme.accent : theme.textBright,
                        }}
                      >
                        <div className="flex items-start justify-between gap-1 w-full">
                          <div className="min-w-0 pr-1">
                            <div className="flex items-center gap-1.5">
                              {isBeginner && (
                                <span 
                                  className="text-[8px] uppercase font-mono px-1 py-0.1 rounded font-bold"
                                  style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
                                >
                                  Beginner
                                </span>
                              )}
                              <span className="text-[9px] font-mono opacity-60 truncate">
                                {sample.chapters.length} {sample.chapters.length === 1 ? 'Chapter' : 'Chapters'}
                              </span>
                            </div>
                            <div className="truncate font-semibold text-xs mt-0.5">
                              {sample.title}
                            </div>
                          </div>
                          <div className="shrink-0 text-[10px] font-mono opacity-60 text-right">
                            {sample.author}
                          </div>
                        </div>

                        {sample.description && (
                          <p className="text-[10px] line-clamp-1 opacity-70" style={{ color: theme.textDim }}>
                            {sample.description}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BOOKMARKS & HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {/* Save States & Cookie Places Banner in History */}
              {onOpenSaveStates && (
                <div 
                  className="p-3 rounded-xl border flex items-center justify-between gap-2"
                  style={{ backgroundColor: theme.bg, borderColor: `${theme.accent}40` }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-1.5 rounded-lg"
                      style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
                    >
                      <Save className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs" style={{ color: theme.textBright }}>
                        Save States & Cookie Places
                      </div>
                      <div className="text-[10px]" style={{ color: theme.textDim }}>
                        Snapshot multi-slot states or resume from breaks
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onOpenSaveStates}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white transition-transform active:scale-95 shadow-sm"
                    style={{ backgroundColor: theme.accent }}
                  >
                    Open
                  </button>
                </div>
              )}

              <span className="block text-[10px] font-mono uppercase tracking-wider font-semibold" style={{ color: theme.textDim }}>
                Reading History & Bookmarks
              </span>

              {bookmarks.length === 0 ? (
                <div className="text-center py-8 text-xs opacity-60" style={{ color: theme.textDim }}>
                  No saved reading sessions yet.
                </div>
              ) : (
                bookmarks.map((bm) => {
                  const percent = bm.totalWords > 0 ? ((bm.lastWordIndex / bm.totalWords) * 100).toFixed(0) : '0';
                  const isCurrent = activeDoc.id === bm.documentId;

                  return (
                    <div
                      key={bm.documentId}
                      className="p-3 rounded-xl border flex items-center justify-between gap-2"
                      style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-xs truncate" style={{ color: theme.textBright }}>
                          {bm.title}
                        </div>
                        <div className="text-[10px] font-mono mt-0.5" style={{ color: theme.textDim }}>
                          {percent}% read · {bm.lastWordIndex.toLocaleString()} w
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCurrent ? (
                          <button
                            onClick={() => onJumpToWord(bm.lastWordIndex)}
                            className="px-2 py-1 text-[10px] font-semibold rounded text-white"
                            style={{ backgroundColor: theme.accent }}
                          >
                            Jump
                          </button>
                        ) : null}
                        <button
                          onClick={() => onRemoveBookmark(bm.documentId)}
                          className="p-1 rounded hover:text-red-400 transition-colors"
                          style={{ color: theme.textDim }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 5. Footer: Free Books Finder Trigger */}
        <div 
          className="p-3.5 border-t"
          style={{ borderColor: theme.border, backgroundColor: theme.bg }}
        >
          <button
            onClick={() => {
              onClose();
              onOpenFreeBooks();
            }}
            className="w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all active:scale-95 shadow-sm"
            style={{
              backgroundColor: `${theme.accent}12`,
              borderColor: `${theme.accent}40`,
              color: theme.textBright,
            }}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-xs">Full Classics Library (L)</div>
                <div className="text-[10px]" style={{ color: theme.textDim }}>11 Complete Books & Gutenberg Hub</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5" style={{ color: theme.accent }} />
          </button>
        </div>
      </aside>
    </>
  );
};
