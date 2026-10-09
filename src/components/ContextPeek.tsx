import React, { useEffect, useRef } from 'react';
import { ParsedWord, ThemeColors } from '../types/reader';
import { Eye, X, CornerDownRight } from 'lucide-react';
import { partitionBionicWord } from '../utils/bionic';

interface ContextPeekProps {
  isOpen: boolean;
  onClose: () => void;
  words: ParsedWord[];
  currentWordIndex: number;
  onSelectWord: (index: number) => void;
  theme: ThemeColors;
  bionicReading?: boolean;
}

export const ContextPeek: React.FC<ContextPeekProps> = ({
  isOpen,
  onClose,
  words,
  currentWordIndex,
  onSelectWord,
  theme,
  bionicReading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll the active word into view smoothly when context is open
  useEffect(() => {
    if (isOpen && activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isOpen, currentWordIndex]);

  if (!isOpen) return null;

  // Window of words around current index (e.g. 50 words before, 50 words after)
  const windowStart = Math.max(0, currentWordIndex - 45);
  const windowEnd = Math.min(words.length, currentWordIndex + 55);
  const visibleWords = words.slice(windowStart, windowEnd);

  return (
    <div
      className="w-full max-w-2xl mx-auto rounded-2xl border p-4 sm:p-5 transition-all shadow-lg animate-fadeIn flex flex-col gap-3"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
      }}
    >
      <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-2 text-xs font-mono" style={{ color: theme.accent }}>
          <Eye className="w-3.5 h-3.5" />
          <span className="font-semibold uppercase tracking-wider">Synchronized Reading Context</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono" style={{ color: theme.textDim }}>
            Click any word to seek
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-md border hover:opacity-80 transition-opacity"
            style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.textDim }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Word stream display */}
      <div
        ref={containerRef}
        className="max-h-48 overflow-y-auto leading-relaxed text-sm font-sans pr-2 space-y-2 select-text"
        style={{ color: theme.textBright }}
      >
        <p className="flex flex-wrap gap-x-1.5 gap-y-1">
          {windowStart > 0 && (
            <span className="text-xs font-mono opacity-50 mr-1 select-none">...</span>
          )}

          {visibleWords.map((word) => {
            const isCurrent = word.id === currentWordIndex;
            const bionic = bionicReading ? partitionBionicWord(word.raw) : null;

            return (
              <span
                key={word.id}
                ref={isCurrent ? activeWordRef : null}
                onClick={() => onSelectWord(word.id)}
                className={`cursor-pointer rounded px-1 py-0.5 transition-all duration-150 ${
                  isCurrent
                    ? 'font-bold underline decoration-2 ring-1 shadow-sm'
                    : 'opacity-70 hover:opacity-100 hover:bg-slate-500/10'
                }`}
                style={{
                  backgroundColor: isCurrent ? `${theme.accent}33` : 'transparent',
                  color: isCurrent ? theme.accent : theme.textBright,
                  textDecorationColor: isCurrent ? theme.accent : undefined,
                  boxShadow: isCurrent ? `0 0 10px ${theme.accent}44` : undefined,
                }}
              >
                {bionic ? (
                  <>
                    {bionic.leadingPunct}
                    <strong className="font-extrabold opacity-100">{bionic.boldPart}</strong>
                    <span className="opacity-80 font-normal">{bionic.normalPart}</span>
                    {bionic.trailingPunct}
                  </>
                ) : (
                  word.raw
                )}
              </span>
            );
          })}

          {windowEnd < words.length && (
            <span className="text-xs font-mono opacity-50 ml-1 select-none">...</span>
          )}
        </p>
      </div>
    </div>
  );
};
