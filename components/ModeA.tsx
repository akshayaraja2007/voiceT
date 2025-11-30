import React, { useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Button } from './Button';
import { refineTranscriptStream } from '../services/geminiService';

export const ModeA: React.FC = () => {
  const { 
    isListening, 
    transcript, 
    interimTranscript, 
    startListening, 
    stopListening, 
    clearTranscript,
    setManualTranscript,
    error 
  } = useSpeechRecognition({ language: 'en-US' });

  const bottomRef = useRef<HTMLDivElement>(null);
  const [isRefining, setIsRefining] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, interimTranscript]);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([transcript], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `transcript_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleRefine = async () => {
      if (!transcript) return;
      setIsRefining(true);
      
      try {
        const stream = refineTranscriptStream(transcript);
        
        let accumulated = '';
        // We replace the transcript live as we get corrected parts
        for await (const chunk of stream) {
            accumulated += chunk;
            // Since we are refining the *whole* text, we can just replace the transcript state
            // Note: This replaces the raw speech transcript with the AI version
            setManualTranscript(accumulated); 
        }
      } catch(e) {
          console.error("Refine failed", e);
      } finally {
          setIsRefining(false);
      }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-grow flex flex-col relative overflow-hidden min-h-[400px]">
        <div className="absolute top-0 left-0 right-0 bg-gray-50 border-b border-gray-100 p-3 px-6 flex justify-between items-center z-10">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Live Transcript</h2>
          <div className="flex gap-2">
             <Button variant="ghost" icon="copy" onClick={handleCopy} title="Copy text" className="text-sm py-1 px-2" />
             <Button variant="ghost" icon="download" onClick={handleDownload} title="Download .txt" className="text-sm py-1 px-2" />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto mt-10 mb-4 pr-2 space-y-2">
           {transcript ? (
               <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">{transcript}</p>
           ) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-300">
                   <i className="fas fa-microphone-lines text-4xl mb-3"></i>
                   <p>Tap microphone to start live captioning</p>
               </div>
           )}
           {interimTranscript && (
               <p className="text-gray-400 text-lg italic">{interimTranscript}</p>
           )}
           <div ref={bottomRef} />
        </div>
        
        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
            </div>
        )}

        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
           <div className="flex items-center gap-2 w-full sm:w-auto">
             {isListening ? (
                <Button variant="danger" icon="stop" onClick={stopListening} fullWidth className="sm:w-auto animate-pulse">
                    Stop Listening
                </Button>
             ) : (
                <Button variant="primary" icon="microphone" onClick={startListening} fullWidth className="sm:w-auto">
                    Start Listening
                </Button>
             )}
             <Button variant="secondary" onClick={clearTranscript} disabled={!transcript} className="hidden sm:inline-flex">
                 Clear
             </Button>
           </div>

           <Button 
                variant="secondary" 
                icon="wand-magic-sparkles" 
                onClick={handleRefine} 
                disabled={!transcript || isListening || isRefining}
                className="w-full sm:w-auto"
           >
               {isRefining ? 'Refining...' : 'AI Format'}
           </Button>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 text-center">
         Powered by Web Speech API & Gemini
      </div>
    </div>
  );
};