import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Sparkles, 
  Clock, 
  Play, 
  Pause, 
  SkipForward, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  ShieldCheck,
  Flame
} from 'lucide-react';
import { ThemeColors } from '../types/reader';

interface EyeRestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResumeReading: () => void;
  streakCount: number;
  breakDurationMinutes?: number;
  theme: ThemeColors;
}

export const EyeRestModal: React.FC<EyeRestModalProps> = ({
  isOpen,
  onClose,
  onResumeReading,
  streakCount,
  breakDurationMinutes = 5,
  theme,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(breakDurationMinutes * 60);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(true);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  // Reset timer on open
  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(breakDurationMinutes * 60);
      setIsRestTimerRunning(true);
    }
  }, [isOpen, breakDurationMinutes]);

  // Rest countdown timer
  useEffect(() => {
    if (!isOpen || !isRestTimerRunning || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Play subtle notification chime
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
          } catch {
            // Non-fatal if audio context is blocked
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isRestTimerRunning, secondsLeft]);

  // Breathing relaxation loop (4s Inhale, 4s Hold, 4s Exhale)
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const totalSeconds = breakDurationMinutes * 60;
  const progressRatio = (totalSeconds - secondsLeft) / totalSeconds;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-3xl border shadow-2xl flex flex-col overflow-hidden text-center p-6 sm:p-8"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.textBright,
        }}
      >
        {/* Top Pomodoro Badge */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>25-Min Focus Milestone Completed</span>
            <span>· Streak: #{streakCount}</span>
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">
          Time for a 5-Minute Eye-Rest Break
        </h2>
        <p className="text-xs max-w-sm mx-auto mb-6" style={{ color: theme.textDim }}>
          Speed reading at high velocity uses intense foveal focus. Relaxing your ciliary muscles prevents eye strain and resets comprehension.
        </p>

        {/* Circular Countdown Timer with Guided Breathing Orb */}
        <div className="relative w-44 h-44 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="54"
              stroke="#252d3d"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="88"
              cy="88"
              r="54"
              stroke={theme.accent}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Animated Guided Breathing Orb in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div
              className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
                breathPhase === 'Inhale'
                  ? 'scale-110 bg-emerald-500/20 shadow-emerald-500/20'
                  : breathPhase === 'Hold'
                  ? 'scale-105 bg-amber-500/20 shadow-amber-500/20'
                  : 'scale-90 bg-sky-500/15 shadow-sky-500/20'
              } shadow-2xl`}
            >
              <span className="text-2xl font-bold font-mono tracking-tight" style={{ color: theme.textBright }}>
                {timeFormatted}
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-emerald-400 mt-0.5">
                {secondsLeft > 0 ? breathPhase : 'Ready!'}
              </span>
            </div>
          </div>
        </div>

        {/* 20-20-20 Rule Guidelines Card */}
        <div
          className="p-4 rounded-2xl border text-left text-xs space-y-2 mb-6"
          style={{ backgroundColor: theme.bg, borderColor: theme.border }}
        >
          <div className="flex items-center gap-2 font-semibold text-xs" style={{ color: theme.accent }}>
            <ShieldCheck className="w-4 h-4" />
            <span>The 20-20-20 Speed Reading Protocol</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]" style={{ color: theme.textDim }}>
            <div className="p-2 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <strong className="block text-slate-200 mb-0.5">1. Look Away</strong>
              Focus on a distant object at least 20 feet away to relax lens muscles.
            </div>
            <div className="p-2 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <strong className="block text-slate-200 mb-0.5">2. Soft Blinks</strong>
              Blink gently 10 times to rehydrate the cornea and tear film.
            </div>
            <div className="p-2 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <strong className="block text-slate-200 mb-0.5">3. Breathe</strong>
              Follow the center orb: Inhale 4s, Hold 4s, Exhale 4s to reset oxygen flow.
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setIsRestTimerRunning((prev) => !prev)}
            className="p-2.5 px-4 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
            style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.textDim }}
          >
            {isRestTimerRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Timer</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Timer</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onClose();
              onResumeReading();
            }}
            className="flex-1 py-3 px-6 rounded-xl text-xs font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            style={{ backgroundColor: theme.accent }}
          >
            <span>Resume Reading at Flow Speed</span>
            <SkipForward className="w-4 h-4 fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
