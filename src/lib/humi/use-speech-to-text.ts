import { useCallback, useEffect, useRef, useState } from "react";

interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResult {
  isFinal: boolean;
  0: RecognitionAlternative;
}
interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Microphone access was blocked. Allow it in your browser, or type instead.",
  "service-not-allowed": "Voice input isn't available on this device. Please type instead.",
  "no-speech": "We didn't hear anything — tap the mic and try again.",
  "audio-capture": "No microphone was found. Please type instead.",
  network: "Voice input needs an internet connection. Please type instead.",
};

// Dictation via the browser's built-in speech recognition. Final phrases are
// handed to onFinalText as they're recognised so the caller can append them
// to whatever the visitor has already typed.
export function useSpeechToText(onFinalText: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");
  const recognitionRef = useRef<Recognition | null>(null);
  const onFinalRef = useRef(onFinalText);
  onFinalRef.current = onFinalText;

  useEffect(() => {
    setSupported(getCtor() !== null);
    return () => recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    setError("");
    const recognition = new Ctor();
    recognition.lang = "en-PH";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i]!;
        const text = result[0].transcript;
        if (result.isFinal) onFinalRef.current(text.trim());
        else interimText += text;
      }
      setInterim(interimText);
    };
    recognition.onerror = (e) => {
      setError(ERROR_MESSAGES[e.error] ?? "Voice input stopped unexpectedly. Please try again.");
    };
    recognition.onend = () => {
      setListening(false);
      setInterim("");
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => recognitionRef.current?.stop(), []);

  return { supported, listening, interim, error, start, stop };
}
