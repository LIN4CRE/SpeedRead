import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  Search, 
  Sparkles, 
  Clock, 
  Check, 
  Upload, 
  ExternalLink,
  Flame,
  X
} from 'lucide-react';
import { ThemeColors, DocumentSource } from '../types/reader';
import { SAMPLE_LIBRARY, createDocumentFromSample } from '../utils/sampleTexts';
import { ALL_FULL_BOOKS } from '../books';

interface LibraryDropdownProps {
  activeDocId: string;
  onSelectDocument: (doc: DocumentSource, startWordIndex?: number) => void;
  onOpenFullCatalogModal: () => void;
  onOpenUploadSidebar?: () => void;
  theme: ThemeColors;
  wpm?: number;
  align?: 'left' | 'right' | 'center';
  variant?: 'navbar' | 'banner';
}

interface GenreGroup {
  id: string;
  label: string;
  emoji: string;
  categoryFilter: string[];
}

const GENRE_GROUPS: GenreGroup[] = [
  { 
    id: 'drills', 
    label: 'Speed Drills', 
    emoji: '⚡', 
    categoryFilter: ['video speed test', 'science & speed reading'] 
  },
  { 
    id: 'gothic', 
    label: 'Gothic & Vampire', 
    emoji: '🧛', 
    categoryFilter: ['gothic', 'vampire', 'mystery', 'detective'] 
  },
  { 
    id: 'dystopian', 
    label: 'Dystopian & Sci-Fi', 
    emoji: '🧬', 
    categoryFilter: ['dystopian', 'sci-fi', 'adventure'] 
  },
  { 
    id: 'classics', 
    label: 'Philosophy & Drama', 
    emoji: '📜', 
    categoryFilter: ['strategy', 'philosophy', 'existentialist', 'victorian', 'classics'] 
  },
  { 
    id: 'youth', 
    label: 'Youth & Wonder', 
    emoji: '✨', 
    categoryFilter: ['children', 'fantasy', 'fables', 'beginner', 'youth'] 
  },
];

