import React, { useState, useRef, useEffect } from 'react';
import { useBrain } from '../context/GlobalDataContext';
import { generateChatResponse, hasGeminiKey } from '../services/gemini';
import { Send, Zap, User } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const SidebarChatbot: React.FC = () => {
  const { authState, emitSignal } = useBrain();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'AI Strategy Proxy connected. Ready.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const canUseGemini = hasGeminiKey();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !canUseGemini) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    // [BRAIN: INWARD LOOP] Emit signal so Brain learns from Journal interactions
    emitSignal('AI_JOURNAL', 'USER_MESSAGE', { text: userText }).catch((e: any) => console.warn(e));

    const systemPrompt = `
      IDENTITY: You are the ViewTube Creator OS embedded AI Strategy Chatbot.
      You exist in the left sidebar of the user's dashboard.
      Your job is to answer ANY questions about the app's settings, how tools work, and channel strategy.
      
      CONTEXT:
      - App name: ViewTube
      - Channel: ${authState.channelName || 'Not connected'}
      - Subs: ${authState.subscriberCount || 0}
      - Views: ${authState.totalViews || 0}
      
      LAYOUT KNOWLEDGE:
      - Tools in sidebar: Dashboard, Studio, Calendar, Shorts, Performance, Settings.
      - Settings holds API keys (Gemini, ElevenLabs, etc).
      - Studio has tools for Upload Generator, Script Analysis, Video Concept generation.
      - Performance has the metrics and data matrix.
      - Calendar manages tasks.
      - Reference Studio is a secret UI component library.
      
      Keep answers concise, actionable, and formatted nicely. Be confident and neo-brutalist in tone.
    `;

    try {
      // Map history to the format google gen ai expects: { role, parts: [{ text }] }
      const historyPayload = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // In gemini API, role names are 'user' and 'model'
      const responseText = await generateChatResponse(historyPayload, userText, false, systemPrompt);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', text: `ERROR: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`flex flex-col bg-white border-[4px] border-black rounded-[24px] shadow-[6px_6px_0px_0px_black] overflow-hidden group transition-all duration-300 ${messages.length > 1 ? 'h-[400px]' : 'h-auto'}`}>
      {/* Header text if collapsed */}
      {messages.length <= 1 && (
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
           <span className="font-black uppercase text-[11px] tracking-widest text-black">AI-SSISTANT</span>
           {!canUseGemini && <span className="text-[9px] font-bold text-red-500 uppercase">Key Required</span>}
        </div>
      )}
      {messages.length <= 1 && (
        <div className="px-4 pb-1">
           <h3 className="font-[1000] text-xl uppercase tracking-tighter">How can I help?</h3>
        </div>
      )}

      {/* Chat header if expanded */}
      {messages.length > 1 && (
        <div className="bg-[#ccff00] px-4 py-3 border-b-[4px] border-black flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-black p-1.5 rounded-lg">
              <Zap size={16} className="text-[#ccff00]" />
            </div>
            <span className="font-black uppercase text-[10px] tracking-widest text-black">AI-SSISTANT</span>
          </div>
          <button 
             onClick={() => setMessages([{ role: 'model', text: 'AI Strategy Proxy connected. Ready.' }])}
             className="text-xs font-black uppercase tracking-widest text-black/40 hover:text-black">
             Clear
          </button>
        </div>
      )}

      {/* Messages area (only visible if expanded) */}
      {messages.length > 1 && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50 flex flex-col justify-start">
          {!canUseGemini && (
            <div className="text-[10px] font-bold text-red-500 uppercase text-center p-2 border-2 border-red-500 rounded-lg">
              API KEY REQUIRED IN SETTINGS
            </div>
          )}
          {messages.slice(1).map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 shrink-0 border-[2px] border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_black] ${
                msg.role === 'model' ? 'bg-[#FF3399]' : 'bg-[#00CCFF]'
              }`}>
                {msg.role === 'model' ? <Zap size={14} className="text-white" /> : <User size={14} className="text-black" />}
              </div>
              
              {/* Bubble */}
              <div className={`flex-1 border-[3px] border-black rounded-2xl p-3 relative text-[11px] leading-relaxed shadow-[2px_2px_0px_0px_black] ${
                msg.role === 'model' 
                  ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_0px_#ccff00]' 
                  : 'bg-white text-black font-bold shadow-[2px_2px_0px_0px_black]'
              }`}>
                {msg.text}
                {/* Tail pointing toward avatar */}
                {msg.role === 'model' && (
                  <div className="absolute -left-1.5 top-3 w-3 h-3 bg-black border-l-[3px] border-b-[3px] border-black rotate-45" />
                )}
                {msg.role === 'user' && (
                  <div className="absolute -right-1.5 top-3 w-3 h-3 bg-white border-r-[3px] border-t-[3px] border-black rotate-45" />
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
               <div className="w-8 h-8 shrink-0 border-[2px] border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_black] bg-[#FF3399]">
                <Zap size={14} className="text-white animate-pulse" />
              </div>
               <div className="bg-black text-[#ccff00] border-[3px] border-black rounded-2xl p-3 relative text-[11px] font-black uppercase tracking-widest animate-pulse shadow-[2px_2px_0px_0px_#ccff00]">
                Processing...
                <div className="absolute -left-1.5 top-3 w-3 h-3 bg-black border-l-[3px] border-b-[3px] border-black rotate-45" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input area */}
      <div className={`bg-white p-3 flex gap-2 ${messages.length > 1 ? 'border-t-[4px] border-black' : ''}`}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI-SSISTANT..."
          disabled={!canUseGemini}
          className="flex-1 bg-gray-100 border-[2px] border-black rounded-xl p-2 text-[11px] font-bold outline-none focus:bg-[#CCFF00]/10 shadow-inner"
        />
        <button 
          onClick={handleSend}
          disabled={!canUseGemini || !input.trim() || isTyping}
          className="bg-black text-white p-2 rounded-xl border-[2px] border-black shadow-[2px_2px_0px_0px_black] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none active:bg-[#FF3399] disabled:opacity-50 transition-all shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};
