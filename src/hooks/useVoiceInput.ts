"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Web Speech API interface declarations for TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export interface UseVoiceInputOptions {
  onTranscript: (transcript: string) => void;
  defaultLanguage?: "en-IN" | "hi-IN";
}

export function useVoiceInput({ onTranscript, defaultLanguage = "en-IN" }: UseVoiceInputOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isBrave, setIsBrave] = useState(false);
  const [language, setLanguage] = useState<"en-IN" | "hi-IN">(defaultLanguage);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for Brave browser on mount without blocking click handlers
      const nav = navigator as unknown as { brave?: { isBrave?: () => Promise<boolean> } };
      if (typeof nav.brave?.isBrave === "function") {
        nav.brave.isBrave().then((brave) => {
          if (brave) setIsBrave(true);
        }).catch(() => {});
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(Boolean(SpeechRecognition));
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Safe ignore
      }
    }
    setIsListening(false);
  }, []);

  // Must be completely synchronous inside the user click gesture to maintain browser user activation
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.");
      return;
    }

    // Stop any existing session
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Safe ignore
      }
    }

    try {
      const instance = new SpeechRecognition();
      instance.continuous = false;
      instance.interimResults = false;
      instance.lang = language;

      instance.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item && item[0]) {
            transcript += item[0].transcript;
          }
        }
        if (transcript.trim()) {
          onTranscriptRef.current(transcript.trim());
        }
      };

      instance.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      instance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn("[useVoiceInput] Speech error:", event.error);
        if (event.error === "not-allowed") {
          if (isBrave) {
            setError("Microphone blocked in Brave. Open brave://settings/privacy, ensure 'Use Google services for push messaging and speech recognition' is enabled, restart Brave, and allow microphone for this site.");
          } else {
            setError("Microphone permission blocked. Please click the tune icon (🎛️) or lock (🔒) next to the URL to 'Allow' microphone, and verify macOS System Settings > Privacy & Security > Microphone.");
          }
        } else if (event.error === "network") {
          if (isBrave) {
            setError("Speech server unreachable in Brave (Brave blocks Google's speech recognition servers). Please use Google Chrome, Microsoft Edge, or Safari for voice search.");
          } else {
            setError("Network error: Could not connect to speech recognition service. Please check your connection.");
          }
        } else if (event.error !== "no-speech" && event.error !== "aborted") {
          setError(`Microphone error: ${event.error}`);
        }
        setIsListening(false);
      };

      instance.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      // Synchronous start maintains active user activation in Chrome
      instance.start();
      recognitionRef.current = instance;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setIsListening(false);
    }
  }, [isBrave, language]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    language,
    setLanguage,
    toggleListening,
    startListening,
    stopListening,
    error,
    clearError,
  };
}
