import React, { useState } from 'react';
import { 
  X, 
  Type, 
  Palette, 
  Clock, 
  RotateCcw,
  Sliders,
  Check
} from 'lucide-react';
import { 
  TypographySettings, 
  ThemeColors, 
  PacingConfig, 
  FontFamily, 
  ReticleStyle, 
  TextTransform 
} from '../types/reader';
import { THEMES, ACCENT_PALETTE } from '../utils/themes';
import { DEFAULT_TYPOGRAPHY, DEFAULT_PACING } from '../utils/storage';
import { audioPacer } from '../utils/audioPacer';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  typography: TypographySettings;
  onUpdateTypography: (settings: TypographySettings) => void;
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  theme: ThemeColors;
  pacing: PacingConfig;
  onUpdatePacing: (pacing: PacingConfig) => void;
  onSelectAccent: (accent: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  typography,
  onUpdateTypography,
  currentThemeId,
  onSelectTheme,
  theme,
  pacing,
  onUpdatePacing,
  onSelectAccent,
}) => {
  const [activeTab, setActiveTab] = useState<'typography' | 'theme' | 'pacing'>('typography');
  const [metronomeActive, setMetronomeActive] = useState<boolean>(() => audioPacer.getEnabled());
  const [metronomeVolume, setMetronomeVolume] = useState<number>(() => audioPacer.getVolume());

  if (!isOpen) return null;

  const fontOptions: { id: FontFamily; label: string; desc: string }[] = [
    { id: 'JetBrains Mono', label: 'JetBrains Mono', desc: 'Monospace, ultra-crisp character differentiation' },
    { id: 'Fira Code', label: 'Fira Code', desc: 'Monospace, high legibility ligatures' },
    { id: 'Space Mono', label: 'Space Mono', desc: 'Distinctive geometric monospace' },
    { id: 'Inter', label: 'Inter Sans', desc: 'Modern proportional UI font' },
    { id: 'Atkinson Hyperlegible', label: 'Atkinson Hyperlegible', desc: 'Braille Institute design for high distinction / dyslexia' },
    { id: 'Merriweather', label: 'Merriweather Serif', desc: 'Traditional book typography with serifs' },
  ];

  const reticleStyles: { id: ReticleStyle; label: string }[] = [
    { id: 'videoSlot', label: 'Cinema Notch (Video)' },
    { id: 'line', label: 'Standard Line' },
    { id: 'highlighter', label: 'Highlighter' },
    { id: 'spotlight', label: 'Spotlight' },
    { id: 'underline', label: 'Underline' },
    { id: 'ticks', label: 'Classic Ticks' },
    { id: 'crosshairs', label: 'Crosshairs' },
    { id: 'bracket', label: 'Brackets' },
    { id: 'laser', label: 'Laser Line' },
    { id: 'minimal', label: 'Minimal Dot' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.textBright,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5" style={{ color: theme.accent }} />
            <h2 className="font-semibold text-lg">Reader Configuration</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border transition-colors hover:opacity-80 active:scale-95"
            style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.textDim }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div
          className="flex items-center px-6 border-b gap-4 text-xs font-medium"
          style={{ borderColor: theme.border, backgroundColor: theme.bg }}
        >
          <button
            onClick={() => setActiveTab('typography')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'typography' ? 'border-current font-bold' : 'border-transparent opacity-60'
            }`}
            style={{ color: activeTab === 'typography' ? theme.accent : theme.textDim }}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Typography</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'theme' ? 'border-current font-bold' : 'border-transparent opacity-60'
            }`}
            style={{ color: activeTab === 'theme' ? theme.accent : theme.textDim }}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme & Focal Accent</span>
          </button>

          <button
            onClick={() => setActiveTab('pacing')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'pacing' ? 'border-current font-bold' : 'border-transparent opacity-60'
            }`}
            style={{ color: activeTab === 'pacing' ? theme.accent : theme.textDim }}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Intelligent Pacing</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* TAB 1: TYPOGRAPHY */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              {/* Font Family */}
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider font-semibold mb-2" style={{ color: theme.textDim }}>
                  Font Family
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fontOptions.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => onUpdateTypography({ ...typography, fontFamily: f.id })}
                      className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                        typography.fontFamily === f.id ? 'ring-2 ring-current font-semibold' : 'hover:opacity-90'
                      }`}
                      style={{
                        backgroundColor: typography.fontFamily === f.id ? theme.surfaceHover : theme.bg,
                        borderColor: theme.border,
                        color: typography.fontFamily === f.id ? theme.accent : theme.textBright,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{f.label}</span>
                        {typography.fontFamily === f.id && <Check className="w-4 h-4" />}
                      </div>
                      <span className="text-[11px] opacity-60 mt-1 line-clamp-1">{f.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size & Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono" style={{ color: theme.textDim }}>
                    <span>FONT SIZE</span>
                    <span className="font-bold text-sm" style={{ color: theme.textBright }}>
                      {typography.fontSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={32}
                    max={80}
                    step={2}
                    value={typography.fontSize}
                    onChange={(e) => onUpdateTypography({ ...typography, fontSize: parseInt(e.target.value, 10) })}
                    className="w-full accent-current cursor-pointer"
                    style={{ accentColor: theme.accent }}
                  />
                </div>

                <div className="space-y-2">
                  <span className="block text-xs uppercase font-mono tracking-wider" style={{ color: theme.textDim }}>
                    WEIGHT
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['400', '500', '600', '700'] as const).map((wt) => (
                      <button
                        key={wt}
                        onClick={() => onUpdateTypography({ ...typography, fontWeight: wt })}
                        className={`py-1.5 text-xs rounded border transition-all ${
                          typography.fontWeight === wt ? 'font-bold' : 'opacity-70'
                        }`}
                        style={{
                          backgroundColor: typography.fontWeight === wt ? theme.accent : theme.bg,
                          borderColor: theme.border,
                          color: typography.fontWeight === wt ? '#fff' : theme.textBright,
                        }}
                      >
                        {wt === '400' ? 'Regular' : wt === '500' ? 'Medium' : wt === '600' ? 'Semi' : 'Bold'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Case & Letter Spacing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs uppercase font-mono tracking-wider mb-2" style={{ color: theme.textDim }}>
                    CASE TRANSFORM
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {(['none', 'uppercase', 'lowercase'] as TextTransform[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => onUpdateTypography({ ...typography, textTransform: c })}
                        className={`py-2 text-xs rounded border capitalize transition-all ${
                          typography.textTransform === c ? 'font-bold' : 'opacity-70'
                        }`}
                        style={{
                          backgroundColor: typography.textTransform === c ? theme.accent : theme.bg,
                          borderColor: theme.border,
                          color: typography.textTransform === c ? '#fff' : theme.textBright,
                        }}
                      >
                        {c === 'none' ? 'Standard' : c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono" style={{ color: theme.textDim }}>
                    <span>LETTER SPACING</span>
                    <span className="font-bold">{typography.letterSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min={-1}
                    max={4}
                    step={1}
                    value={typography.letterSpacing}
                    onChange={(e) => onUpdateTypography({ ...typography, letterSpacing: parseInt(e.target.value, 10) })}
                    className="w-full accent-current cursor-pointer"
                    style={{ accentColor: theme.accent }}
                  />
                </div>
              </div>

              {/* Reticle Guide Style & Box Width */}
              <div className="space-y-3">
                <span className="block text-xs uppercase font-mono tracking-wider font-semibold" style={{ color: theme.textDim }}>
                  ORP RETICLE GUIDE STYLE
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {reticleStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => onUpdateTypography({ ...typography, reticleStyle: style.id })}
                      className={`p-2.5 text-xs rounded-xl border text-center transition-all ${
                        typography.reticleStyle === style.id ? 'font-bold ring-2' : 'opacity-75'
                      }`}
                      style={{
                        backgroundColor: typography.reticleStyle === style.id ? theme.surfaceHover : theme.bg,
                        borderColor: theme.border,
                        color: typography.reticleStyle === style.id ? theme.accent : theme.textBright,
                      }}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-xs uppercase font-mono tracking-wider font-semibold cursor-pointer" style={{ color: theme.textDim }}>
                  Display ORP Alignment Markers
                </label>
                <input
                  type="checkbox"
                  checked={typography.showOrpMarker}
                  onChange={(e) => onUpdateTypography({ ...typography, showOrpMarker: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                  style={{ accentColor: theme.accent }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: THEME & COLOR PALETTE */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              {/* Presets Grid */}
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider font-semibold mb-2" style={{ color: theme.textDim }}>
                  Preset Themes
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(THEMES).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onSelectTheme(t.id)}
                      className={`p-3 rounded-xl border flex flex-col gap-2 transition-all text-left ${
                        currentThemeId === t.id ? 'ring-2 ring-current font-bold' : 'hover:opacity-90'
                      }`}
                      style={{
                        backgroundColor: t.surface,
                        borderColor: currentThemeId === t.id ? t.accent : t.border,
                        color: t.textBright,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{t.name}</span>
                        {currentThemeId === t.id && <Check className="w-3.5 h-3.5" style={{ color: t.accent }} />}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md border" style={{ backgroundColor: t.bg, borderColor: t.border }} />
                        <div className="w-5 h-5 rounded-md" style={{ backgroundColor: t.surface }} />
                        <div className="w-5 h-5 rounded-md" style={{ backgroundColor: t.accent }} />
                        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: t.surface, color: t.accent }}>
                          ORP
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Focal Letter Accent Swatches */}
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider font-semibold mb-2" style={{ color: theme.textDim }}>
                  Focal Letter Accent Color
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {ACCENT_PALETTE.map((acc) => (
                    <button
                      key={acc.value}
                      onClick={() => {
                        onSelectAccent(acc.value);
                        onUpdateTypography({ ...typography, highlightColor: acc.value });
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 border ${
                        typography.highlightColor.toLowerCase() === acc.value.toLowerCase() ? 'ring-2 ring-white scale-110' : ''
                      }`}
                      style={{ backgroundColor: acc.value, borderColor: theme.border }}
                      title={acc.name}
                    >
                      {typography.highlightColor.toLowerCase() === acc.value.toLowerCase() && (
                        <Check className="w-4 h-4 text-black mix-blend-difference" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTELLIGENT PACING ENGINE */}
          {activeTab === 'pacing' && (
            <div className="space-y-5">
              <p className="text-xs" style={{ color: theme.textDim }}>
                Natural human reading slows down momentarily at sentences and commas to allow semantic comprehension. Adjust multipliers below to match your cognitive cadence.
              </p>

              {/* Sentence pause multiplier */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono" style={{ color: theme.textDim }}>
                  <span>SENTENCE END PAUSE (. ! ?)</span>
                  <span className="font-bold" style={{ color: theme.textBright }}>
                    {pacing.sentencePauseMultiplier.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={4.0}
                  step={0.1}
                  value={pacing.sentencePauseMultiplier}
                  onChange={(e) => onUpdatePacing({ ...pacing, sentencePauseMultiplier: parseFloat(e.target.value) })}
                  className="w-full accent-current cursor-pointer"
                  style={{ accentColor: theme.accent }}
                />
              </div>

              {/* Clause comma pause multiplier */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono" style={{ color: theme.textDim }}>
                  <span>CLAUSE PAUSE (, ; : —)</span>
                  <span className="font-bold" style={{ color: theme.textBright }}>
                    {pacing.commaPauseMultiplier.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={3.0}
                  step={0.1}
                  value={pacing.commaPauseMultiplier}
                  onChange={(e) => onUpdatePacing({ ...pacing, commaPauseMultiplier: parseFloat(e.target.value) })}
                  className="w-full accent-current cursor-pointer"
                  style={{ accentColor: theme.accent }}
                />
              </div>

              {/* Long word pause multiplier */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono" style={{ color: theme.textDim }}>
                  <span>LONG WORD PAUSE (&gt;8 CHARS)</span>
                  <span className="font-bold" style={{ color: theme.textBright }}>
                    {pacing.longWordMultiplier.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={2.0}
                  step={0.05}
                  value={pacing.longWordMultiplier}
                  onChange={(e) => onUpdatePacing({ ...pacing, longWordMultiplier: parseFloat(e.target.value) })}
                  className="w-full accent-current cursor-pointer"
                  style={{ accentColor: theme.accent }}
                />
              </div>

              {/* Number sequences */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono" style={{ color: theme.textDim }}>
                  <span>NUMBER SEQUENCES</span>
                  <span className="font-bold" style={{ color: theme.textBright }}>
                    {pacing.numberMultiplier.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={2.5}
                  step={0.1}
                  value={pacing.numberMultiplier}
                  onChange={(e) => onUpdatePacing({ ...pacing, numberMultiplier: parseFloat(e.target.value) })}
                  className="w-full accent-current cursor-pointer"
                  style={{ accentColor: theme.accent }}
                />
              </div>

              {/* Paragraph pause */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono" style={{ color: theme.textDim }}>
                  <span>PARAGRAPH TRANSITION PAUSE</span>
                  <span className="font-bold" style={{ color: theme.textBright }}>
                    {pacing.paragraphPauseMultiplier.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={4.0}
                  step={0.1}
                  value={pacing.paragraphPauseMultiplier}
                  onChange={(e) => onUpdatePacing({ ...pacing, paragraphPauseMultiplier: parseFloat(e.target.value) })}
                  className="w-full accent-current cursor-pointer"
                  style={{ accentColor: theme.accent }}
                />
              </div>

              {/* Audio Metronome Cadence Ticker */}
              <div className="pt-3 border-t space-y-3" style={{ borderColor: theme.border }}>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs uppercase font-mono tracking-wider font-semibold block" style={{ color: theme.textBright }}>
                      Audio Cadence Metronome (M)
                    </label>
                    <p className="text-[11px]" style={{ color: theme.textDim }}>
                      Subtle acoustic micro-tick on each word to lock in flow state.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const next = !audioPacer.getEnabled();
                      audioPacer.setEnabled(next);
                      setMetronomeActive(next);
                    }}
                    className={`px-3 py-1 text-xs rounded-xl border font-semibold transition-all ${
                      metronomeActive ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1' : 'opacity-70'
                    }`}
                    style={{
                      borderColor: metronomeActive ? undefined : theme.border,
                      color: metronomeActive ? undefined : theme.textDim,
                    }}
                  >
                    {metronomeActive ? 'ON' : 'OFF'}
                  </button>
                </div>

                {metronomeActive && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <div className="flex justify-between text-xs font-mono" style={{ color: theme.textDim }}>
                      <span>METRONOME VOLUME</span>
                      <span className="font-bold" style={{ color: theme.textBright }}>
                        {Math.round(metronomeVolume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.05}
                      max={1.0}
                      step={0.05}
                      value={metronomeVolume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setMetronomeVolume(val);
                        audioPacer.setVolume(val);
                        audioPacer.playTick();
                      }}
                      className="w-full accent-current cursor-pointer"
                      style={{ accentColor: theme.accent }}
                    />
                  </div>
                )}
              </div>

              {/* Reset to defaults button */}
              <button
                onClick={() => onUpdatePacing(DEFAULT_PACING)}
                className="mt-2 text-xs flex items-center gap-1.5 opacity-75 hover:opacity-100 transition-opacity"
                style={{ color: theme.accent }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Pacing to Recommended Defaults</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex justify-end gap-3"
          style={{ borderColor: theme.border, backgroundColor: theme.bg }}
        >
          <button
            onClick={() => {
              onUpdateTypography(DEFAULT_TYPOGRAPHY);
              onUpdatePacing(DEFAULT_PACING);
            }}
            className="px-4 py-2 text-xs rounded-xl border transition-colors opacity-70 hover:opacity-100"
            style={{ borderColor: theme.border, color: theme.textDim }}
          >
            Reset All
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-semibold rounded-xl text-white transition-transform active:scale-95"
            style={{ backgroundColor: theme.accent }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
