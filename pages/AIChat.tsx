
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GroundingSource } from '../types';

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string, sources?: GroundingSource[]}[]>([
    { role: 'model', content: 'Cześć! Jestem DriveSoft AI 1.0 (DSAI1.0). Dzięki technologii Google Search Grounding mogę teraz przeszukiwać sieć w czasie rzeczywistym, aby dostarczyć Ci najświeższe informacje o kawie, technologii czy systemie DriveSoft. O co chcesz zapytać?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Używamy modelu gemini-3-flash-preview z narzędziem googleSearch zgodnie z wytycznymi
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: 'Jesteś DriveSoft AI 1.0 (DSAI1.0), zaawansowanym asystentem DriveSoft. Korzystasz z Google Search do dostarczania aktualnych informacji. Zawsze bądź pomocny i precyzyjny. Twoim twórcą jest Karol Kopeć.'
        }
      });
      
      const responseText = response.text || 'Błąd generowania odpowiedzi.';
      
      // Wyciąganie URL-i z groundingMetadata (wymagane przez instrukcję)
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: GroundingSource[] = groundingChunks
        .filter((chunk: any) => chunk.web && chunk.web.uri)
        .map((chunk: any) => ({
          title: chunk.web.title || 'Źródło zewnętrzne',
          uri: chunk.web.uri
        }));

      setMessages(prev => [...prev, { 
        role: 'model', 
        content: responseText,
        sources: sources.length > 0 ? sources : undefined
      }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', content: 'Wystąpił błąd podczas przeszukiwania sieci przez DLS-Web-Engine.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[80vh] flex flex-col glass rounded-[4rem] shadow-2xl overflow-hidden border border-white/40">
      <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-800 p-8 text-white flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-md border border-white/20">
            <i className="fas fa-globe-americas text-2xl animate-pulse"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter">DSAI 1.0 WebGround</h2>
            <p className="text-[10px] font-black uppercase text-blue-200 tracking-[0.2em]">Live Research Integration</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-[10px] font-black text-green-400 uppercase tracking-widest">
          Status: Online
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-8">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[80%] p-7 rounded-[2.5rem] font-medium leading-relaxed shadow-sm ${
              m.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
            }`}>
              {m.content}
            </div>
            
            {m.sources && m.sources.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 max-w-[80%]">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block w-full mb-1 ml-2">Źródła DriveSoft:</span>
                {m.sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-slate-100 hover:bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-200 transition flex items-center space-x-1"
                  >
                    <i className="fas fa-link text-[8px]"></i>
                    <span className="truncate max-w-[150px]">{source.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex flex-col items-start space-y-2">
            <div className="flex space-x-2 p-4 bg-slate-50 rounded-2xl">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
            </div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">DSAI przeszukuje Google...</span>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      <div className="p-8 bg-slate-50/50 border-t border-white">
        <div className="flex space-x-4 bg-white p-3 rounded-[2rem] border border-slate-200 shadow-xl focus-within:border-indigo-400 transition-all">
          <input 
            type="text" 
            placeholder="Zapytaj o kawę w Austin lub nowości technologiczne..."
            className="flex-1 px-6 py-2 bg-transparent outline-none font-bold text-slate-700 text-lg"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition shadow-xl">
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