export const LibraryDropdown: React.FC<LibraryDropdownProps> = ({
  activeDocId,
  onSelectDocument,
  onOpenFullCatalogModal,
  onOpenUploadSidebar,
  theme,
  wpm = 350,
  align = 'right',
  variant = 'navbar',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      // Focus search input on open
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Combined library list with enriched metadata
  const enrichedBooks = useMemo(() => {
    return SAMPLE_LIBRARY.map((sample) => {
      const fullBook = ALL_FULL_BOOKS.find((b) => b.id === sample.id);
      return {
        ...sample,
        difficulty: fullBook?.difficulty || 'Intermediate',
        coverAccent: fullBook?.coverAccent,
        estimatedMinutes: fullBook?.estimatedMinutes 
          ? Math.max(10, Math.round(fullBook.estimatedMinutes * (350 / Math.max(100, wpm))))
          : Math.max(5, Math.round((sample.chapters.reduce((acc, c) => acc + c.text.split(/\s+/).length, 0) / Math.max(100, wpm)))),
      };
    });
  }, [wpm]);

  // Filter books based on search and genre
  const filteredBooks = useMemo(() => {
    return enrichedBooks.filter((book) => {
      const query = search.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query) ||
        (book.description && book.description.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (selectedGenre === 'all') return true;

      const group = GENRE_GROUPS.find((g) => g.id === selectedGenre);
      if (!group) return true;

      const catLower = book.category.toLowerCase();
      return group.categoryFilter.some((filter) => catLower.includes(filter));
    });
  }, [enrichedBooks, search, selectedGenre]);

  const handleSelect = (sampleId: string) => {
    const book = SAMPLE_LIBRARY.find((b) => b.id === sampleId);
    if (book) {
      onSelectDocument(createDocumentFromSample(book), 0);
      setIsOpen(false);
    }
  };

  const currentBook = enrichedBooks.find((b) => b.id === activeDocId);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      {variant === 'navbar' ? (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
            isOpen 
              ? 'ring-2 font-bold' 
              : 'hover:scale-105'
          }`}
          style={{
            backgroundColor: isOpen ? `${theme.accent}25` : `${theme.accent}12`,
            borderColor: isOpen ? theme.accent : `${theme.accent}40`,
            color: theme.accent,
          }}
          title="Open Library Dropdown Menu (19 Books & Drills)"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Library</span>
          <span className="sm:hidden">Books</span>
          <span 
            className="text-[10px] font-mono px-1 py-0.2 rounded font-bold ml-0.5"
            style={{ backgroundColor: `${theme.accent}20` }}
          >
            19
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-2 transition-all active:scale-95 shadow-sm ${
            isOpen ? 'ring-2' : 'hover:opacity-100 opacity-90'
          }`}
          style={{
            backgroundColor: theme.surface,
            borderColor: isOpen ? theme.accent : theme.border,
            color: theme.textBright,
          }}
          title="Choose a book from the Library"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <BookOpen className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate max-w-[140px] sm:max-w-[200px]">
            {currentBook ? currentBook.title : 'Choose a Book (19 Titles)...'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Floating Dropdown Menu Panel */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-80 sm:w-96 max-w-[95vw] rounded-2xl border shadow-2xl backdrop-blur-xl animate-fadeIn flex flex-col overflow-hidden ${
            align === 'left' ? 'left-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'
          }`}
          style={{
            backgroundColor: `${theme.surface}fa`,
            borderColor: theme.border,
            color: theme.textBright,
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7)',
          }}
        >
          {/* Header & Search */}
          <div className="p-3 border-b space-y-2.5 shrink-0" style={{ borderColor: theme.border }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>SpeedRead Classics Library</span>
                <span 
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ml-1"
                  style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
                >
                  {enrichedBooks.length} Titles
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:opacity-75"
                style={{ color: theme.textDim }}
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, author, or genre..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border bg-black/20 focus:outline-none focus:ring-1"
                style={{
                  borderColor: theme.border,
                  color: theme.textBright,
                }}
              />
            </div>

            {/* Quick Genre Chips */}
            <div className="flex gap-1 overflow-x-auto pb-0.5 text-[11px] scrollbar-none">
              <button
                onClick={() => setSelectedGenre('all')}
                className={`px-2 py-0.5 rounded-lg whitespace-nowrap transition-all font-medium ${
                  selectedGenre === 'all' ? 'font-bold' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedGenre === 'all' ? `${theme.accent}25` : `${theme.bg}`,
                  color: selectedGenre === 'all' ? theme.accent : theme.textDim,
                  border: `1px solid ${selectedGenre === 'all' ? theme.accent : theme.border}`,
                }}
              >
                All ({enrichedBooks.length})
              </button>

              {GENRE_GROUPS.map((genre) => {
                const count = enrichedBooks.filter((b) => {
                  const catLower = b.category.toLowerCase();
                  return genre.categoryFilter.some((f) => catLower.includes(f));
                }).length;

                return (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre.id)}
                    className={`px-2 py-0.5 rounded-lg whitespace-nowrap transition-all font-medium flex items-center gap-1 ${
                      selectedGenre === genre.id ? 'font-bold' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: selectedGenre === genre.id ? `${theme.accent}25` : `${theme.bg}`,
                      color: selectedGenre === genre.id ? theme.accent : theme.textDim,
                      border: `1px solid ${selectedGenre === genre.id ? theme.accent : theme.border}`,
                    }}
                  >
                    <span>{genre.emoji}</span>
                    <span>{genre.label}</span>
                    <span className="opacity-60 text-[9px]">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Book Items List */}
          <div className="p-2 overflow-y-auto max-h-[340px] space-y-1">
            {filteredBooks.length === 0 ? (
              <div className="py-8 text-center text-xs opacity-60" style={{ color: theme.textDim }}>
                No books found matching &ldquo;{search}&rdquo;
              </div>
            ) : (
              filteredBooks.map((book) => {
                const isSelected = activeDocId === book.id;

                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => handleSelect(book.id)}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-start justify-between gap-2 transition-all group ${
                      isSelected
                        ? 'font-bold ring-1 shadow-sm'
                        : 'hover:bg-white/5 opacity-90 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: isSelected ? `${theme.accent}18` : theme.bg,
                      borderColor: isSelected ? theme.accent : theme.border,
                      color: isSelected ? theme.accent : theme.textBright,
                    }}
                  >
                    {/* Left: Book Meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span 
                          className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase truncate max-w-[140px]"
                          style={{
                            backgroundColor: `${theme.accent}15`,
                            color: theme.accent,
                          }}
                        >
                          {book.category}
                        </span>
                        <span className="text-[9px] font-mono opacity-50 shrink-0">
                          {book.chapters.length} {book.chapters.length === 1 ? 'Ch.' : 'Chapters'}
                        </span>
                      </div>

                      <div className="text-xs font-semibold leading-snug truncate">
                        {book.title}
                      </div>

                      <div className="text-[10px] truncate opacity-70 mt-0.5" style={{ color: theme.textDim }}>
                        {book.author}
                      </div>
                    </div>

                    {/* Right: Time & Selected Status */}
                    <div className="shrink-0 flex flex-col items-end justify-between self-stretch">
                      {isSelected ? (
                        <div 
                          className="p-1 rounded-full font-bold"
                          style={{ backgroundColor: `${theme.accent}30`, color: theme.accent }}
                          title="Currently Active"
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-3 h-3" />
                      )}

                      <div className="flex items-center gap-1 text-[10px] font-mono opacity-60">
                        <Clock className="w-2.5 h-2.5" />
                        <span>~{book.estimatedMinutes}m</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          <div 
            className="p-2.5 border-t bg-black/10 flex items-center justify-between gap-2 text-xs shrink-0"
            style={{ borderColor: theme.border }}
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenFullCatalogModal();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-rose-300 font-semibold hover:bg-rose-500/10 transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Full Catalog & Gutenberg</span>
            </button>

            {onOpenUploadSidebar && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenUploadSidebar();
                }}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg opacity-70 hover:opacity-100 transition-colors"
                style={{ color: theme.textDim }}
                title="Upload PDF, EPUB, or TXT"
              >
                <Upload className="w-3 h-3" />
                <span>Upload</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
