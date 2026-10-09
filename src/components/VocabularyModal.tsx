import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookMarked, 
  Trash2, 
  Download, 
  Sparkles, 
  RotateCw, 
  CheckCircle, 
  Calendar, 
  Layers, 
  ExternalLink,
  Search,
  Check
} from 'lucide-react';
import { VocabularyItem, ThemeColors } from '../types/reader';
import { 
  loadVocabularyItems, 
  saveVocabularyItems, 
  calculateSM2, 
  exportToAnkiTSV, 
  downloadTextFile 
} from '../utils/vocabulary';

interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeColors;
}

export const VocabularyModal: React.FC<VocabularyModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'vault' | 'flashcards'>('vault');
  
  // Flashcard State
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCopiedAnki, setIsCopiedAnki] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setItems(loadVocabularyItems());
      setIsFlipped(false);
      setFlashcardIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) =>
    item.cleanWord.toLowerCase().includes(search.toLowerCase()) ||
    item.contextSentence.toLowerCase().includes(search.toLowerCase()) ||
    item.documentTitle.toLowerCase().includes(search.toLowerCase())
  );

  const dueItems = items.filter((i) => i.nextReviewDate <= Date.now());
  const currentCard = dueItems[flashcardIndex] || items[flashcardIndex];

  const handleDelete = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    saveVocabularyItems(next);
  };

  const handleSM2Review = (quality: 0 | 3 | 4 | 5) => {
    if (!currentCard) return;
    const updated = calculateSM2(currentCard, quality);
    const nextItems = items.map((i) => (i.id === updated.id ? updated : i));
    setItems(nextItems);
    saveVocabularyItems(nextItems);

    setIsFlipped(false);
    if (flashcardIndex < (dueItems.length > 0 ? dueItems.length - 1 : items.length - 1)) {
      setFlashcardIndex((prev) => prev + 1);
    } else {
      setFlashcardIndex(0);
    }
  };

  const handleExportAnki = () => {
    if (items.length === 0) return;
    const tsv = exportToAnkiTSV(items);
    downloadTextFile('SpeedRead_Vocabulary_Anki.tsv', tsv);
    setIsCopiedAnki(true);
    setTimeout(() => setIsCopiedAnki(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
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
          className="flex items-center justify-between px-5 sm:px-6 py-4 border-b"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
            >
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Vocabulary Vault & Spaced Repetition</h2>
              <p className="text-xs" style={{ color: theme.textDim }}>
                {items.length} saved words · {dueItems.length} due for SM-2 review · Hotkey <kbd className="px-1.5 py-0.5 rounded bg-black/30 border border-white/10 font-mono">D</kbd>
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
            onClick={() => setActiveTab('vault')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'vault' ? 'border-current font-bold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'vault' ? theme.accent : theme.textBright }}
          >
            <Layers className="w-4 h-4" /> Word Vault ({items.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('flashcards');
              setIsFlipped(false);
            }}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'flashcards' ? 'border-current font-bold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'flashcards' ? theme.accent : theme.textBright }}
          >
            <RotateCw className="w-4 h-4" /> SM-2 Flashcards ({dueItems.length} Due)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {activeTab === 'vault' ? (
            <>
              {/* Search & Actions Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter saved words or sentences..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-black/20 focus:outline-none"
                    style={{ borderColor: theme.border, color: theme.textBright }}
                  />
                </div>
                <button
                  onClick={handleExportAnki}
                  disabled={items.length === 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-colors disabled:opacity-40"
                  style={{
                    backgroundColor: `${theme.accent}15`,
                    borderColor: `${theme.accent}40`,
                    color: theme.accent,
                  }}
                >
                  {isCopiedAnki ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  Export to Anki (.tsv)
                </button>
              </div>

              {/* Items List */}
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <BookMarked className="w-12 h-12 mx-auto opacity-20" />
                  <p className="text-sm font-medium" style={{ color: theme.textDim }}>
                    {items.length === 0
                      ? 'No vocabulary words saved yet. Press "D" anytime during reading to bookmark a word!'
                      : 'No words match your search filter.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border flex flex-col sm:flex-row items-start justify-between gap-3 transition-colors hover:border-white/20"
                      style={{ backgroundColor: `${theme.bg}80`, borderColor: theme.border }}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold tracking-wide" style={{ color: theme.accent }}>
                            {item.word}
                          </span>
                          {item.partOfSpeech && (
                            <span className="text-xs italic opacity-60">
                              ({item.partOfSpeech})
                            </span>
                          )}
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 opacity-70">
                            Rep {item.repetition} · {item.intervalDays}d interval
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: theme.textBright }}>
                          {item.definition}
                        </p>
                        {item.contextSentence && (
                          <p className="text-xs italic opacity-70 border-l-2 pl-2" style={{ borderColor: theme.accent }}>
                            "{item.contextSentence}"
                          </p>
                        )}
                        <p className="text-[11px] opacity-40 font-mono">
                          Source: {item.documentTitle} · {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg opacity-40 hover:opacity-100 hover:text-red-400 transition-all self-end sm:self-center"
                        title="Delete word"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Flashcard SM-2 Review Mode */
            <div className="space-y-6 max-w-lg mx-auto py-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm" style={{ color: theme.textDim }}>
                    Add words to your vault to start spaced repetition flashcards.
                  </p>
                </div>
              ) : !currentCard ? (
                <div className="text-center py-12 space-y-3">
                  <CheckCircle className="w-12 h-12 mx-auto text-emerald-400" />
                  <h3 className="text-lg font-bold">All caught up!</h3>
                  <p className="text-sm" style={{ color: theme.textDim }}>
                    You have reviewed all due flashcards for today. Great job!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs" style={{ color: theme.textDim }}>
                    <span>Card {flashcardIndex + 1} of {dueItems.length || items.length}</span>
                    <span>Ease: {currentCard.easeFactor}x</span>
                  </div>

                  {/* Interactive Flip Card */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="min-h-[220px] p-6 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all hover:border-white/30 select-none shadow-lg text-center"
                    style={{ backgroundColor: `${theme.bg}95`, borderColor: theme.border }}
                  >
                    <div className="space-y-3 my-auto">
                      <span className="text-2xl font-black tracking-wide" style={{ color: theme.accent }}>
                        {currentCard.word}
                      </span>
                      {currentCard.partOfSpeech && (
                        <p className="text-xs italic opacity-60">({currentCard.partOfSpeech})</p>
                      )}
                      
                      {isFlipped ? (
                        <div className="space-y-3 pt-3 border-t animate-fadeIn" style={{ borderColor: theme.border }}>
                          <p className="text-sm leading-relaxed font-medium">
                            {currentCard.definition}
                          </p>
                          {currentCard.contextSentence && (
                            <p className="text-xs italic opacity-70">
                              "{currentCard.contextSentence}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs opacity-50 pt-4">
                          Click card or press anywhere to flip and reveal definition
                        </p>
                      )}
                    </div>

                    <div className="text-[11px] opacity-40 font-mono">
                      {currentCard.documentTitle}
                    </div>
                  </div>

                  {/* SM-2 Rating Controls */}
                  {isFlipped ? (
                    <div className="grid grid-cols-4 gap-2 pt-2 animate-fadeIn">
                      <button
                        onClick={() => handleSM2Review(0)}
                        className="py-2.5 px-2 rounded-xl text-xs font-semibold bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors"
                      >
                        Again (1d)
                      </button>
                      <button
                        onClick={() => handleSM2Review(3)}
                        className="py-2.5 px-2 rounded-xl text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-colors"
                      >
                        Hard ({Math.max(1, Math.round(currentCard.intervalDays * 1.2))}d)
                      </button>
                      <button
                        onClick={() => handleSM2Review(4)}
                        className="py-2.5 px-2 rounded-xl text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors"
                      >
                        Good ({Math.max(1, Math.round(currentCard.intervalDays * currentCard.easeFactor))}d)
                      </button>
                      <button
                        onClick={() => handleSM2Review(5)}
                        className="py-2.5 px-2 rounded-xl text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                      >
                        Easy ({Math.max(2, Math.round(currentCard.intervalDays * currentCard.easeFactor * 1.3))}d)
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsFlipped(true)}
                      className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors"
                      style={{
                        backgroundColor: `${theme.accent}20`,
                        borderColor: `${theme.accent}50`,
                        color: theme.accent,
                      }}
                    >
                      Show Answer
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
