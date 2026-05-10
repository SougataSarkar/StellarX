import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MessageSquare, Send, X, Bot, User, Sparkles, Loader2, Minimize2, Maximize2, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Safe environment variable access for Vite
const getApiKey = () => {
  try {
    return (import.meta.env?.VITE_GEMINI_API_KEY) || (process.env?.GEMINI_API_KEY) || '';
  } catch {
    return '';
  }
};

const GEN_AI_API_KEY = getApiKey();
const MODEL_ID = 'gemini-3-flash-preview';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function GeminiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Greetings, explorer. I am Nova, your StellarX AI Guide. Ask me anything about the planets, stars, or the deep cosmos!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatInstance = useRef<any>(null);
  const genAI = useRef<GoogleGenerativeAI | null>(null);

  // Initialize SDK safely
  useEffect(() => {
    if (GEN_AI_API_KEY) {
      try {
        genAI.current = new GoogleGenerativeAI(GEN_AI_API_KEY);
      } catch (err) {
        console.error("Failed to initialize Gemini SDK:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  // Initialize chat session safely
  const initChat = () => {
    if (!genAI.current) return null;
    
    try {
      const model = genAI.current.getGenerativeModel({ 
        model: MODEL_ID,
        systemInstruction: "You are Nova, a professional space explorer and astronomy expert guide for the StellarX platform. You are helpful, enthusiastic about space, and keep your answers concise, fascinating, and educational. Use space metaphors where appropriate. Format your output with markdown when helpful.",
      });

      // API history must start with 'user' role. Filter out initial 'model' greeting for the API.
      const apiHistory = messages
        .filter((m, i) => !(i === 0 && m.role === 'model'))
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }],
        }));

      // Ensure history starts with user or is empty
      const validHistory = apiHistory.length > 0 && apiHistory[0].role === 'user' ? apiHistory : [];

      chatInstance.current = model.startChat({
        history: validHistory,
      });
      return chatInstance.current;
    } catch (err) {
      console.error("Error initializing chat session:", err);
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      if (!GEN_AI_API_KEY) {
        throw new Error('API key missing. Please check your .env file.');
      }

      const chat = chatInstance.current || initChat();
      if (!chat) throw new Error('Could not establish a cosmic connection.');

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const botResponse = response.text();
      
      setMessages(prev => [...prev, { role: 'model', content: botResponse }]);
    } catch (err: any) {
      console.error("Gemini Error:", err);
      const msg = err?.message || "Signal lost in deep space.";
      setError(msg);
      
      let friendlyMsg = "The cosmic signals are weak. Please check your connection.";
      if (msg.includes('API key')) friendlyMsg = "Access Denied: Invalid API key. Check your .env file.";
      else if (msg.includes('quota')) friendlyMsg = "Transmissions limited. Cosmic data quota reached.";
      
      setMessages(prev => [...prev, { role: 'model', content: friendlyMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'model', content: 'Chat history cleared. How can I help you explore the cosmos today?' }]);
    setError(null);
    chatInstance.current = null;
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(99, 102, 241, 0.6)" }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 left-8 z-50 bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-4 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-indigo-400/30 backdrop-blur-md flex items-center justify-center"
        >
          <MessageSquare className="w-6 h-6" />
          {GEN_AI_API_KEY && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />}
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: -50, scale: 0.8, rotate: -5 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              x: 0, 
              scale: 1, 
              rotate: 0,
              height: isMinimized ? '72px' : '550px'
            }}
            exit={{ opacity: 0, y: 100, x: -50, scale: 0.8, rotate: -5 }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            className="fixed bottom-8 left-8 z-50 w-80 md:w-96 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden pointer-events-auto ring-1 ring-white/20"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-indigo-600/30 to-violet-600/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-2 bg-indigo-500/30 rounded-xl border border-indigo-400/30">
                    <Bot className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${GEN_AI_API_KEY ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm tracking-tight flex items-center gap-1.5">
                    Nova AI <Sparkles className="w-3 h-3 text-yellow-400" />
                  </h3>
                  <p className="text-[10px] text-indigo-300 font-medium uppercase tracking-wider">Station Commander</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={clearChat}
                  title="Clear frequency"
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-fixed"
                >
                  {messages.map((msg, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={i} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border ${
                          msg.role === 'user' 
                            ? 'bg-indigo-600 border-indigo-400 text-white' 
                            : 'bg-slate-800 border-slate-600 text-indigo-300'
                        }`}>
                          {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                        </div>
                        <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-lg ${
                          msg.role === 'user' 
                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none border border-indigo-400/30' 
                            : 'bg-white/5 text-slate-200 rounded-tl-none border border-white/10 backdrop-blur-md'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center">
                          <Bot className="w-3 h-3 text-indigo-300" />
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-3 backdrop-blur-md">
                          <div className="flex gap-1">
                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Scanning Galaxy...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="flex justify-center">
                      <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-xl flex items-center gap-2 text-[10px] text-red-400">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-5 bg-black/40 border-t border-white/10 backdrop-blur-xl">
                  {!GEN_AI_API_KEY && (
                    <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[9px] text-amber-400 text-center uppercase tracking-wider font-bold">
                      Warning: No Cosmic Key Found
                    </div>
                  )}
                  <div className="relative flex items-center gap-2">
                    <input 
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask Nova about the stars..."
                      className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-2xl py-3.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500"
                    />
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={isLoading || !input.trim() || !GEN_AI_API_KEY}
                      className="absolute right-1.5 p-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:grayscale"
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <p className="mt-3 text-[9px] text-center text-slate-500 font-medium uppercase tracking-[0.2em]">
                    Encrypted Deep Space Frequency
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
