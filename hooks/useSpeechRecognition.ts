import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../types';

interface UseSpeechRecognitionProps {
  language: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export const useSpeechRecognition = ({
  language,
  continuous = true,
  interimResults = true,
}: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize SpeechRecognition only when configuration changes, NOT when listening state changes
  useEffect(() => {
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionConstructor) {
      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscriptChunk = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptChunk += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalTranscriptChunk) {
            const cleanedChunk = finalTranscriptChunk.trim(); 
            setTranscript((prev) => {
                const separator = prev.length > 0 ? ' ' : '';
                return prev + separator + cleanedChunk;
            });
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
            setError("Microphone access denied.");
            setIsListening(false);
        } else if (event.error === 'no-speech') {
            // content stayed silent, keep listening if continuous
        } else {
            // Aborted or other errors
            if (event.error !== 'aborted') {
                setError(`Error: ${event.error}`);
            }
            setIsListening(false);
        }
      };

      recognition.onend = () => {
        // We handle auto-restart logic here if needed, but for now we rely on user action 
        // or the specific browser implementation of 'continuous'.
        // To correctly sync UI state:
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setError("Browser not supported. Please use Chrome.");
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, interimResults]); 

  const startListening = useCallback(() => {
    setError(null);
    if (recognitionRef.current) {
      try {
        // Prevent starting if already active to avoid errors
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // Often 'start' is called while already started in some race conditions
        console.error("Failed to start recognition:", e);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      // State update happens in onend usually, but we set it here for immediate UI feedback
      setIsListening(false);
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const setManualTranscript = useCallback((text: string) => {
      setTranscript(text);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    clearTranscript,
    setManualTranscript,
    error,
  };
};