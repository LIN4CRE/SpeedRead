import React from 'react';
import { X, ExternalLink, Download, BookOpen, Sparkles, CheckCircle2, Globe } from 'lucide-react';
import { ThemeColors } from '../types/reader';

interface FreeBooksModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  theme,
}) => {
  if (!isOpen) return null;

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
              <h2 className="font-semibold text-base sm:text-lg">Where to Get Free Books (EPUB & PDF)</h2>
              <p className="text-xs" style={{ color: theme.textDim }}>
                Download tens of thousands of free books and read them in Kinetic RSVP at 600 WPM
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

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick 3-Step Instruction Card */}
          <div
            className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            style={{ backgroundColor: theme.bg, borderColor: theme.border }}
          >
            <div className="flex items-center gap-2.5 font-medium" style={{ color: theme.textBright }}>
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>How it works:</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-xs font-mono" style={{ color: theme.textDim }}>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-[10px]">1</span>
                <span>Click a source below</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-[10px]">2</span>
                <span>Download .epub or .pdf</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-[10px]">3</span>
                <span>Drop or Upload here</span>
              </div>
            </div>
          </div>

          {/* Sources List */}
          <div className="space-y-3">
            {FREE_BOOK_SOURCES.map((source) => (
              <div
                key={source.name}
                className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-opacity-100"
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm" style={{ color: theme.textBright }}>
                      {source.name}
                    </h3>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded font-mono font-medium"
                      style={{ backgroundColor: theme.surface, color: theme.accent }}
                    >
                      {source.tag}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: theme.textDim }}>
                    {source.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] font-mono" style={{ color: theme.textDim }}>
                    <span>Formats:</span>
                    {source.formats.map((fmt) => (
                      <span key={fmt} className="px-1.5 py-0.2 rounded border text-[10px]" style={{ borderColor: theme.border }}>
                        {fmt}
                      </span>
                    ))}
                    <span className="hidden sm:inline">· Popular: {source.recommended}</span>
                  </div>
                </div>

                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-transform active:scale-95 shrink-0 shadow-md"
                  style={{ backgroundColor: theme.accent }}
                >
                  <span>Visit Library</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>

          {/* Notice about Copyrighted Books (like Harry Potter) */}
          <div
            className="p-4 rounded-xl border text-xs space-y-1.5"
            style={{ backgroundColor: `${theme.surface}80`, borderColor: theme.border, color: theme.textDim }}
          >
            <div className="font-semibold flex items-center gap-1.5" style={{ color: theme.textBright }}>
              <BookOpen className="w-3.5 h-3.5" style={{ color: theme.accent }} />
              <span>Looking for modern books like Harry Potter?</span>
            </div>
            <p>
              Contemporary novels like <em>Harry Potter</em> are copyrighted works protected by law and cannot be legally distributed directly inside open web apps.
            </p>
            <p>
              However, if you own an <strong>EPUB or PDF copy</strong> of Harry Potter (or any book purchased through your favorite bookstore or borrowed digitally from your local public library via Libby/OverDrive), you can load it into Kinetic RSVP in 1 second using the <strong>Upload</strong> or <strong>Drag-and-Drop</strong> features to read it at 600 WPM!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3.5 border-t flex justify-end"
          style={{ borderColor: theme.border, backgroundColor: theme.bg }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl text-white transition-transform active:scale-95"
            style={{ backgroundColor: theme.accent }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
