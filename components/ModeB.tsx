import React, { useState } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Button } from './Button';
import { translateTextStream } from '../services/geminiService';

export const ModeB: React.FC = () => {
  // Use Tamil (India) to capture Tamil + English phonetic mix
  const { 
    isListening, 
    transcript, 
    interimTranscript, 
    startListening, 
    stopListening, 
    clearTranscript,
    error 
  } = useSpeechRecognition({ language: 'ta-IN' });

  const [translation, setTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!transcript) return;
    setIsTranslating(true);
    setTranslation(''); // Clear previous translation to show streaming start

    try {
      const stream = translateTextStream(transcript, 'Tamil/English mix', 'English');
      
      let accumulatedText = '';
      for await (const chunk of stream) {
        accumulatedText += chunk;
        setTranslation(accumulatedText);
      }
    } catch (e) {
      console.error("Streaming failed", e);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translation);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      {/* Input Section */}
      <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 p-4">
         <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
             <h3 className="font-semibold text-gray-700 flex items-center">
                 <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                 Input (Tamil/English)
             </h3>
             {isListening && <span className="text-xs text-red-500 font-bold animate-pulse">RECORDING</span>}
         </div>
         
         <div className="flex-grow bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto min-h-[200px] border border-gray-100">
             {transcript ? (
                 <p className="text-gray-800 whitespace-pre-wrap text-lg">{transcript}</p>
             ) : (
                 <p className="text-gray-400 italic">Spoken text will appear here...</p>
             )}
             {interimTranscript && <span className="text-gray-400">{interimTranscript}</span>}
         </div>

         {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

         <div className="flex gap-2 mt-auto">
            {isListening ? (
                <Button variant="danger" icon="stop" onClick={stopListening} fullWidth>Stop</Button>
            ) : (
                <Button variant="primary" icon="microphone" onClick={startListening} fullWidth>Speak</Button>
            )}
            <Button variant="secondary" icon="trash" onClick={() => { clearTranscript(); setTranslation(''); }} disabled={isListening} />
         </div>
      </div>

      {/* Output Section */}
      <div className="flex flex-col h-full bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-4">
         <div className="flex justify-between items-center mb-4 border-b border-blue-200 pb-3">
             <h3 className="font-semibold text-blue-800 flex items-center">
                 <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                 Translation (English)
             </h3>
             <Button variant="ghost" icon="copy" onClick={handleCopy} className="text-blue-600 hover:bg-blue-100 py-1 px-2" />
         </div>

         <div className="flex-grow bg-white rounded-lg p-4 mb-4 overflow-y-auto min-h-[200px] shadow-inner">
             {/* If translating but no text yet, show spinner. If text exists (even partial), show text. */}
             {isTranslating && !translation ? (
                 <div className="flex items-center justify-center h-full text-blue-400">
                     <i className="fas fa-circle-notch fa-spin text-2xl mr-2"></i>
                     Starting...
                 </div>
             ) : translation ? (
                 <p className="text-blue-900 text-lg leading-relaxed">{translation}</p>
             ) : (
                 <p className="text-blue-300 italic">Translation will appear here...</p>
             )}
             {/* Show small spinner next to text if still streaming */}
             {isTranslating && translation && (
                <span className="inline-block ml-2 w-2 h-2 bg-blue-400 rounded-full animate-ping"></span>
             )}
         </div>

         <div className="mt-auto">
            <Button 
                variant="primary" 
                icon="language" 
                fullWidth 
                onClick={handleTranslate}
                disabled={!transcript || isTranslating}
                className="bg-blue-600 hover:bg-blue-700"
            >
                Translate to English
            </Button>
         </div>
      </div>
    </div>
  );
};