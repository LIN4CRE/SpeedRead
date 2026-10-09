import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Minus, 
  Plus, 
  Gauge,
  Sliders,
  Maximize,
  Minimize,
  BookOpen,
  Eye,
  FileText
} from 'lucide-react';
import { ThemeColors } from '../types/reader';

interface ControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onStep: (delta: number) => void;
  onPrevSentence: () => void;
  currentWordIndex: number;
  totalWords: number;
  wpm: number;
  onWpmChange: (wpm: number) => void;
  onSeek: (index: number) => void;
  theme: ThemeColors;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onOpenLibrary: () => void;
  onToggleContextPeek: () => void;
  isContextPeekOpen: boolean;
  disabled?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onReset,
  onStep,
  onPrevSentence,
  currentWordIndex,
  totalWords,
  wpm,
  onWpmChange,
  onSeek,
  theme,
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
  onOpenLibrary,
  onToggleContextPeek,
  isContextPeekOpen,
  disabled = false,
}) => {
  const progressPercent = totalWords > 0 ? (currentWordIndex / totalWords) * 100 : 0;

  // Calculate estimated reading time remaining
  const wordsRemaining = Math.max(0, totalWords - currentWordIndex);
  const minutesRemaining = wpm > 0 ? (wordsRemaining / wpm).toFixed(1) : '0';

  const WPM_PRESETS = [300, 360, 450, 600, 900];

  return (
    <div
      className="w-full max-w-2xl mx-auto rounded-2xl border p-5 sm:p-6 transition-all duration-200 shadow-xl flex flex-col gap-5"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
      }}
    >
      {/* 1. Progress Scrubber with Word Counters & Time Left */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono" style={{ color: theme.textDim }}>
          <div className="flex items-center gap-2">
            <span className="font-semibold" style={{ color: theme.textBright }}>
              {currentWordIndex.toLocaleString()}
            </span>
            <span>/</span>
            <span>{totalWords.toLocaleString()} words</span>
          </div>

          <div className="flex items-center gap-2">
            <span>{progressPercent.toFixed(1)}%</span>
            <span>·</span>
            <span>~{minutesRemaining}m left</span>
          </div>
        </div>

        {/* Range Scrubber */}
        <div className="relative flex items-center group">
          <input
            type="range"
            min={0}
            max={Math.max(1, totalWords - 1)}
            value={currentWordIndex}
            disabled={disabled || totalWords === 0}
            onChange={(e) => onSeek(parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer transition-all disabled:opacity-40"
            style={{
              accentColor: theme.accent,
              background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accent} ${progressPercent}%, ${theme.border} ${progressPercent}%, ${theme.border} 100%)`,
            }}
          />
        </div>
      </div>

      {/* 2. Primary Playback Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        {/* Left Actions: Jump backward */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrevSentence}
            disabled={disabled || currentWordIndex === 0}
            title="Rewind to previous sentence (Shift+Left)"
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-lg border flex items-center gap-1 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.textDim,
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sentence</span>
          </button>

          <button
            onClick={() => onStep(-10)}
            disabled={disabled || currentWordIndex === 0}
            title="Back 10 words (Left Arrow)"
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-lg border flex items-center gap-1 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.textDim,
            }}
          >
            -10
          </button>
        </div>

        {/* Center: Main Play / Pause Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            disabled={disabled || currentWordIndex === 0}
            title="Restart Document (R)"
            className="p-3 rounded-xl border transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.textDim,
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            disabled={disabled || totalWords === 0}
            className="px-7 py-3 rounded-xl font-semibold text-sm flex items-center gap-2.5 shadow-lg transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white"
            style={{
              backgroundColor: theme.accent,
              boxShadow: `0 8px 24px ${theme.accent}40`,
            }}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>{currentWordIndex > 0 ? 'RESUME' : 'START'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => onStep(10)}
            disabled={disabled || currentWordIndex >= totalWords - 1}
            title="Forward 10 words (Right Arrow)"
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-lg border flex items-center gap-1 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.textDim,
            }}
          >
            +10
          </button>
        </div>

        {/* Right Actions: Context Peek, Settings & Library */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleContextPeek}
            title="Toggle Paragraph Context Peek (C)"
            className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
              isContextPeekOpen ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: isContextPeekOpen ? theme.surfaceHover : theme.bg,
              borderColor: isContextPeekOpen ? theme.accent : theme.border,
              color: isContextPeekOpen ? theme.accent : theme.textDim,
            }}
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            title="Typography & Theme Settings"
            className="p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center"
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.textDim,
            }}
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleFullscreen}
            title="Toggle Fullscreen Zen Mode (F)"
            className="p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center"
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.textDim,
            }}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. WPM Speed Slider & Presets */}
      <div
        className="pt-3 border-t flex flex-col gap-2.5"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4" style={{ color: theme.accent }} />
            <span className="text-xs uppercase font-mono tracking-wider font-semibold" style={{ color: theme.textDim }}>
              Velocity:
            </span>
            <span className="font-mono text-base font-bold" style={{ color: theme.textBright }}>
              {wpm} <span className="text-xs font-normal" style={{ color: theme.textDim }}>WPM</span>
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1">
            {WPM_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => onWpmChange(preset)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                  wpm === preset ? 'font-bold' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: wpm === preset ? theme.accent : theme.bg,
                  color: wpm === preset ? '#ffffff' : theme.textDim,
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Speed Slider with -/+ Step Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onWpmChange(Math.max(100, wpm - 25))}
            className="p-1 rounded border transition-colors hover:bg-opacity-80 active:scale-95"
            style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.textDim }}
            title="Decrease 25 WPM (Down Arrow)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min={100}
            max={1200}
            step={10}
            value={wpm}
            onChange={(e) => onWpmChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
            style={{
              accentColor: theme.accent,
            }}
          />

          <button
            onClick={() => onWpmChange(Math.min(1200, wpm + 25))}
            className="p-1 rounded border transition-colors hover:bg-opacity-80 active:scale-95"
            style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.textDim }}
            title="Increase 25 WPM (Up Arrow)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
