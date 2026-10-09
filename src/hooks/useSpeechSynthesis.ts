import { useState, useEffect, useRef, useCallback } from 'react';
import { ParsedWord } from '../types/reader';

export interface UseSpeechSynthesisOptions {
  enabled: boolean;
  wpm: number;
  pitch?: number;
  voiceURI?: string;
  onBoundaryWord?: (charIndex: number) => void;
}

export interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  speakWord: (wordText: string) => void;
  speakPhrase: (text: string, onWordAdvance?: (index: number) => void) => void;
  cancel: () => void;
  rate: number;
}

/**
 * useSpeechSynthesis Hook
 * Uses Web Speech API (window.speechSynthesis) to synthesize audio for the text displayed in the RSVP reticle.
 * Features:
 * - Rate auto-scaled with WPM: Web Speech API rate ranges typically 0.1 to 10 (1.0 = ~160-180 wpm).
 * - Multi-sensory reinforcement: Speaks each word or phrase aligned with the reader.
 * - Voice selection with natural voices prioritized (Google, Samantha, Natural, Daniel, etc.).
 * - Graceful fallback and error safety.
 */
export function useSpeechSynthesis({
  enabled,
  wpm,
  pitch = 1.0,
}: {
  enabled: boolean;
  wpm: number;
  pitch?: number;
}): UseSpeechSynthesisReturn {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Load available system voices
  useEffect(() => {
    if (!isSupported) return;

    const updateVoices = () => {
      const avail = window.speechSynthesis.getVoices();
      if (avail && avail.length > 0) {
        setVoices(avail);
        // Find best default English voice
        setSelectedVoice((prev) => {
          if (prev) return prev;
          const preferred = avail.find(
            (v) =>
              (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Enhanced') || v.name.includes('Samantha'))) ||
              (v.lang.startsWith('en') && v.default)
          ) || avail.find((v) => v.lang.startsWith('en')) || avail[0];
          return preferred || null;
        });
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported]);

  // Compute playback rate from WPM:
  // Standard speech is ~160 wpm at rate 1.0. Clamped to [0.8, 2.5] for cross-browser stability.
  const rate = Math.min(2.5, Math.max(0.8, Number((wpm / 165).toFixed(2))));

  // Cancel any ongoing speech
  const cancel = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } catch {
      // ignore
    }
  }, [isSupported]);

  // Stop speaking when disabled
  useEffect(() => {
    if (!enabled) {
      cancel();
    }
  }, [enabled, cancel]);

  const lastSpeakTimeRef = useRef<number>(0);

  // Single word audio speech with rate throttle to prevent engine freeze
  const speakWord = useCallback(
    (wordText: string) => {
      if (!isSupported || !enabled || !wordText.trim()) return;

      const now = Date.now();
      // Throttle: Ensure at least 120ms between speech utterances to protect audio daemon
      if (now - lastSpeakTimeRef.current < 120) return;
      lastSpeakTimeRef.current = now;

      try {
        window.speechSynthesis.cancel();
        const clean = wordText.replace(/[^\p{L}\p{N}'’]/gu, '');
        if (!clean) return;

        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = rate;
        utterance.pitch = pitch;
        if (selectedVoice) utterance.voice = selectedVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback silently if audio fails
      }
    },
    [isSupported, enabled, rate, pitch, selectedVoice]
  );

  // Speak multi-word phrase or current sentence with boundary word syncing
  const speakPhrase = useCallback(
    (text: string, onWordAdvance?: (index: number) => void) => {
      if (!isSupported || !enabled || !text.trim()) return;

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        if (selectedVoice) utterance.voice = selectedVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        if (onWordAdvance) {
          let wordCounter = 0;
          utterance.onboundary = (e) => {
            if (e.name === 'word') {
              onWordAdvance(wordCounter++);
            }
          };
        }

        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback silently
      }
    },
    [isSupported, enabled, rate, pitch, selectedVoice]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [isSupported]);

  return {
    isSupported,
    isSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice,
    speakWord,
    speakPhrase,
    cancel,
    rate,
  };
}
