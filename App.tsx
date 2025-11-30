import React, { useState } from 'react';
import { AppMode } from './types';
import { ModeA } from './components/ModeA';
import { ModeB } from './components/ModeB';

function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.LiveCaption);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <i className="fas fa-wave-square"></i>
             </div>
             <h1 className="text-xl font-bold tracking-tight text-gray-900">VoiceTranslator <span className="text-blue-600">Pro</span></h1>
          </div>
          
          <div className="hidden md:flex text-sm text-gray-500 items-center gap-4">
             <span><i className="fas fa-globe-asia mr-1"></i> Tamil & English Support</span>
             <span className="h-4 w-px bg-gray-300"></span>
             <span><i className="fas fa-cloud-bolt mr-1"></i> Gemini AI</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Mode Switcher */}
        <div className="bg-white p-1 rounded-xl shadow-sm inline-flex mb-6 w-full sm:w-auto self-center sm:self-start border border-gray-200">
           <button 
             onClick={() => setMode(AppMode.LiveCaption)}
             className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${mode === AppMode.LiveCaption ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
           >
             <i className="fas fa-closed-captioning mr-2"></i>
             Live Caption (Eng)
           </button>
           <button 
             onClick={() => setMode(AppMode.Translator)}
             className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${mode === AppMode.Translator ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
           >
             <i className="fas fa-language mr-2"></i>
             Translator (Tam/Eng)
           </button>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-grow relative">
           {mode === AppMode.LiveCaption ? <ModeA /> : <ModeB />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
         <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center text-xs text-gray-400">
            <p>&copy; 2024 VoiceTranslator Pro</p>
            <div className="flex gap-4">
                <span>Privacy</span>
                <span>Terms</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

export default App;
