import React, { useState } from 'react';
import { 
  X, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Zap, 
  BarChart3, 
  Award, 
  Flame, 
  Sparkles,
  Calendar,
  CheckCircle2,
  Brain
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { DocumentSource, ReadingInsightsData, ThemeColors } from '../types/reader';

interface ReadingInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  insights: ReadingInsightsData;
  activeDoc: DocumentSource;
  currentWordIndex: number;
  currentWpm: number;
  theme: ThemeColors;
  onOpenQuiz?: () => void;
}

export const ReadingInsightsModal: React.FC<ReadingInsightsModalProps> = ({
  isOpen,
  onClose,
  insights,
  activeDoc,
  currentWordIndex,
  currentWpm,
  theme,
  onOpenQuiz,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'velocity' | 'volume'>('velocity');

  if (!isOpen) return null;

  // Active book calculation
  const wordsRemaining = Math.max(0, activeDoc.totalWords - currentWordIndex);
  const percentCompleted = activeDoc.totalWords > 0 
    ? ((currentWordIndex / activeDoc.totalWords) * 100).toFixed(1)
    : '0';

  const formatHoursMinutes = (totalMinutes: number): string => {
    if (totalMinutes <= 0) return '0 min';
    const hrs = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins} min`;
  };

  const timeRemainingMinutes = currentWpm > 0 ? wordsRemaining / currentWpm : 0;
  const timeRemainingStr = formatHoursMinutes(timeRemainingMinutes);

  const totalReadingMinutes = Math.round(insights.totalReadingSeconds / 60);
  const totalReadingTimeStr = formatHoursMinutes(totalReadingMinutes);

  // Milestone comparison: Time saved at 600 WPM vs 250 WPM
  const timeAtAverageWpm = wordsRemaining / 250;
  const timeAtCurrentWpm = currentWpm > 0 ? wordsRemaining / currentWpm : 0;
  const minutesSaved = Math.max(0, Math.round(timeAtAverageWpm - timeAtCurrentWpm));

  // Prepare chart data in chronological order (oldest to newest)
  const chartData = [...insights.sessions].reverse().map((s, index) => ({
    name: s.dateStr || `Session ${index + 1}`,
    wpm: s.avgWpm,
    peakWpm: s.peakWpm,
    words: s.wordsRead,
    book: s.bookTitle,
    duration: Math.round(s.durationSeconds / 60),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.textBright,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: theme.border, backgroundColor: theme.bg }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
            >
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <span>Reading Insights & Analytics</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live
                </span>
              </h2>
              <p className="text-xs" style={{ color: theme.textDim }}>
                Track velocity trends, words absorbed, and completion forecasts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border transition-colors hover:opacity-80 active:scale-95"
            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textDim }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* 1. Stat Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className="p-4 rounded-xl border flex flex-col justify-between"
              style={{ backgroundColor: theme.bg, borderColor: theme.border }}
            >
              <div className="flex items-center justify-between text-xs" style={{ color: theme.textDim }}>
                <span>WORDS READ</span>
                <BookOpen className="w-4 h-4" style={{ color: theme.accent }} />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold font-mono" style={{ color: theme.textBright }}>
                  {insights.totalWordsRead.toLocaleString()}
                </div>
                <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                  Across {insights.sessions.length} sessions
                </div>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border flex flex-col justify-between"
              style={{ backgroundColor: theme.bg, borderColor: theme.border }}
            >
              <div className="flex items-center justify-between text-xs" style={{ color: theme.textDim }}>
                <span>TIME TO FINISH</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {timeRemainingStr}
                </div>
                <div className="text-[11px] font-mono truncate" style={{ color: theme.textDim }}>
                  {wordsRemaining.toLocaleString()} words left
                </div>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border flex flex-col justify-between"
              style={{ backgroundColor: theme.bg, borderColor: theme.border }}
            >
              <div className="flex items-center justify-between text-xs" style={{ color: theme.textDim }}>
                <span>PEAK VELOCITY</span>
                <Flame className="w-4 h-4 text-rose-500" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold font-mono" style={{ color: theme.accent }}>
                  {insights.peakWpmEver} <span className="text-xs font-normal">WPM</span>
                </div>
                <div className="text-[11px] font-mono text-rose-400 mt-0.5">
                  High-speed flow
                </div>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border flex flex-col justify-between"
              style={{ backgroundColor: theme.bg, borderColor: theme.border }}
            >
              <div className="flex items-center justify-between text-xs" style={{ color: theme.textDim }}>
                <span>READING TIME</span>
                <Award className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold font-mono" style={{ color: theme.textBright }}>
                  {totalReadingTimeStr}
                </div>
                <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                  Foveal focus
                </div>
              </div>
            </div>
          </div>

          {/* 2. Visual Chart Section with Tabs */}
          <div
            className="p-5 rounded-2xl border flex flex-col gap-4"
            style={{ backgroundColor: theme.bg, borderColor: theme.border }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3" style={{ borderColor: theme.border }}>
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" style={{ color: theme.accent }} />
                  <span>{activeChartTab === 'velocity' ? 'Reading Velocity Progression (WPM)' : 'Word Intake Volume per Session'}</span>
                </h3>
                <p className="text-xs mt-0.5" style={{ color: theme.textDim }}>
                  {activeChartTab === 'velocity'
                    ? 'Track your reading speed adaptation over time as your brain reduces subvocalization.'
                    : 'Total words processed across recent reading sessions.'}
                </p>
              </div>

              {/* Chart Mode Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl border shrink-0 text-xs" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                <button
                  onClick={() => setActiveChartTab('velocity')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    activeChartTab === 'velocity' ? 'font-bold text-white' : 'opacity-70'
                  }`}
                  style={{
                    backgroundColor: activeChartTab === 'velocity' ? theme.accent : 'transparent',
                  }}
                >
                  Speed (WPM)
                </button>
                <button
                  onClick={() => setActiveChartTab('volume')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    activeChartTab === 'volume' ? 'font-bold text-white' : 'opacity-70'
                  }`}
                  style={{
                    backgroundColor: activeChartTab === 'volume' ? theme.accent : 'transparent',
                  }}
                >
                  Words Read
                </button>
              </div>
            </div>

            {/* Recharts Canvas */}
            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                {activeChartTab === 'velocity' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.accent} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={theme.accent} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252d3d" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[100, 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d111a',
                        borderColor: '#26334a',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      }}
                      formatter={(val: unknown) => [`${val} WPM`, 'Average Speed']}
                      labelFormatter={(label: unknown) => `Session: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="wpm"
                      stroke={theme.accent}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#velocityGrad)"
                      activeDot={{ r: 6, fill: '#ffffff', stroke: theme.accent, strokeWidth: 2 }}
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252d3d" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d111a',
                        borderColor: '#26334a',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      }}
                      formatter={(val: unknown) => [`${Number(val).toLocaleString()} words`, 'Words Read']}
                    />
                    <Bar
                      dataKey="words"
                      fill={theme.accent}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comprehension Retention & True WPM Verification Card */}
          <div
            className="p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}30` }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="p-2.5 rounded-xl shrink-0" 
                style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
              >
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <span>Comprehension & True WPM Verification</span>
                  {insights.comprehensionAttempts && insights.comprehensionAttempts.length > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      {insights.comprehensionAttempts[0].trueWpm} True WPM ({insights.comprehensionAttempts[0].percentage}%)
                    </span>
                  )}
                </h4>
                <p className="text-xs mt-0.5" style={{ color: theme.textDim }}>
                  {insights.comprehensionAttempts && insights.comprehensionAttempts.length > 0
                    ? `Last test: ${insights.comprehensionAttempts[0].score}/${insights.comprehensionAttempts[0].totalQuestions} correct on "${insights.comprehensionAttempts[0].documentTitle}"`
                    : 'Verify cognitive retention at your current speed with a rapid 3-question check.'}
                </p>
              </div>
            </div>

            {onOpenQuiz && (
              <button
                onClick={() => {
                  onClose();
                  onOpenQuiz();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-transform active:scale-95 shadow-sm"
                style={{ backgroundColor: theme.accent, color: '#ffffff' }}
              >
                Test Retention Now
              </button>
            )}
          </div>

          {/* 3. Current Book Completion & Speed Savings Matrix */}
          <div
            className="p-5 rounded-2xl border space-y-4"
            style={{ backgroundColor: theme.bg, borderColor: theme.border }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold" style={{ color: theme.accent }}>
                  Active Book Forecast
                </span>
                <h3 className="font-semibold text-base" style={{ color: theme.textBright }}>
                  {activeDoc.title}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold font-mono" style={{ color: theme.accent }}>
                  {percentCompleted}%
                </span>
                <span className="text-xs block" style={{ color: theme.textDim }}>
                  {currentWordIndex.toLocaleString()} / {activeDoc.totalWords.toLocaleString()} w
                </span>
              </div>
            </div>

            {/* Book Progress Bar */}
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.surfaceHover }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${percentCompleted}%`, backgroundColor: theme.accent }}
              />
            </div>

            {/* Time Comparison Table: How much time you save! */}
            <div className="pt-2">
              <span className="block text-xs font-mono uppercase font-semibold mb-2" style={{ color: theme.textDim }}>
                Estimated Time to Finish Remaining Words ({wordsRemaining.toLocaleString()} w)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <span className="text-[10px] font-mono opacity-60 block">Traditional (250 WPM)</span>
                  <span className="font-mono font-bold text-sm text-slate-300 mt-1 block">
                    {formatHoursMinutes(wordsRemaining / 250)}
                  </span>
                </div>

                <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <span className="text-[10px] font-mono opacity-60 block">Intermediate (400 WPM)</span>
                  <span className="font-mono font-bold text-sm text-slate-300 mt-1 block">
                    {formatHoursMinutes(wordsRemaining / 400)}
                  </span>
                </div>

                <div 
                  className="p-3 rounded-xl border text-center ring-2" 
                  style={{ backgroundColor: `${theme.accent}15`, borderColor: theme.accent }}
                >
                  <span className="text-[10px] font-mono font-bold text-red-400 block">Active Flow ({currentWpm} WPM)</span>
                  <span className="font-mono font-bold text-sm text-white mt-1 block">
                    {formatHoursMinutes(wordsRemaining / currentWpm)}
                  </span>
                </div>

                <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <span className="text-[10px] font-mono opacity-60 block">Speed Sprint (900 WPM)</span>
                  <span className="font-mono font-bold text-sm text-slate-300 mt-1 block">
                    {formatHoursMinutes(wordsRemaining / 900)}
                  </span>
                </div>
              </div>

              {minutesSaved > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>
                    By reading at <strong>{currentWpm} WPM</strong>, you will finish this book <strong>~{formatHoursMinutes(minutesSaved)} faster</strong> than traditional reading!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex justify-end"
          style={{ borderColor: theme.border, backgroundColor: theme.bg }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-semibold rounded-xl text-white transition-transform active:scale-95 shadow-md"
            style={{ backgroundColor: theme.accent }}
          >
            Close Insights
          </button>
        </div>
      </div>
    </div>
  );
};
