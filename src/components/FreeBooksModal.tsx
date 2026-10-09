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
  Layers
} from 'lucide-react';
import { ThemeColors, DocumentSource, CatalogBook } from '../types/reader';
import { CURATED_OPEN_CATALOG, parseOpdsFeedXml } from '../utils/openCatalog';
import { tokenizeText } from '../utils/orp';

interface FreeBooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook?: (doc: DocumentSource) => void;
  theme: ThemeColors;
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
    description: 'Beautifully typeset, free public domain ebooks crafted for e-readers. High typography quality.',
    formats: ['EPUB', 'AZW3', 'KEPUB'],
    recommended: 'Frankenstein, Sherlock Holmes, The Great Gatsby',
    tag: 'Highest Quality',
  },
  {
    name: 'Project Gutenberg',
    url: 'https://www.gutenberg.org',
    description: 'Over 70,000 free classic books. The world’s oldest and largest digital library of free literature.',
    formats: ['EPUB', 'PDF', 'TXT', 'HTML'],
    recommended: 'Dracula, Pride and Prejudice, Alice in Wonderland',
    tag: 'Largest Catalog',
  },
  {
    name: 'Open Library & Internet Archive',
    url: 'https://openlibrary.org',
    description: 'Millions of digitised books from world libraries available to read or borrow digitally.',
    formats: ['EPUB', 'PDF'],
    recommended: 'Classic fantasy, adventure novels, historic texts',
    tag: '3M+ Books',
  },
  {
    name: 'ManyBooks',
    url: 'https://manybooks.net',
    description: 'Over 50,000 free books sorted by modern genres: Fantasy, Sci-Fi, Mystery, Thriller, and Romance.',
    formats: ['EPUB', 'PDF'],
    recommended: 'Genre fiction, short stories, classics',
    tag: 'Genre Focused',
  },
  {
    name: 'Planet eBook',
    url: 'https://www.planetebook.com',
    description: 'Curated collection of great classic novels formatted specifically for mobile and desktop reading.',
    formats: ['EPUB', 'PDF'],
    recommended: '1984, The Picture of Dorian Gray, Jane Eyre',
    tag: 'Clean Design',
  },
  {
    name: 'Feedbooks Public Domain',
    url: 'https://www.feedbooks.com/publicdomain',
    description: 'Thousands of free public domain classics formatted with chapters and tables of contents.',
    formats: ['EPUB'],
    recommended: 'Jules Verne, H.G. Wells, Arthur Conan Doyle',
    tag: 'Easy Downloads',
  },
];

