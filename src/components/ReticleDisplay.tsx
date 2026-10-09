import React from 'react';
import { ParsedWord, TypographySettings, ThemeColors } from '../types/reader';
import { splitWordAtORP } from '../utils/orp';
import { Play } from 'lucide-react';

interface ReticleDisplayProps {
  currentWord: ParsedWord | null;
  previousWord: ParsedWord | null;
  nextWord: ParsedWord | null;
  isPlaying: boolean;
  typography: TypographySettings;
  theme: ThemeColors;
  wpm: number;
  chunkSize?: number;
  onBoxClick?: () => void;
  documentTitle?: string;
}

export const ReticleDisplay: React.FC<ReticleDisplayProps> = ({
  currentWord,
  previousWord,
  nextWord,
  isPlaying,
  typography,
  theme,
  wpm,
  chunkSize = 1,
  onBoxClick,
  documentTitle,
}) => {
  const wordText = currentWord?.raw || (isPlaying ? '' : 'Ready');
  const orpIdx = currentWord ? currentWord.orpIndex : Math.min(1, wordText.length - 1);
  const { left, focal, right } = splitWordAtORP(wordText, orpIdx);

  // Width classes
  const widthClasses = {
    compact: 'max-w-md h-36 sm:h-40',
    normal: 'max-w-2xl h-44 sm:h-52',
    wide: 'max-w-4xl h-52 sm:h-60',
  }[typography.reticleWidth];

  // Font family mappings
  const fontFamilyCss = {
    'JetBrains Mono': "'JetBrains Mono', monospace",
    'Fira Code': "'Fira Code', monospace",
    'Space Mono': "'Space Mono', monospace",
    'Inter': "'Inter', sans-serif",
    'Atkinson Hyperlegible': "'Atkinson Hyperlegible', sans-serif",
    'Merriweather': "'Merriweather', Georgia, serif",
  }[typography.fontFamily];

  // Case transform
  const transformClass = {
    none: 'normal-case',
    uppercase: 'uppercase',
    lowercase: 'lowercase',
  }[typography.textTransform];

  const isVideoSlot = typography.reticleStyle === 'videoSlot';

  // Responsive font size adjustment: on mobile screens, adjust if word is exceptionally long
  const wordLen = wordText.length;
  const isExtraLongWord = wordLen >= 12;

  return (
    <div className="relative w-full flex flex-col items-center justify-center my-auto">
      {/* Top Banner Challenge / Title (as seen in video "Can you read 900 words per minute?") */}
      {isVideoSlot && (
        <div className="mb-4 sm:mb-6 text-center select-none animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm">
            <span>Reading at {wpm} WPM</span>
            {wpm >= 600 && <span className="font-bold text-red-300">⚡ Flow State</span>}
          </div>
        </div>
      )}

      {/* Main Reticle Reading Box */}
      <div
        onClick={onBoxClick}
        className={`relative w-full ${widthClasses} mx-auto flex items-center justify-center select-none cursor-pointer transition-all duration-150 group ${
          isVideoSlot
            ? 'border-y-2 py-8 sm:py-12 bg-black'
            : 'rounded-2xl border shadow-2xl overflow-hidden'
        }`}
        style={{
          backgroundColor: isVideoSlot ? '#000000' : theme.surface,
          borderColor: isVideoSlot ? '#333b47' : theme.border,
        }}
        title="Tap anywhere to Play / Pause (Space)"
      >
        {/* Subtle radial ambient focus glow on the focal letter */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            background: `radial-gradient(circle 140px at 40% 50%, ${typography.highlightColor}40, transparent 80%)`,
          }}
        />

        {/* --- GUIDE MARKERS --- */}
        {typography.showOrpMarker && (
          <>
            {/* 1. Video Style Slot Notch Ticks (As shown in the video) */}
            {isVideoSlot && (
              <>
                {/* Top Notch Tick */}
                <div
                  className="absolute top-0 w-[2px] h-4 sm:h-5 z-20 pointer-events-none transition-colors"
                  style={{
                    left: '40%',
                    backgroundColor: typography.highlightColor,
                    boxShadow: `0 0 6px ${typography.highlightColor}`,
                  }}
                />
                {/* Bottom Notch Tick */}
                <div
                  className="absolute bottom-0 w-[2px] h-4 sm:h-5 z-20 pointer-events-none transition-colors"
                  style={{
                    left: '40%',
                    backgroundColor: typography.highlightColor,
                    boxShadow: `0 0 6px ${typography.highlightColor}`,
                  }}
                />
                {/* Video-style bottom-right WPM tag */}
                <div
                  className="absolute -bottom-6 sm:-bottom-7 right-2 sm:right-4 text-[12px] sm:text-xs font-mono font-medium tracking-tight pointer-events-none select-none"
                  style={{ color: '#8892a0' }}
                >
                  {wpm} wpm
                </div>
              </>
            )}

            {/* 2. Classic Ticks */}
            {typography.reticleStyle === 'ticks' && (
              <>
                <div
                  className="absolute top-0 w-[2.5px] h-6 rounded-b transition-colors z-20"
                  style={{
                    left: '40%',
                    backgroundColor: typography.highlightColor,
                    opacity: 0.9,
                    boxShadow: `0 0 8px ${typography.highlightColor}66`,
                  }}
                />
                <div
                  className="absolute bottom-0 w-[2.5px] h-6 rounded-t transition-colors z-20"
                  style={{
                    left: '40%',
                    backgroundColor: typography.highlightColor,
                    opacity: 0.9,
                    boxShadow: `0 0 8px ${typography.highlightColor}66`,
                  }}
                />
              </>
            )}

            {/* 3. Crosshairs */}
            {typography.reticleStyle === 'crosshairs' && (
              <>
                <div
                  className="absolute top-0 bottom-0 w-[1.5px] opacity-25 pointer-events-none"
                  style={{ left: '40%', backgroundColor: typography.highlightColor }}
                />
                <div
                  className="absolute left-8 right-8 h-[1px] opacity-15 pointer-events-none"
                  style={{ top: '50%', backgroundColor: theme.textDim }}
                />
                <div
                  className="absolute top-0 w-1 h-5 rounded-b"
                  style={{ left: 'calc(40% - 1.25px)', backgroundColor: typography.highlightColor }}
                />
                <div
                  className="absolute bottom-0 w-1 h-5 rounded-t"
                  style={{ left: 'calc(40% - 1.25px)', backgroundColor: typography.highlightColor }}
                />
              </>
            )}

            {/* 4. Brackets */}
            {typography.reticleStyle === 'bracket' && (
              <div
                className="absolute pointer-events-none flex items-center justify-center"
                style={{
                  left: 'calc(40% - 22px)',
                  width: '44px',
                  height: '64px',
                  borderLeft: `2px solid ${typography.highlightColor}77`,
                  borderRight: `2px solid ${typography.highlightColor}77`,
                }}
              />
            )}

            {/* 5. Laser Line */}
            {typography.reticleStyle === 'laser' && (
              <div
                className="absolute top-0 bottom-0 w-[1.5px] pointer-events-none"
                style={{
                  left: '40%',
                  background: `linear-gradient(to bottom, transparent, ${typography.highlightColor} 30%, ${typography.highlightColor} 70%, transparent)`,
                  boxShadow: `0 0 6px ${typography.highlightColor}`,
                  opacity: 0.6,
                }}
              />
            )}

            {/* 6. Minimal */}
            {typography.reticleStyle === 'minimal' && (
              <div
                className="absolute top-4 w-2 h-2 rounded-full pointer-events-none"
                style={{
                  left: 'calc(40% - 4px)',
                  backgroundColor: typography.highlightColor,
                  boxShadow: `0 0 6px ${typography.highlightColor}`,
                }}
              />
            )}
          </>
        )}

        {/* --- MAIN RSVP TEXT DISPLAY --- */}
        <div
          className={`w-full flex items-baseline justify-center relative z-10 px-2 ${transformClass}`}
          style={{
            fontFamily: fontFamilyCss,
            fontSize: isExtraLongWord
              ? `clamp(24px, 5.5vw, ${typography.fontSize * 0.85}px)`
              : `clamp(30px, 7.5vw, ${typography.fontSize}px)`,
            fontWeight: typography.fontWeight,
            letterSpacing: `${typography.letterSpacing}px`,
            lineHeight: 1,
          }}
        >
          {/* Left Segment: right-aligned up to the 40% focal axis */}
          <div
            className="text-right whitespace-pre select-none tracking-normal"
            style={{
              width: '40%',
              color: isVideoSlot ? '#f1f5f9' : theme.textBright,
            }}
          >
            {left}
          </div>

          {/* Focal ORP Character: Locked exactly on the 40% vertical axis */}
          <div
            className="text-center font-bold whitespace-pre transition-colors duration-100 inline-block px-[1px]"
            style={{
              color: typography.highlightColor,
              textShadow: isPlaying ? `0 0 16px ${typography.highlightColor}55` : 'none',
            }}
          >
            {focal}
          </div>

          {/* Right Segment: left-aligned starting from the focal axis */}
          <div
            className="text-left whitespace-pre select-none tracking-normal"
            style={{
              width: '60%',
              color: isVideoSlot ? '#f1f5f9' : theme.textBright,
            }}
          >
            {right}
          </div>
        </div>

        {/* Play / Pause Touch Overlay when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-30 transition-opacity">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium shadow-xl">
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Tap to Read</span>
            </div>
          </div>
        )}

        {/* Discrete Peripheral Ghost Words (hidden in clean video slot mode for 100% focus) */}
        {!isVideoSlot && (
          <div
            className="absolute bottom-3 left-6 right-6 flex items-center justify-between text-xs font-mono pointer-events-none select-none transition-opacity duration-200"
            style={{ color: theme.textDim, opacity: isPlaying ? 0.35 : 0.7 }}
          >
            <span className="truncate max-w-[40%] text-left">
              {previousWord ? `← ${previousWord.raw}` : ''}
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold">
              {isPlaying ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Reading
                </span>
              ) : (
                <span className="opacity-75">Space / Tap</span>
              )}
            </span>
            <span className="truncate max-w-[40%] text-right">
              {nextWord ? `${nextWord.raw} →` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
