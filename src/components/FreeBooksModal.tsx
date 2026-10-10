import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Download, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Globe, 
  Play, 
  Rss, 
  Search, 
  ArrowRight,
  Layers,
  Clock,
  ChevronDown,
  ChevronUp,
  Bookmark,
  FileText,
  Filter,
  Flame,
  Loader2
} from 'lucide-react';
import { ThemeColors, DocumentSource, CatalogBook } from '../types/reader';
import { 
  CURATED_OPEN_CATALOG, 
  parseOpdsFeedXml, 
  GUTENBERG_DIRECT_BOOKS,
  GutenbergBookPreset,
  cleanGutenbergBoilerplate,
  extractChaptersFromText
} from '../utils/openCatalog';
import { ALL_FULL_BOOKS, FullBookDef } from '../books';
import { createDocumentFromSample } from '../utils/sampleTexts';
import { tokenizeText } from '../utils/orp';

interface FreeBooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook?: (doc: DocumentSource) => void;
  theme: ThemeColors;
  wpm?: number;
}

interface FreeBookSource {
  name: string;
  url: string;
  description: string;
  formats: string[];
  recommended: string;
  tag: string;
}

export const FREE_BOOK_SOURCES: FreeBookSource[] = [
  {
    name: 'Standard Ebooks',
    url: 'https://standardebooks.org',
    description: 'Beautifully typeset, free public domain ebooks crafted for e-readers. Superior typography, proper formatting, and free of typos.',
    formats: ['EPUB', 'AZW3', 'KEPUB'],
    recommended: 'Frankenstein, Sherlock Holmes, The Great Gatsby',
    tag: 'Highest Quality',
  },
  {
    name: 'Project Gutenberg',
    url: 'https://www.gutenberg.org',
    description: 'Over 70,000 free classic books. The world’s oldest and largest digital library of free literature and public domain works.',
    formats: ['EPUB', 'PDF', 'TXT', 'HTML'],
    recommended: 'Dracula, Pride and Prejudice, Alice in Wonderland',
    tag: 'Largest Catalog (70k+)',
  },
  {
    name: 'Open Library & Internet Archive',
    url: 'https://openlibrary.org',
    description: 'Millions of digitised books from world libraries available to read or borrow digitally with full-text search.',
    formats: ['EPUB', 'PDF'],
    recommended: 'Classic fantasy, adventure novels, historic texts',
    tag: '3M+ Books',
  },
  {
    name: 'Planet eBook',
    url: 'https://www.planetebook.com',
    description: 'Curated collection of great classic novels formatted specifically for pleasant mobile and desktop reading.',
    formats: ['EPUB', 'PDF'],
    recommended: '1984, The Picture of Dorian Gray, Jane Eyre',
    tag: 'Clean Design',
  },
  {
    name: 'ManyBooks',
    url: 'https://manybooks.net',
    description: 'Over 50,000 free books sorted by modern genres: Fantasy, Sci-Fi, Mystery, Thriller, and Romance.',
    formats: ['EPUB', 'PDF'],
    recommended: 'Genre fiction, short stories, classic mystery',
    tag: 'Genre Focused',
  },
  {
    name: 'Feedbooks Public Domain',
    url: 'https://www.feedbooks.com/publicdomain',
    description: 'Thousands of free public domain classics formatted with clean chapter breaks and tables of contents.',
    formats: ['EPUB'],
    recommended: 'Jules Verne, H.G. Wells, Arthur Conan Doyle',
    tag: 'Easy Downloads',
  },
  {
    name: 'LibriVox (Audiobooks)',
    url: 'https://librivox.org',
    description: 'Free public domain audiobooks read by volunteers worldwide. Great to pair with RSVP reading or speech synthesis.',
    formats: ['MP3', 'Podcast'],
    recommended: 'The Art of War, Peter Pan, The Time Machine',
    tag: 'Audio Companion',
  },
  {
    name: 'Wikisource',
    url: 'https://en.wikisource.org',
    description: 'Free online library of original source texts, philosophical essays, historical speeches, and classical literature.',
    formats: ['HTML', 'EPUB', 'PDF'],
    recommended: 'Marcus Aurelius, Shakespeare, Plato',
    tag: 'Primary Sources',
  },
];