export const FreeBooksModal: React.FC<FreeBooksModalProps> = ({
  isOpen,
  onClose,
  onSelectBook,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'stream' | 'sources' | 'opds'>('stream');
  const [search, setSearch] = useState('');
  const [opdsInput, setOpdsInput] = useState('');
  const [opdsEntries, setOpdsEntries] = useState<Array<{ id: string; title: string; author: string; summary: string }>>([]);

  if (!isOpen) return null;

  const filteredCatalog = CURATED_OPEN_CATALOG.filter((book) =>
    book.title.toLowerCase().includes(search.toLowerCase()) ||
    book.author.toLowerCase().includes(search.toLowerCase()) ||
    book.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleStreamBook = (book: CatalogBook) => {
    if (!onSelectBook) return;
    const words = tokenizeText(book.content);
    const newDoc: DocumentSource = {
      id: book.id,
      title: book.title,
      author: book.author,
      type: 'sample',
      totalWords: words.length,
      chapters: [{
        id: 'chap_1',
        title: book.title,
        startWordIndex: 0,
        wordCount: words.length,
      }],
      rawText: book.content,
      words,
      dateAdded: Date.now(),
    };

    onSelectBook(newDoc);
    onClose();
  };

  const handleParseOpds = () => {
    if (!opdsInput.trim()) return;
    const entries = parseOpdsFeedXml(opdsInput);
    setOpdsEntries(entries);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden"
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
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base sm:text-lg">Open Ebook Catalog & OPDS Ingestion</h2>
              <p className="text-xs" style={{ color: theme.textDim }}>
                Stream free public domain classics or connect open OPDS feeds
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
        <div className="flex border-b px-6 pt-2 gap-4 text-sm font-medium" style={{ borderColor: theme.border }}>
          <button
            onClick={() => setActiveTab('stream')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'stream' ? 'border-current font-bold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'stream' ? theme.accent : theme.textBright }}
          >
            <Play className="w-4 h-4" /> 1-Click Stream Catalog
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'sources' ? 'border-current font-bold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'sources' ? theme.accent : theme.textBright }}
          >
            <Layers className="w-4 h-4" /> Ebook Directories
          </button>
          <button
            onClick={() => setActiveTab('opds')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'opds' ? 'border-current font-bold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'opds' ? theme.accent : theme.textBright }}
          >
            <Rss className="w-4 h-4" /> OPDS Feeds
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:px-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'stream' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search open titles or authors..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-black/20 focus:outline-none"
                  style={{ borderColor: theme.border, color: theme.textBright }}
                />
              </div>

              {/* Book Cards */}
              <div className="space-y-3">
                {filteredCatalog.map((book) => (
                  <div
                    key={book.id}
                    className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors hover:border-white/20"
                    style={{ backgroundColor: `${theme.bg}80`, borderColor: theme.border }}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: book.coverAccent }}
                        />
                        <h4 className="text-sm font-bold tracking-wide">{book.title}</h4>
                        <span className="text-xs opacity-60">· {book.author}</span>
                        {book.year && <span className="text-[10px] opacity-40 font-mono">({book.year})</span>}
                      </div>
                      <p className="text-xs leading-relaxed opacity-70">
                        {book.description}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] font-mono opacity-50 pt-1">
                        <span>{book.category}</span>
                        <span>·</span>
                        <span>{book.wordCount} words</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStreamBook(book)}
                      className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all shrink-0 self-end sm:self-center"
                      style={{
                        backgroundColor: `${theme.accent}15`,
                        borderColor: `${theme.accent}40`,
                        color: theme.accent,
                      }}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Stream & Read</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="space-y-4">
              <div
                className="p-3.5 rounded-xl border flex items-center gap-2.5 text-xs"
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="opacity-80">
                  Download any `.epub`, `.pdf`, or `.txt` from these repositories and drag into SpeedRead!
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FREE_BOOK_SOURCES.map((source) => (
                  <div
                    key={source.name}
                    className="p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all hover:border-white/30"
                    style={{ backgroundColor: `${theme.bg}60`, borderColor: theme.border }}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{source.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-white/5 border border-white/10 opacity-70">
                          {source.tag}
                        </span>
                      </div>
                      <p className="text-xs opacity-70 leading-relaxed">{source.description}</p>
                    </div>

                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                      style={{ color: theme.accent }}
                    >
                      <span>Visit Catalog</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'opds' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl border bg-white/5 space-y-1.5" style={{ borderColor: theme.border }}>
                <span className="font-bold text-sm flex items-center gap-1.5" style={{ color: theme.accent }}>
                  <Rss className="w-4 h-4" /> Open Publication Distribution System (OPDS)
                </span>
                <p className="opacity-70 leading-relaxed">
                  Paste the XML feed content from an OPDS root catalog (e.g. Calibre, Standard Ebooks OPDS) to parse books into your local stream library.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold uppercase tracking-wider opacity-70">
                  OPDS XML Feed Payload
                </label>
                <textarea
                  rows={5}
                  value={opdsInput}
                  onChange={(e) => setOpdsInput(e.target.value)}
                  placeholder="Paste <feed xmlns='http://www.w3.org/2005/Atom'> ... </feed> XML content here..."
                  className="w-full p-3 font-mono rounded-xl border bg-black/20 focus:outline-none resize-none text-[11px]"
                  style={{ borderColor: theme.border, color: theme.textBright }}
                />
              </div>

              <button
                onClick={handleParseOpds}
                disabled={!opdsInput.trim()}
                className="w-full py-2.5 rounded-xl font-bold uppercase tracking-wider border disabled:opacity-40 transition-colors"
                style={{
                  backgroundColor: `${theme.accent}20`,
                  borderColor: theme.accent,
                  color: theme.accent,
                }}
              >
                Parse OPDS Feed
              </button>

              {opdsEntries.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="font-semibold opacity-70">Found {opdsEntries.length} Books:</span>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {opdsEntries.map((e) => (
                      <div key={e.id} className="p-2.5 rounded-lg border bg-black/30 space-y-1" style={{ borderColor: theme.border }}>
                        <span className="font-bold">{e.title}</span>
                        <span className="opacity-60 ml-2">by {e.author}</span>
                        {e.summary && <p className="opacity-70 text-[11px] line-clamp-2">{e.summary}</p>}
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
