import React from 'react';
import { ParsedWord, TypographySettings, ThemeColors, ReticleStyle } from '../types/reader';
import { splitWordAtORP } from '../utils/orp';
import { Play, Volume2, Sparkles } from 'lucide-react';

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
  isReadAloudActive?: boolean;
  onToggleReticleStyle?: () => void;
  onSelectReticleStyle?: (style: ReticleStyle) => void;
}

export const RETICLE_STYLE_OPTIONS: { id: ReticleStyle; label: string; iconLabel: string }[] = [
  { id: 'videoSlot', label: 'Cinema Notch', iconLabel: 'Notch' },
  { id: 'line', label: 'Standard Line', iconLabel: 'Line' },
  { id: 'highlighter', label: 'Highlighter', iconLabel: 'Glow' },
  { id: 'spotlight', label: 'Spotlight', iconLabel: 'Spot' },
  { id: 'underline', label: 'Underline', iconLabel: 'Under' },
  { id: 'ticks', label: 'Classic Ticks', iconLabel: 'Ticks' },
  { id: 'crosshairs', label: 'Crosshairs', iconLabel: 'Cross' },
  { id: 'bracket', label: 'Brackets', iconLabel: '[  ]' },
  { id: 'laser', label: 'Laser Line', iconLabel: 'Laser' },
  { id: 'minimal', label: 'Minimal Dot', iconLabel: 'Dot' },
];

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
  isReadAloudActive = false,
  onToggleReticleStyle,
  onSelectReticleStyle,
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

  // Font family mappings with fallback stacks
  const fontFamilyCss = {
    'JetBrains Mono': "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    'Fira Code': "'Fira Code', 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
    'Space Mono': "'Space Mono', ui-monospace, monospace",
    'Inter': "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    'Atkinson Hyperlegible': "'Atkinson Hyperlegible', sans-serif",
    'Merriweather': "'Merriweather', Georgia, Cambria, 'Times New Roman', serif",
  }[typography.fontFamily] || "'Inter', sans-serif";

  // Case transform
  const transformClass = {
    none: 'normal-case',
    uppercase: 'uppercase',
    lowercase: 'lowercase',
  }[typography.textTransform];

  const isVideoSlot = typography.reticleStyle === 'videoSlot';
  const style = typography.reticleStyle;

  // Responsive font size adjustment: on mobile screens, adjust if word is exceptionally long
  const wordLen = wordText.length;
  const isExtraLongWord = wordLen >= 12;

  // Next style in sequence for quick one-click cycle
  const currentStyleIdx = RETICLE_STYLE_OPTIONS.findIndex((s) => s.id === style);
  const nextStyle = RETICLE_STYLE_OPTIONS[(currentStyleIdx + 1) % RETICLE_STYLE_OPTIONS.length];

  return (
    <div className="relative w-full flex flex-col items-center justify-center my-auto">
      {/* Top Banner Challenge / Status */}
      <div className="mb-3 sm:mb-4 text-center select-none animate-fadeIn flex items-center justify-center gap-2 flex-wrap">
        {isVideoSlot && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm">
            <span>Reading at {wpm} WPM</span>
            {wpm >= 600 && <span className="font-bold text-red-300">⚡ Flow State</span>}
          </div>
        )}

        {/* Read-Aloud Audio Active Indicator Badge */}
        {isReadAloudActive && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm animate-pulse">
            <Volume2 className="w-3.5 h-3.5 animate-bounce" />
            <span>Read-Aloud Voice Active</span>
          </div>
        )}

        {/* Reticle Style Quick Pill */}
        <button
          onClick={() => {
            if (onSelectReticleStyle) {
              onSelectReticleStyle(nextStyle.id);
            } else if (onToggleReticleStyle) {
              onToggleReticleStyle();
            }
          }}
          title={`Current style: ${RETICLE_STYLE_OPTIONS.find((s) => s.id === style)?.label}. Click to switch to ${nextStyle.label}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.textDim,
          }}
        >
          <Sparkles className="w-3 h-3" style={{ color: typography.highlightColor }} />
          <span>Style:</span>
          <span className="font-bold" style={{ color: theme.textBright }}>
            {RETICLE_STYLE_OPTIONS.find((s) => s.id === style)?.label}
          </span>
          <span className="text-[10px] opacity-60">↻</span>
        </button>
      </div>

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
        {/* Ambient background glow according to reticle style */}
        {style === 'spotlight' && (
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-300"
            style={{
              background: `radial-gradient(ellipse 260px 180px at 40% 50%, ${typography.highlightColor}33 0%, ${typography.highlightColor}10 45%, transparent 75%)`,
            }}
          />
        )}

        {style === 'highlighter' && (
          <div
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150"
            style={{
              left: 'calc(40% - 70px)',
              width: '140px',
              height: '42px',
              backgroundColor: `${typography.highlightColor}25`,
              borderRadius: '6px',
              border: `1px solid ${typography.highlightColor}40`,
              boxShadow: `0 0 16px ${typography.highlightColor}30`,
            }}
          />
        )}

        {/* Subtle radial ambient focus glow on the focal letter for standard styles */}
        {style !== 'spotlight' && style !== 'highlighter' && (
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              background: `radial-gradient(circle 140px at 40% 50%, ${typography.highlightColor}40, transparent 80%)`,
            }}
          />
        )}

        {/* --- GUIDE MARKERS --- */}
        {typography.showOrpMarker && (
          <>
            {/* 1. Video Style Slot Notch Ticks (As shown in the original speed reader drill) */}
            {isVideoSlot && (
              <>
                <div
                  className="absolute top-0 w-[2px] h-4 sm:h-5 z-20 pointer-events-none transition-colors"
                  style={{
                    left: '40%',
                    backgroundColor: typography.highlightColor,
                    boxShadow: `0 0 6px ${typography.highlightColor}`,
                  }}
                />
                <div
                  className="absolute bottom-0 w-[2px] h-4 sm:h-5 z-20 pointer-events-none transition-colors"
                  style={{
                    left: '40%',
                    backgroundColor: typography.highlightColor,
                    boxShadow: `0 0 6px ${typography.highlightColor}`,
                  }}
                />
                <div
                  className="absolute -bottom-6 sm:-bottom-7 right-2 sm:right-4 text-[12px] sm:text-xs font-mono font-medium tracking-tight pointer-events-none select-none"
                  style={{ color: '#8892a0' }}
                >
                  {wpm} wpm
                </div>
              </>
            )}

            {/* 2. Standard Continuous Vertical Line (Standard Line style) */}
            {style === 'line' && (
              <>
                {/* Thin vertical guideline through the 40% focal axis */}
                <div
                  className="absolute top-0 bottom-0 w-[1.5px] pointer-events-none z-10 transition-colors"
                  style={{
                    left: '40%',
                    backgroundColor: typography.highlightColor,
                    opacity: 0.65,
                    boxShadow: `0 0 8px ${typography.highlightColor}66`,
                  }}
                />
                {/* Top indicator pip */}
                <div
                  className="absolute top-0 w-2 h-2.5 rounded-b pointer-events-none z-20"
                  style={{
                    left: 'calc(40% - 3px)',
                    backgroundColor: typography.highlightColor,
                  }}
                />
                {/* Bottom indicator pip */}
                <div
                  className="absolute bottom-0 w-2 h-2.5 rounded-t pointer-events-none z-20"
                  style={{
                    left: 'calc(40% - 3px)',
                    backgroundColor: typography.highlightColor,
                  }}
                />
              </>
            )}

            {/* 3. Highlighter Guide Line */}
            {style === 'highlighter' && (
              <>
                {/* Top & bottom subtle alignment markers */}
                <div
                  className="absolute top-1 w-3 h-1 rounded-full pointer-events-none z-20"
                  style={{
                    left: 'calc(40% - 6px)',
                    backgroundColor: typography.highlightColor,
                    opacity: 0.8,
                  }}
                />
                <div
                  className="absolute bottom-1 w-3 h-1 rounded-full pointer-events-none z-20"
                  style={{
                    left: 'calc(40% - 6px)',
                    backgroundColor: typography.highlightColor,
                    opacity: 0.8,
                  }}
                />
              </>
            )}

            {/* 4. Spotlight Guide Reticle */}
            {style === 'spotlight' && (
              <>
                {/* Outer ring target around the ORP */}
                <div
                  className="absolute pointer-events-none rounded-full z-10 animate-pulse"
                  style={{
                    left: 'calc(40% - 36px)',
                    top: 'calc(50% - 36px)',
                    width: '72px',
                    height: '72px',
                    border: `1.5px dashed ${typography.highlightColor}55`,
                  }}
                />
                {/* Top/bottom ticks */}
                <div
                  className="absolute top-2 w-[2px] h-3 pointer-events-none z-20"
                  style={{ left: '40%', backgroundColor: typography.highlightColor }}
                />
                <div
                  className="absolute bottom-2 w-[2px] h-3 pointer-events-none z-20"
                  style={{ left: '40%', backgroundColor: typography.highlightColor }}
                />
              </>
            )}

            {/* 5. Underline Style */}
            {style === 'underline' && (
              <>
                {/* Persistent horizontal underline centered under the focal point */}
                <div
                  className="absolute pointer-events-none z-20 transition-all duration-150"
                  style={{
                    left: 'calc(40% - 30px)',
                    bottom: '22%',
                    width: '60px',
                    height: '3px',
                    backgroundColor: typography.highlightColor,
                    borderRadius: '2px',
                    boxShadow: `0 0 10px ${typography.highlightColor}99`,
                  }}
                />
                {/* Center marker pip */}
                <div
                  className="absolute w-2 h-2 rounded-full pointer-events-none z-20"
                  style={{
                    left: 'calc(40% - 4px)',
                    bottom: 'calc(22% - 6px)',
                    backgroundColor: typography.highlightColor,
                    boxShadow: `0 0 6px ${typography.highlightColor}`,
                  }}
                />
              </>
            )}

            {/* 6. Classic Ticks */}
            {style === 'ticks' && (
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

            {/* 7. Crosshairs */}
            {style === 'crosshairs' && (
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

            {/* 8. Brackets */}
            {style === 'bracket' && (
              <div
                className="absolute pointer-events-none flex items-center justify-center z-20"
                style={{
                  left: 'calc(40% - 24px)',
                  width: '48px',
                  height: '68px',
                  borderLeft: `2.5px solid ${typography.highlightColor}99`,
                  borderRight: `2.5px solid ${typography.highlightColor}99`,
                  borderRadius: '4px',
                }}
              />
            )}

            {/* 9. Laser Line */}
            {style === 'laser' && (
              <div
                className="absolute top-0 bottom-0 w-[2px] pointer-events-none z-20"
                style={{
                  left: '40%',
                  background: `linear-gradient(to bottom, transparent, ${typography.highlightColor} 30%, ${typography.highlightColor} 70%, transparent)`,
                  boxShadow: `0 0 10px ${typography.highlightColor}`,
                  opacity: 0.8,
                }}
              />
            )}

            {/* 10. Minimal Dot */}
            {style === 'minimal' && (
              <div
                className="absolute top-4 w-2 h-2 rounded-full pointer-events-none z-20"
                style={{
                  left: 'calc(40% - 4px)',
                  backgroundColor: typography.highlightColor,
                  boxShadow: `0 0 8px ${typography.highlightColor}`,
                }}
              />
            )}
          </>
        )}

        {/* --- MAIN RSVP TEXT DISPLAY (Zero-Jitter ORP Fixed Focal Layout) --- */}
        <div
          className={`w-full relative z-10 select-none ${transformClass}`}
          style={{
            fontFamily: fontFamilyCss,
            fontSize: isExtraLongWord
              ? `clamp(24px, 5.5vw, ${typography.fontSize * 0.85}px)`
              : `clamp(30px, 7.5vw, ${typography.fontSize}px)`,
            fontWeight: typography.fontWeight,
            letterSpacing: `${typography.letterSpacing}px`,
            lineHeight: 1,
            height: '1.3em',
          }}
        >
          {/* Left Segment: right-aligned up to the 40% focal axis */}
          <div
            className="absolute top-0 bottom-0 left-0 right-[60%] flex items-center justify-end whitespace-pre select-none pointer-events-none"
            style={{
              color: isVideoSlot ? '#f1f5f9' : theme.textBright,
              paddingRight: '0.5ch',
            }}
          >
            {left}
          </div>

          {/* Focal ORP Character: Locked exactly on the 40% vertical axis */}
          <div
            className="absolute top-0 bottom-0 left-[40%] -translate-x-1/2 flex items-center justify-center font-bold whitespace-pre transition-colors duration-100 z-10 pointer-events-none"
            style={{
              color: typography.highlightColor,
              textShadow: isPlaying ? `0 0 16px ${typography.highlightColor}66` : 'none',
              width: '1ch',
            }}
          >
            {focal}
            {/* Additional Underline style highlight below focal letter */}
            {style === 'underline' && (
              <span
                className="absolute left-0 right-0 -bottom-1 h-[2.5px] rounded-full pointer-events-none"
                style={{ backgroundColor: typography.highlightColor }}
              />
            )}
          </div>

          {/* Right Segment: left-aligned starting from the focal axis */}
          <div
            className="absolute top-0 bottom-0 left-[40%] right-0 flex items-center justify-start whitespace-pre select-none pointer-events-none"
            style={{
              color: isVideoSlot ? '#f1f5f9' : theme.textBright,
              paddingLeft: '0.5ch',
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
              <span>Tap to Read (Space)</span>
            </div>
          </div>
        )}

        {/* Discrete Peripheral Ghost Words */}
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

      {/* Reticle Style Quick Picker Buttons */}
      <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap max-w-xl mx-auto px-2">
        <span className="text-[10px] font-mono uppercase tracking-wider mr-1" style={{ color: theme.textDim }}>
          Reticle Style:
        </span>
        {RETICLE_STYLE_OPTIONS.map((opt) => {
          const isActive = style === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelectReticleStyle && onSelectReticleStyle(opt.id)}
              className={`px-2 py-0.5 text-[11px] font-mono rounded-md border transition-all active:scale-95 ${
                isActive ? 'font-bold shadow-sm' : 'opacity-65 hover:opacity-100'
              }`}
              style={{
                backgroundColor: isActive ? theme.surfaceHover : theme.bg,
                borderColor: isActive ? typography.highlightColor : theme.border,
                color: isActive ? typography.highlightColor : theme.textDim,
              }}
              title={opt.label}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
