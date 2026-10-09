import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Zap, 
  Gauge, 
  HelpCircle 
} from 'lucide-react';
import { DocumentSource, ThemeColors, ComprehensionQuestion, ComprehensionAttempt } from '../types/reader';
import { 
  generateComprehensionQuiz, 
  calculateTrueWpm, 
  getComprehensionFeedback 
} from '../utils/comprehension';
import { recordComprehensionAttempt } from '../utils/storage';

interface ComprehensionQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDoc: DocumentSource;
  currentWordIndex: number;
  currentWpm: number;
  theme: ThemeColors;
  onAdjustWpm?: (targetWpm: number) => void;
  onRefreshInsights?: () => void;
}

export const ComprehensionQuizModal: React.FC<ComprehensionQuizModalProps> = ({
  isOpen,
  onClose,
  activeDoc,
  currentWordIndex,
  currentWpm,
  theme,
  onAdjustWpm,
  onRefreshInsights,
}) => {
  const [questions, setQuestions] = useState<ComprehensionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Initialize or reset quiz whenever opened
  const initQuiz = useCallback(() => {
    const generated = generateComprehensionQuiz(activeDoc, currentWordIndex);
    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
  }, [activeDoc, currentWordIndex]);

  useEffect(() => {
    if (isOpen) {
      initQuiz();
    }
  }, [isOpen, initQuiz]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleSelectOption = (optionIndex: number) => {
    if (isAnswered || isCompleted || !currentQ) return;

    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === currentQ.correctIndex;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(newScore);
    }

    // If it's the last question, finalize after user proceeds
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Completed quiz
      setIsCompleted(true);
      const trueWpm = calculateTrueWpm(currentWpm, score, totalQuestions);
      const attempt: ComprehensionAttempt = {
        id: `quiz-${Date.now()}`,
        timestamp: Date.now(),
        documentTitle: activeDoc.title,
        rawWpm: currentWpm,
        trueWpm,
        score,
        totalQuestions,
        percentage: Math.round((score / totalQuestions) * 100),
      };
      recordComprehensionAttempt(attempt);
      if (onRefreshInsights) onRefreshInsights();
    }
  };

  const feedback = getComprehensionFeedback(score, totalQuestions, currentWpm);
  const trueWpm = calculateTrueWpm(currentWpm, score, totalQuestions);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
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
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-xl"
              style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
            >
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Comprehension Retention Check</h2>
              <div className="flex items-center gap-2 text-xs" style={{ color: theme.textDim }}>
                <span className="truncate max-w-[200px]">{activeDoc.title}</span>
                <span>•</span>
                <span className="font-mono font-semibold" style={{ color: theme.accent }}>{currentWpm} WPM</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: theme.textDim }}
            aria-label="Close retention quiz"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {!isCompleted && currentQ ? (
            <>
              {/* Progress and Question Meta */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2" style={{ color: theme.textDim }}>
                  <span className="font-medium tracking-wide uppercase">
                    Question {currentIndex + 1} of {totalQuestions}
                  </span>
                  <span className="capitalize px-2 py-0.5 rounded text-[11px] font-mono border" style={{ borderColor: theme.border }}>
                    {currentQ.type} Recall
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
                      backgroundColor: theme.accent,
                    }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div 
                className="p-4 rounded-xl border font-medium text-base leading-relaxed whitespace-pre-line"
                style={{ 
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                }}
              >
                {currentQ.question}
              </div>

              {/* 4 Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let borderStyle = theme.border;
                  let bgStyle = theme.surfaceHover;
                  let textStyle = theme.textBright;

                  if (isAnswered) {
                    if (isCorrect) {
                      borderStyle = '#10b981'; // emerald
                      bgStyle = 'rgba(16, 185, 129, 0.15)';
                      textStyle = '#34d399';
                    } else if (isSelected && !isCorrect) {
                      borderStyle = '#ef4444'; // rose
                      bgStyle = 'rgba(239, 68, 68, 0.15)';
                      textStyle = '#f87171';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className="w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group disabled:cursor-default"
                      style={{
                        backgroundColor: bgStyle,
                        borderColor: borderStyle,
                        color: textStyle,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center border"
                          style={{ borderColor: theme.border, color: theme.textDim }}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-medium text-sm">{option}</span>
                      </div>

                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Context Explanation */}
              {isAnswered && (
                <div 
                  className="p-3.5 rounded-xl border text-xs leading-relaxed animate-fade-in"
                  style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}30` }}
                >
                  <span className="font-semibold" style={{ color: theme.accent }}>Verification: </span>
                  <span style={{ color: theme.textDim }}>{currentQ.explanation}</span>
                </div>
              )}
            </>
          ) : (
            /* Results Screen */
            <div className="space-y-6 text-center py-2 animate-fade-in">
              <div className="flex justify-center">
                <div 
                  className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-2 shadow-lg"
                  style={{ 
                    backgroundColor: `${theme.accent}15`, 
                    borderColor: theme.accent, 
                    color: theme.accent 
                  }}
                >
                  <span className="text-2xl font-black">{feedback.grade}</span>
                  <span className="text-[10px] uppercase font-mono tracking-widest">{score}/{totalQuestions}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight">{feedback.title}</h3>
                <p className="text-xs mt-1.5 max-w-md mx-auto" style={{ color: theme.textDim }}>
                  {feedback.message}
                </p>
              </div>

              {/* Velocity & Retention Breakdown */}
              <div 
                className="grid grid-cols-2 gap-3 p-4 rounded-xl border text-left"
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
              >
                <div>
                  <div className="text-[11px] font-mono tracking-wider uppercase" style={{ color: theme.textDim }}>
                    Raw Speed
                  </div>
                  <div className="text-2xl font-black mt-0.5 font-mono">
                    {currentWpm} <span className="text-xs font-normal" style={{ color: theme.textDim }}>WPM</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-mono tracking-wider uppercase" style={{ color: theme.accent }}>
                    True Effective Speed
                  </div>
                  <div className="text-2xl font-black mt-0.5 font-mono" style={{ color: theme.accent }}>
                    {trueWpm} <span className="text-xs font-normal" style={{ color: theme.textDim }}>True WPM</span>
                  </div>
                </div>

                <div className="col-span-2 pt-2 border-t text-[11px] flex items-center justify-between" style={{ borderColor: theme.border, color: theme.textDim }}>
                  <span>Formula: Raw WPM × Retention Ratio</span>
                  <span className="font-mono">{Math.round((score / totalQuestions) * 100)}% Retention</span>
                </div>
              </div>

              {/* Coaching Guidance */}
              {onAdjustWpm && feedback.recommendedWpm !== currentWpm && (
                <button
                  onClick={() => {
                    onAdjustWpm(feedback.recommendedWpm);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ 
                    backgroundColor: `${theme.accent}20`, 
                    borderColor: theme.accent, 
                    color: theme.accent 
                  }}
                >
                  <Gauge className="w-4 h-4" />
                  Apply Optimal Pacing ({feedback.recommendedWpm} WPM)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-t"
          style={{ backgroundColor: theme.bg, borderColor: theme.border }}
        >
          {!isCompleted ? (
            <>
              <button
                onClick={initQuiz}
                className="flex items-center gap-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
                style={{ color: theme.textDim }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>

              <button
                onClick={handleNextQuestion}
                disabled={!isAnswered}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{
                  backgroundColor: theme.accent,
                  color: '#ffffff',
                }}
              >
                <span>{currentIndex + 1 === totalQuestions ? 'Complete Quiz' : 'Next Question'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={initQuiz}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border hover:opacity-80 transition-all"
                style={{ borderColor: theme.border, color: theme.textBright }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                New Questions
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl text-xs font-semibold shadow-sm hover:opacity-90 transition-all"
                style={{
                  backgroundColor: theme.accent,
                  color: '#ffffff',
                }}
              >
                Resume Reading
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
