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
  Eye,
  Zap,
  Volume2,
  VolumeX,
  Sparkles,
  Cookie,
  Activity
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
  isReadAloud?: boolean;
  onToggleReadAloud?: () => void;
  isAudioPacer?: boolean;
  onToggleAudioPacer?: () => void;
  onToggleReticleStyle?: () => void;
  onOpenSaveStates?: () => void;
  chunkSize?: 1 | 2 | 3;
  onCycleChunkSize?: () => void;
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
  onToggleContextPeek,
  isContextPeekOpen,
  disabled = false,
  isReadAloud = false,
  onToggleReadAloud,
  isAudioPacer = false,
  onToggleAudioPacer,
  onToggleReticleStyle,
  onOpenSaveStates,
  chunkSize = 1,
  onCycleChunkSize,
}) => {
  const progressPercent = totalWords > 0 ? (currentWordIndex / totalWords) * 100 : 0;
  const wordsRemaining = Math.max(0, totalWords - currentWordIndex);
  const minutesRemaining = wpm > 0 ? (wordsRemaining / wpm).toFixed(0) : '0';

  const WPM_PRESETS = [300, 360, 450, 600, 900];

  return (
    <div
      className="w-full max-w-2xl mx-auto rounded-2xl border p-4 sm:p-5 transition-all duration-200 shadow-2xl flex flex-col gap-4 select-none backdrop-blur-md"
      style={{
        backgroundColor: `${theme.surface}f0`,
        borderColor: theme.border,
      }}
    >
      {/* 1. Timeline Scrubber */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono" style={{ color: theme.textDim }}>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs" style={{ color: theme.textBright }}>
              {currentWordIndex.toLocaleString()}
            </span>
            <span>/</span>
            <span>{totalWords.toLocaleString()} w</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold" style={{ color: theme.textBright }}>{progressPercent.toFixed(1)}%</span>
            <span>·</span>
            <span>~{minutesRemaining}m left</span>
          </div>
        </div>

        {/* Range Scrubber with gradient track */}
        <div className="relative flex items-center group py-0.5">
          <input
            type="range"
            min={0}
            max={Math.max(1, totalWords - 1)}
            value={currentWordIndex}
            disabled={disabled || totalWords === 0}
            onChange={(e) => onSeek(parseInt(e.target.value, 10))}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer transition-all disabled:opacity-40"
            style={{
              accentColor: theme.accent,
              background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accent} ${progressPercent}%, ${theme.border} ${progressPercent}%, ${theme.border} 100%)`,
            }}
          />
        </div>
      </div>

      {/* 2. Main Playback Control Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Rewind Sentence & Rewind 10 */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrevSentence}
            disabled={disabled || currentWordIndex === 0}
            title="Jump back 1 sentence (Shift + Left)"
            className="px-2.5 py-2 text-xs font-medium rounded-xl border flex items-center gap-1 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.textDim,
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sent</span>
          </button>

          <button
            onClick={() => onStep(-10)}
            disabled={disabled || currentWordIndex === 0}
            title="Back 10 words (Left Arrow)"
            className="px-2.5 py-2 text-xs font-mono font-medium rounded-xl border transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.textDim,
            }}
          >
            -10
          </button>
        </div>

        {/* Center: Reset & Big Tactile Play/Pause Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onReset}
            disabled={disabled || currentWordIndex === 0}
            title="Restart Book (R)"
            className="p-2.5 rounded-xl border transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
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
            className="px-8 py-3 rounded-2xl font-bold text-sm tracking-wide flex items-center gap-2.5 shadow-xl transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white"
            style={{
              backgroundColor: theme.accent,
              boxShadow: isPlaying ? `0 0 24px ${theme.accent}60` : `0 4px 16px ${theme.accent}30`,
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
            className="px-2.5 py-2 text-xs font-mono font-medium rounded-xl border transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.textDim,
            }}
          >
            +10
          </button>
        </div>

        {/* Right: Read-Aloud, Reticle Style, Context Peek, Settings, Fullscreen */}
        <div className="flex items-center gap-1.5">
          {/* Read-Aloud Web Speech Mode Toggle */}
          {onToggleReadAloud && (
            <button
              onClick={onToggleReadAloud}
              title={isReadAloud ? 'Turn Off Read-Aloud Voice (V)' : 'Turn On Read-Aloud Web Speech Synthesis (V)'}
              className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
                isReadAloud ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: isReadAloud ? `${theme.accent}20` : theme.bg,
                borderColor: isReadAloud ? theme.accent : theme.border,
                color: isReadAloud ? theme.accent : theme.textDim,
              }}
            >
              {isReadAloud ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          {/* Audio Metronome Pacer Ticker Toggle */}
          {onToggleAudioPacer && (
            <button
              onClick={onToggleAudioPacer}
              title={isAudioPacer ? 'Turn Off Audio Metronome Ticker (M)' : 'Turn On Audio Metronome Cadence Ticker (M)'}
              className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
                isAudioPacer ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: isAudioPacer ? `${theme.accent}20` : theme.bg,
                borderColor: isAudioPacer ? theme.accent : theme.border,
                color: isAudioPacer ? theme.accent : theme.textDim,
              }}
            >
              <Activity className={`w-4 h-4 ${isAudioPacer ? 'animate-pulse text-amber-400' : ''}`} />
            </button>
          )}

          {/* Quick Reticle Style Cycle Toggle */}
          {onToggleReticleStyle && (
            <button
              onClick={onToggleReticleStyle}
              title="Cycle Reticle Tracking Style (Line, Highlighter, Spotlight, Underline, etc.)"
              className="p-2.5 rounded-xl border transition-all active:scale-95 hidden xs:flex items-center justify-center"
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: theme.textDim,
              }}
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}

          {/* Quick Chunk Size (1w, 2w, 3w) Toggle */}
          {onCycleChunkSize && (
            <button
              onClick={onCycleChunkSize}
              title={`Chunk Size: ${chunkSize} word${chunkSize > 1 ? 's' : ''} at a time (W)`}
              className="px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all active:scale-95 flex items-center justify-center"
              style={{
                backgroundColor: chunkSize > 1 ? `${theme.accent}22` : theme.bg,
                borderColor: chunkSize > 1 ? theme.accent : theme.border,
                color: chunkSize > 1 ? theme.accent : theme.textDim,
              }}
            >
              {chunkSize}w
            </button>
          )}

          {/* Save States & Cookie Break Button */}
          {onOpenSaveStates && (
            <button
              onClick={onOpenSaveStates}
              title="Save States & Cookie Places / Take a Break (K)"
              className="p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center hover:opacity-90"
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: theme.accent,
              }}
            >
              <Cookie className="w-4 h-4 text-amber-400" />
            </button>
          )}

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
            title="Typography & Pacing Settings"
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
            title="Toggle Fullscreen (F)"
            className="p-2.5 rounded-xl border transition-all active:scale-95 hidden sm:flex items-center justify-center"
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

      {/* 3. Velocity Bar with Video Speed Presets */}
      <div
        className="pt-3 border-t flex flex-col gap-2"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5" style={{ color: theme.accent }} />
            <span className="font-mono text-xs font-bold" style={{ color: theme.textBright }}>
              {wpm} <span className="text-[10px] font-normal" style={{ color: theme.textDim }}>WPM</span>
            </span>
            {wpm >= 600 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/20">
                <Zap className="w-2.5 h-2.5" />
                FLOW
              </span>
            )}
          </div>

          {/* Quick Preset Buttons (Matching the video) */}
          <div className="flex items-center gap-1">
            {WPM_PRESETS.map((preset) => {
              const isActive = wpm === preset;
              const is600 = preset === 600;
              return (
                <button
                  key={preset}
                  onClick={() => onWpmChange(preset)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded-lg transition-all ${
                    isActive
                      ? 'font-bold text-white shadow-sm'
                      : is600
                      ? 'border font-semibold opacity-90 hover:opacity-100'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isActive ? theme.accent : theme.bg,
                    borderColor: is600 && !isActive ? `${theme.accent}60` : theme.border,
                    color: isActive ? '#ffffff' : is600 ? theme.accent : theme.textDim,
                  }}
                >
                  {preset}
                  {is600 && !isActive ? '★' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Speed Slider with -/+ Step Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onWpmChange(Math.max(100, wpm - 25))}
            className="p-1 rounded-lg border transition-colors hover:bg-opacity-80 active:scale-95"
            style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.textDim }}
            title="Decrease 25 WPM (Down Arrow)"
          >
            <Minus className="w-3 h-3" />
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
            className="p-1 rounded-lg border transition-colors hover:bg-opacity-80 active:scale-95"
            style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.textDim }}
            title="Increase 25 WPM (Up Arrow)"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
