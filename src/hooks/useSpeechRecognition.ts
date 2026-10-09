import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechRecognitionState } from '../types/reader';

// Type definitions for Web Speech API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface SpeechRecognitionHookProps {
  onAdjustWpm: (delta: number) => void;
  onSetWpm: (wpm: number) => void;
  onTogglePlay: (forcePlay?: boolean) => void;
  onPause: () => void;
  onResume: () => void;
  onRewind: () => void;
  currentWpm: number;
}

export function useSpeechRecognition({
  onAdjustWpm,
  onSetWpm,
  onTogglePlay,
  onPause,
  onResume,
  onRewind,
  currentWpm,
}: SpeechRecognitionHookProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const [mode, setMode] = useState<'commands' | 'cadence'>('commands');
  const [feedbackToast, setFeedbackToast] = useState<{
    message: string;
    action: string;
    timestamp: number;
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const spokenWordsLog = useRef<{ text: string; time: number }[]>([]);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    setIsSupported(Boolean(SpeechRecognition));

    return () => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const showToast = useCallback((message: string, action: string) => {
    setFeedbackToast({ message, action, timestamp: Date.now() });
    setTimeout(() => {
      setFeedbackToast((prev) => (prev?.timestamp && Date.now() - prev.timestamp >= 2800 ? null : prev));
    }, 3000);
  }, []);

  // Process speech transcript
  const processTranscript = useCallback((transcript: string) => {
    const clean = transcript.toLowerCase().trim();
    if (!clean) return;

    // --- MODE 1: SPOKEN COMMAND FEEDBACK ---
    if (mode === 'commands') {
      // Faster commands
      if (clean.includes('faster') || clean.includes('speed up') || clean.includes('hurry') || clean.includes('quick')) {
        onAdjustWpm(50);
        showToast(`Heard: "${transcript}"`, 'Speed increased (+50 WPM)');
        return;
      }

      // Slower commands
      if (clean.includes('slower') || clean.includes('slow down') || clean.includes('too fast') || clean.includes('slow')) {
        onAdjustWpm(-50);
        showToast(`Heard: "${transcript}"`, 'Speed decreased (-50 WPM)');
        return;
      }

      // Pause commands
      if (clean.includes('pause') || clean.includes('stop') || clean.includes('wait') || clean.includes('hold on') || clean.includes('freeze')) {
        onPause();
        showToast(`Heard: "${transcript}"`, 'Paused reading flow');
        return;
      }

      // Resume / Play commands
      if (clean.includes('play') || clean.includes('resume') || clean.includes('start') || clean.includes('continue') || clean.includes('go')) {
        onResume();
        showToast(`Heard: "${transcript}"`, 'Resumed reading');
        return;
      }

      // Rewind / Repeat commands
      if (clean.includes('repeat') || clean.includes('rewind') || clean.includes('go back') || clean.includes('again')) {
        onRewind();
        showToast(`Heard: "${transcript}"`, 'Rewound 1 sentence');
        return;
      }

      // Explicit numeric speed setting (e.g., "set speed to 600", "six hundred", "450 wpm")
      const numberMatches = clean.match(/\b(\d{3,4})\b/);
      if (numberMatches) {
        const targetNum = parseInt(numberMatches[1], 10);
        if (targetNum >= 100 && targetNum <= 1200) {
          onSetWpm(targetNum);
          showToast(`Heard: "${transcript}"`, `Speed set to ${targetNum} WPM`);
          return;
        }
      }

      // Word-based numbers
      if (clean.includes('three hundred') || clean.includes('300')) {
        onSetWpm(300);
        showToast(`Heard: "${transcript}"`, 'Speed set to 300 WPM');
        return;
      }
      if (clean.includes('four hundred') || clean.includes('450')) {
        onSetWpm(450);
        showToast(`Heard: "${transcript}"`, 'Speed set to 450 WPM');
        return;
      }
      if (clean.includes('six hundred') || clean.includes('600')) {
        onSetWpm(600);
        showToast(`Heard: "${transcript}"`, 'Speed set to 600 WPM');
        return;
      }
      if (clean.includes('nine hundred') || clean.includes('900')) {
        onSetWpm(900);
        showToast(`Heard: "${transcript}"`, 'Speed set to 900 WPM');
        return;
      }
    }

    // --- MODE 2: READ-ALOUD CADENCE MATCHING ---
    if (mode === 'cadence') {
      const now = Date.now();
      const wordsInChunk = clean.split(/\s+/).filter(Boolean);
      
      // Log spoken words with timestamp
      wordsInChunk.forEach((w) => {
        spokenWordsLog.current.push({ text: w, time: now });
      });

      // Keep only words spoken in the last 6 seconds
      spokenWordsLog.current = spokenWordsLog.current.filter((item) => now - item.time <= 6000);

      if (spokenWordsLog.current.length >= 4) {
        const oldestTime = spokenWordsLog.current[0].time;
        const elapsedSec = Math.max(1, (now - oldestTime) / 1000);
        const calculatedWpm = Math.round((spokenWordsLog.current.length / elapsedSec) * 60);

        // Bound between 120 and 700 WPM
        const boundedWpm = Math.min(800, Math.max(120, calculatedWpm));
        
        // Smooth adjustment toward user cadence
        const smoothedWpm = Math.round(currentWpm * 0.7 + boundedWpm * 0.3);
        onSetWpm(smoothedWpm);
        showToast(`Cadence: ~${calculatedWpm} WPM`, `Synced RSVP to ${smoothedWpm} WPM`);
      }

      // Reset hesitation timeout
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        // If user stops speaking while reading aloud for 2.5s, gently pause
        onPause();
        showToast('Speech pause detected', 'Paused flow for reader catch-up');
      }, 2500);
    }
  }, [mode, currentWpm, onAdjustWpm, onSetWpm, onPause, onResume, onRewind, showToast]);

  // Start Speech Recognition
  const startListening = useCallback(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Microphone not supported in this browser', 'Unsupported API');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        showToast('Microphone Active', mode === 'commands' ? 'Say "faster", "slower", "pause", "600"' : 'Reading Aloud Cadence Syncing');
      };

      recognition.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0]?.transcript;
        if (transcript) {
          processTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          isListeningRef.current = false;
          setIsListening(false);
          showToast('Microphone access denied', 'Check browser permissions');
        }
      };

      recognition.onend = () => {
        // If user didn't explicitly stop it, restart to keep listening
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            isListeningRef.current = false;
            setIsListening(false);
          }
        } else {
          isListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [mode, processTranscript, showToast]);

  // Stop Speech Recognition
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    showToast('Microphone Disconnected', 'Voice control disabled');
  }, [showToast]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    mode,
    setMode,
    toggleListening,
    startListening,
    stopListening,
    feedbackToast,
  };
}
