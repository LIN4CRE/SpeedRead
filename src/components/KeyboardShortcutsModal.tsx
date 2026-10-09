import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { ThemeColors } from '../types/reader';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeColors;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause reading flow' },
    { key: 'K', desc: 'Save States & Cookie Places (Take a Break)' },
    { key: 'V', desc: 'Toggle Read-Aloud Web Speech synthesis' },
    { key: 'M', desc: 'Toggle Audio Metronome Cadence Ticker' },
    { key: 'S', desc: 'Cycle Reticle style (Line, Highlighter, Spotlight, etc.)' },
    { key: 'B', desc: 'Toggle Bookshelf & Table of Contents Sidebar' },
    { key: 'Z', desc: 'Toggle Zen Focus Mode' },
    { key: '←  /  →', desc: 'Step back / forward 10 words' },
    { key: 'Shift + ←', desc: 'Jump back to start of current sentence' },
    { key: '↑  /  ↓', desc: 'Adjust reading speed (±25 WPM)' },
    { key: 'C', desc: 'Toggle paragraph context peek window' },
    { key: 'F', desc: 'Toggle full-screen reading mode' },
    { key: 'T', desc: 'Cycle next color theme' },
    { key: 'R', desc: 'Restart book from beginning' },
    { key: 'Esc', desc: 'Close open dialogs & menus / Exit Zen' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md rounded-2xl border shadow-2xl p-6"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.textBright,
        }}
      >
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" style={{ color: theme.accent }} />
            <h3 className="font-semibold text-base">Keyboard Navigation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border hover:opacity-80 transition-opacity"
            style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.textDim }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between text-xs py-1.5 border-b border-dashed"
              style={{ borderColor: `${theme.border}88` }}
            >
              <kbd
                className="px-2.5 py-1 rounded-md font-mono font-semibold border shadow-sm"
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.accent,
                }}
              >
                {sc.key}
              </kbd>
              <span className="text-right" style={{ color: theme.textDim }}>
                {sc.desc}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-semibold text-white transition-transform active:scale-95"
            style={{ backgroundColor: theme.accent }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