export const FreeBooksModal: React.FC<FreeBooksModalProps> = ({
  isOpen,
  onClose,
  onSelectBook,
  theme,
  wpm = 350,
}) => {
  const [activeTab, setActiveTab] = useState<'classics' | 'gutenberg' | 'sources' | 'opds'>('classics');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  
  // Gutenberg Live Streamer State
  const [gutenbergInput, setGutenbergInput] = useState('');
  const [isLoadingGutenberg, setIsLoadingGutenberg] = useState(false);
  const [gutenbergStatus, setGutenbergStatus] = useState<string | null>(null);

  // OPDS State
  const [opdsInput, setOpdsInput] = useState('');
  const [opdsEntries, setOpdsEntries] = useState<Array<{ id: string; title: string; author: string; summary: string; downloadUrl?: string }>>([]);

  if (!isOpen) return null;

  // Filter full books
  const filteredFullBooks = ALL_FULL_BOOKS.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.description.toLowerCase().includes(search.toLowerCase()) ||
      book.category.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'scifi') {
      return book.category.toLowerCase().includes('sci-fi') || book.category.toLowerCase().includes('travel') || book.category.toLowerCase().includes('time');
    }
    if (selectedCategory === 'mystery') {
      return book.category.toLowerCase().includes('mystery') || book.category.toLowerCase().includes('thriller') || book.category.toLowerCase().includes('detective');
    }
    if (selectedCategory === 'philosophy') {
      return book.category.toLowerCase().includes('philosophy') || book.category.toLowerCase().includes('strategy');
    }
    if (selectedCategory === 'literature') {
      return book.category.toLowerCase().includes('classics') || book.category.toLowerCase().includes('drama') || book.category.toLowerCase().includes('victorian') || book.category.toLowerCase().includes('surrealism');
    }
    if (selectedCategory === 'youth') {
      return book.category.toLowerCase().includes('beginner') || book.category.toLowerCase().includes('children') || book.category.toLowerCase().includes('fables');
    }

    return true;
  });

  const handleLoadFullBook = (book: FullBookDef, chapterIndex = 0) => {
    if (!onSelectBook) return;

    const doc = createDocumentFromSample({
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      description: book.description,
      chapters: book.chapters,
    });

    onSelectBook(doc);
    onClose();
  };

  const handleFetchGutenberg = async (presetOrId?: string) => {
    const target = (presetOrId || gutenbergInput).trim();
    if (!target) return;

    // Extract numerical ID
    const match = target.match(/(\d+)/);
    const bookId = match ? match[1] : target;

    setIsLoadingGutenberg(true);
    setGutenbergStatus(`Connecting to Project Gutenberg book #${bookId}...`);

    try {
      // Primary Gutenberg plain text URL
      const gutenbergUrls = [
        `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`,
        `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`,
        `https://raw.githubusercontent.com/gutenberg-archive/${bookId}/master/${bookId}.txt`,
      ];

      let rawText = '';
      for (const url of gutenbergUrls) {
        try {
          // Attempt direct fetch first (or via reliable CORS mirror)
          const mirrorUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
          const res = await fetch(mirrorUrl);
          if (res.ok) {
            rawText = await res.text();
            if (rawText && rawText.length > 500) break;
          }
        } catch {
          // Continue to next mirror
        }
      }

      if (!rawText || rawText.length < 500) {
        throw new Error('Unable to stream full text automatically. You can download the EPUB or TXT file directly from Gutenberg and drop it into SpeedRead.');
      }

      setGutenbergStatus('Parsing chapters and formatting typography...');
      const cleanedText = cleanGutenbergBoilerplate(rawText);
      const chapters = extractChaptersFromText(cleanedText, `Gutenberg Book #${bookId}`);

      // Try finding title/author in text header
      const titleMatch = rawText.match(/Title:\s*([^\r\n]+)/i);
      const authorMatch = rawText.match(/Author:\s*([^\r\n]+)/i);
      const bookTitle = titleMatch ? titleMatch[1].trim() : `Project Gutenberg Book #${bookId}`;
      const bookAuthor = authorMatch ? authorMatch[1].trim() : 'Project Gutenberg';

      const doc = createDocumentFromSample({
        id: `gutenberg_${bookId}`,
        title: bookTitle,
        author: bookAuthor,
        category: 'Project Gutenberg Classic',
        description: `Imported directly from Project Gutenberg #${bookId}. Unabridged public domain edition.`,
        chapters: chapters.map((c) => ({
          title: c.title,
          text: c.text,
        })),
      });

      if (onSelectBook) {
        onSelectBook(doc);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setGutenbergStatus(msg);
    } finally {
      setIsLoadingGutenberg(false);
    }
  };

  const handleParseOpds = () => {
    if (!opdsInput.trim()) return;
    const entries = parseOpdsFeedXml(opdsInput);
    setOpdsEntries(entries);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.textBright,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 sm:px-6 py-4 border-b shrink-0"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl flex items-center justify-center shadow-inner"
              style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg tracking-tight">SpeedRead Library & Free Books Hub</h2>
                <span 
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold"
                  style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
                >
                  {ALL_FULL_BOOKS.length} Full Classics
                </span>
              </div>
              <p className="text-xs" style={{ color: theme.textDim }}>
                Read complete unabridged masterpieces offline, stream Gutenberg titles, or browse top free ebook hubs
              </p>
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

        {/* Tab Controls */}
        <div className="flex border-b px-6 pt-2 gap-4 sm:gap-6 text-xs sm:text-sm font-medium overflow-x-auto shrink-0" style={{ borderColor: theme.border }}>
          <button
            onClick={() => setActiveTab('classics')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === 'classics' ? 'border-current font-bold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'classics' ? theme.accent : theme.textBright }}
          >
            <BookOpen className="w-4 h-4" />
            <span>Full Classics ({ALL_FULL_BOOKS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gutenberg')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === 'gutenberg' ? 'border-current font-bold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'gutenberg' ? theme.accent : theme.textBright }}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Gutenberg Streamer</span>
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === 'sources' ? 'border-current font-bold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'sources' ? theme.accent : theme.textBright }}
          >
            <Globe className="w-4 h-4" />
            <span>Free Ebook Directories ({FREE_BOOK_SOURCES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('opds')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === 'opds' ? 'border-current font-bold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'opds' ? theme.accent : theme.textBright }}
          >
            <Rss className="w-4 h-4" />
            <span>OPDS Feeds</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:px-6 overflow-y-auto space-y-4 flex-1">

          {/* TAB 1: FULL CLASSICS LIBRARY */}
          {activeTab === 'classics' && (
            <div className="space-y-4">
              {/* Search & Category Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title, author, keyword, or genre..."
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border bg-black/20 focus:outline-none"
                    style={{ borderColor: theme.border, color: theme.textBright }}
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'scifi', label: 'Sci-Fi' },
                    { id: 'mystery', label: 'Mystery' },
                    { id: 'philosophy', label: 'Philosophy' },
                    { id: 'literature', label: 'Literature' },
                    { id: 'youth', label: 'Youth' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat.id ? 'font-bold shadow-sm' : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: selectedCategory === cat.id ? `${theme.accent}25` : theme.bg,
                        color: selectedCategory === cat.id ? theme.accent : theme.textDim,
                        border: `1px solid ${selectedCategory === cat.id ? theme.accent : theme.border}`,
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Books Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredFullBooks.map((book) => {
                  const isExpanded = expandedBookId === book.id;
                  const estimatedMinutes = Math.max(15, Math.round(book.estimatedMinutes * (350 / wpm)));

                  return (
                    <div
                      key={book.id}
                      className="rounded-xl border p-4 flex flex-col justify-between gap-3 transition-all hover:border-white/20 group relative overflow-hidden"
                      style={{
                        backgroundColor: `${theme.bg}95`,
                        borderColor: theme.border,
                      }}
                    >
                      {/* Left accent strip */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5"
                        style={{ backgroundColor: book.coverAccent || theme.accent }}
                      />

                      <div className="pl-2 space-y-2">
                        {/* Badges Bar */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span 
                              className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold"
                              style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}
                            >
                              {book.category}
                            </span>
                            <span 
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded opacity-75"
                              style={{ backgroundColor: `${theme.surface}`, color: theme.textDim }}
                            >
                              {book.difficulty}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] font-mono opacity-60">
                            <Clock className="w-3 h-3" />
                            <span>~{estimatedMinutes}m @ {wpm} WPM</span>
                          </div>
                        </div>

                        {/* Title & Author */}
                        <div>
                          <h3 className="font-bold text-sm sm:text-base leading-tight group-hover:text-rose-400 transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-xs opacity-75 font-medium mt-0.5" style={{ color: theme.textDim }}>
                            by {book.author} {book.year ? `(${book.year})` : ''}
                          </p>
                        </div>

                        {/* Description */}
                        <p className="text-xs leading-relaxed opacity-70 line-clamp-2">
                          {book.description}
                        </p>

                        {/* Chapters Preview Drawer */}
                        {isExpanded && (
                          <div 
                            className="mt-3 pt-3 border-t space-y-1.5 max-h-48 overflow-y-auto pr-1 animate-fadeIn"
                            style={{ borderColor: theme.border }}
                          >
                            <div className="text-[10px] font-mono uppercase opacity-50 font-bold mb-1">
                              Table of Contents ({book.chapters.length} Chapters):
                            </div>
                            {book.chapters.map((chap, cIdx) => (
                              <button
                                key={cIdx}
                                onClick={() => handleLoadFullBook(book, cIdx)}
                                className="w-full text-left p-1.5 rounded-lg text-xs flex items-center justify-between gap-2 hover:opacity-90 transition-colors"
                                style={{ backgroundColor: theme.surface, color: theme.textBright }}
                              >
                                <span className="truncate text-[11px] font-medium">
                                  {chap.title}
                                </span>
                                <span className="text-[9px] font-mono opacity-50 shrink-0">
                                  Read Chapter →
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="pl-2 pt-2 border-t flex items-center justify-between gap-2" style={{ borderColor: `${theme.border}80` }}>
                        <button
                          onClick={() => setExpandedBookId(isExpanded ? null : book.id)}
                          className="text-[11px] font-mono flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                          style={{ color: theme.textDim }}
                        >
                          {isExpanded ? (
                            <>Hide Chapters <ChevronUp className="w-3 h-3" /></>
                          ) : (
                            <>{book.chapters.length} Chapters <ChevronDown className="w-3 h-3" /></>
                          )}
                        </button>

                        <button
                          onClick={() => handleLoadFullBook(book, 0)}
                          className="px-3 py-1.5 rounded-lg font-semibold text-xs text-white flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95"
                          style={{ backgroundColor: theme.accent }}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Start Reading</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PROJECT GUTENBERG LIVE STREAMER */}
          {activeTab === 'gutenberg' && (
            <div className="space-y-4">
              <div 
                className="p-4 rounded-xl border space-y-3"
                style={{ backgroundColor: `${theme.bg}80`, borderColor: theme.border }}
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <h3 className="font-semibold text-sm">Stream Any Book by Project Gutenberg ID or URL</h3>
                </div>
                <p className="text-xs leading-relaxed opacity-70">
                  Project Gutenberg hosts over 70,000 public domain titles. Enter a book ID (e.g. <code className="px-1 py-0.5 rounded bg-black/40">1342</code> for Pride and Prejudice) or full Gutenberg link to stream and format all chapters directly into SpeedRead:
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={gutenbergInput}
                    onChange={(e) => setGutenbergInput(e.target.value)}
                    placeholder="Enter Gutenberg ID or URL (e.g. 84, 1342, 64317)..."
                    className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border bg-black/20 focus:outline-none"
                    style={{ borderColor: theme.border, color: theme.textBright }}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchGutenberg()}
                  />
                  <button
                    onClick={() => handleFetchGutenberg()}
                    disabled={isLoadingGutenberg || !gutenbergInput.trim()}
                    className="px-4 py-2 rounded-xl font-semibold text-xs text-white disabled:opacity-40 flex items-center gap-1.5"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {isLoadingGutenberg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>Stream</span>
                  </button>
                </div>

                {gutenbergStatus && (
                  <div className="p-2.5 rounded-lg text-xs border font-mono animate-fadeIn" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                    {gutenbergStatus}
                  </div>
                )}
              </div>

              {/* Popular Curated Gutenberg Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold opacity-70">
                    Trending Gutenberg Classics (1-Click Stream):
                  </span>
                  <span className="text-[10px] font-mono opacity-50">
                    ID Quick-Stream
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {GUTENBERG_DIRECT_BOOKS.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors hover:border-white/20"
                      style={{ backgroundColor: `${theme.bg}60`, borderColor: theme.border }}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.coverAccent }} />
                          <h4 className="font-semibold text-xs truncate">{preset.title}</h4>
                          <span className="text-[10px] font-mono opacity-50">#{preset.id}</span>
                        </div>
                        <p className="text-[11px] opacity-60 truncate">
                          {preset.author} · {preset.category}
                        </p>
                      </div>

                      <button
                        onClick={() => handleFetchGutenberg(preset.id)}
                        disabled={isLoadingGutenberg}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium border shrink-0 transition-all hover:scale-105 active:scale-95"
                        style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.accent }}
                      >
                        Load Book
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FREE EBOOK DIRECTORIES & REPOSITORIES */}
          {activeTab === 'sources' && (
            <div className="space-y-4">
              {/* How to Read Free Books Tutorial Card */}
              <div
                className="p-4 rounded-xl border space-y-2"
                style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}30` }}
              >
                <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm" style={{ color: theme.accent }}>
                  <Sparkles className="w-4 h-4" />
                  <span>How to Read Millions of Free Books in SpeedRead</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-black/20 space-y-1">
                    <div className="font-bold text-[11px] font-mono text-white/90">1. Download Free EPUB or TXT</div>
                    <p className="text-[11px] opacity-70">Browse any directory below and download your favorite classic novel.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/20 space-y-1">
                    <div className="font-bold text-[11px] font-mono text-white/90">2. Drag & Drop into SpeedRead</div>
                    <p className="text-[11px] opacity-70">Drop the file directly into the browser window or use "Upload File" in the Bookshelf.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/20 space-y-1">
                    <div className="font-bold text-[11px] font-mono text-white/90">3. Speed Read with Chapters</div>
                    <p className="text-[11px] opacity-70">Enjoy automatic table of contents, ORP focal tracking, and retention quizzes!</p>
                  </div>
                </div>
              </div>

              {/* Source Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {FREE_BOOK_SOURCES.map((source) => (
                  <div
                    key={source.name}
                    className="p-4 rounded-xl border flex flex-col justify-between gap-3 transition-colors hover:border-white/20"
                    style={{ backgroundColor: `${theme.bg}80`, borderColor: theme.border }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm tracking-wide">{source.name}</h4>
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold"
                          style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
                        >
                          {source.tag}
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed opacity-75">
                        {source.description}
                      </p>

                      <div className="text-[11px] opacity-60">
                        <span className="font-semibold">Recommended:</span> {source.recommended}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {source.formats.map((fmt) => (
                          <span
                            key={fmt}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
                            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textDim }}
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>

                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 group"
                      style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textBright }}
                    >
                      <span>Visit {source.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OPDS FEEDS */}
          {activeTab === 'opds' && (
            <div className="space-y-4">
              <div
                className="p-4 rounded-xl border space-y-3"
                style={{ backgroundColor: `${theme.bg}80`, borderColor: theme.border }}
              >
                <div className="flex items-center gap-2">
                  <Rss className="w-4 h-4" style={{ color: theme.accent }} />
                  <h3 className="font-semibold text-sm">Open Publication Distribution System (OPDS) Feeds</h3>
                </div>
                <p className="text-xs leading-relaxed opacity-70">
                  Paste the XML feed content from an OPDS catalog (e.g. Standard Ebooks OPDS, Calibre Content Server) to parse books into SpeedRead:
                </p>

                <textarea
                  rows={4}
                  value={opdsInput}
                  onChange={(e) => setOpdsInput(e.target.value)}
                  placeholder="Paste <feed> XML content here..."
                  className="w-full p-2.5 rounded-xl border text-xs font-mono bg-black/20 focus:outline-none resize-none"
                  style={{ borderColor: theme.border, color: theme.textBright }}
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleParseOpds}
                    disabled={!opdsInput.trim()}
                    className="px-4 py-2 rounded-xl font-semibold text-xs text-white disabled:opacity-40"
                    style={{ backgroundColor: theme.accent }}
                  >
                    Parse OPDS Feed
                  </button>
                </div>
              </div>

              {opdsEntries.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-mono opacity-70 font-semibold">
                    Found {opdsEntries.length} Books in Feed:
                  </div>
                  <div className="space-y-2">
                    {opdsEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-3 rounded-xl border flex items-center justify-between gap-3"
                        style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-bold text-xs truncate">{entry.title}</h4>
                          <p className="text-[11px] opacity-60 truncate">by {entry.author}</p>
                          {entry.summary && (
                            <p className="text-[10px] opacity-50 line-clamp-1">{entry.summary}</p>
                          )}
                        </div>

                        {entry.downloadUrl && (
                          <a
                            href={entry.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg border text-xs font-medium shrink-0 flex items-center gap-1"
                            style={{ borderColor: theme.border, color: theme.accent }}
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
