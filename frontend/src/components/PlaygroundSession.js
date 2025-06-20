import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { motion } from 'framer-motion';

// ✅ ResponseGrid moved outside to prevent unnecessary re-renders
const ResponseGrid = ({ selectedModels, responses, loading, typingStates }) => {
  const chunkModels = (models) => {
    const total = models.length;
    if (total <= 3) return [models];
    if (total === 4) return [models.slice(0, 2), models.slice(2)];
    if (total <= 6) return [models.slice(0, 3), models.slice(3)];
    const chunks = [];
    for (let i = 0; i < total; i += 3) chunks.push(models.slice(i, i + 3));
    return chunks;
  };

  const rows = chunkModels(selectedModels.map(m => `${m.provider}-${m.label}`));

  // Map provider to logo
  const providerLogos = {
    azure: require('../assets/azure.png'),
    openai: require('../assets/openai.png'),
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.25 }}
      className="flex flex-col gap-6"
    >
      {rows.map((row, i) => (
        <div
          key={i}
          className={`grid gap-6 ${row.length === 1 ? 'grid-cols-1' : row.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}
        >
          {row.map((modelId) => {
            const [provider, model] = modelId.split('-');
            return (
              <motion.div
                key={modelId}
                initial={{ y: 40, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.35 + i * 0.08 }}
                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 max-h-[350px] flex flex-col border border-blue-200 relative"
                style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
              >
                {/* Logo at top right */}
                <img
                  src={providerLogos[provider]}
                  alt={provider}
                  className="absolute top-4 right-4 w-6 h-6 object-contain drop-shadow-md"
                  style={{ borderRadius: '50%', border: 'none', padding: 0 }}
                />
                <div className="mb-3 pr-12">
                  <h3 className="text-xl font-bold mb-1 text-slate-800">{model}</h3>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[240px] pr-1 text-slate-700 whitespace-pre-wrap">
                  {loading ? (
                    <div className="flex flex-col gap-2 animate-pulse-response" style={{overflow: 'hidden', minHeight: '64px'}}>
                      <div className="h-4 bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200 rounded w-full loading-bar-3d"></div>
                      <div className="h-4 bg-gradient-to-r from-slate-200 via-blue-100 to-slate-200 rounded w-3/5 loading-bar-3d"></div>
                      <div className="h-4 bg-gradient-to-r from-slate-200 via-blue-300 to-slate-200 rounded w-4/5 loading-bar-3d"></div>
                    </div>
                  ) : responses[modelId] ? (
                    <p>{typingStates && typingStates[modelId] !== undefined ? typingStates[modelId] : responses[modelId]}</p>
                  ) : (
                    <p className="italic text-slate-500">No response yet.</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ))}
    </motion.div>
  );
};

export default function PlaygroundSession({ selectedModels }) {
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [typingStates, setTypingStates] = useState({});
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = 24;
      const minHeight = 2 * lineHeight;
      const maxHeight = 6 * lineHeight;
      textarea.style.height = Math.max(minHeight, Math.min(scrollHeight, maxHeight)) + 'px';
    }
  }, [prompt]);

  useEffect(() => {
    setShowInput(true);
  }, []);

  useEffect(() => {
    if (showInput && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showInput]);

  // Typing effect for responses
  useEffect(() => {
    if (!loading && Object.keys(responses).length > 0) {
      const newTypingStates = {};
      Object.entries(responses).forEach(([modelId, text]) => {
        newTypingStates[modelId] = '';
        let i = 0;
        const typeChar = () => {
          setTypingStates(prev => ({ ...prev, [modelId]: text.slice(0, i) }));
          if (i < text.length) {
            i++;
            setTimeout(typeChar, 5 + Math.random() * 15); // Faster typing
          }
        };
        typeChar();
      });
    }
  }, [responses, loading]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setResponses({});
    setLoading(true);
    setTimeout(async () => {
      try {
        const res = await fetch('http://localhost:8000/api/prompts/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: prompt, models: selectedModels })
        });
        if (!res.ok) throw new Error('Failed to fetch response');
        const data = await res.json();
        setResponses(data.responses || {});
        setPrompt(''); // Reset prompt after response
        setLoading(false); // Move setLoading here to ensure focus happens after loading is false
        // Focus textarea after response
        setTimeout(() => {
          if (textareaRef.current) textareaRef.current.focus();
        }, 0);
      } catch (err) {
        setError('Something went wrong.');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#00c6ff] flex flex-col items-center font-sans px-3">
      <div className="w-4/5 mt-10 relative">
        <motion.h2
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-white text-3xl font-black mb-8 text-center tracking-wide drop-shadow-lg"
        >
          Playground Session
        </motion.h2>
        <motion.button
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          className="absolute top-0 right-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded shadow transition-colors duration-150"
          onClick={() => window.location.href = '/playground'}
        >
          Select New Models
        </motion.button>
        {showInput && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mt-6 relative"
          >
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt..."
              className="w-full rounded-lg p-4 pr-12 resize-none bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 font-medium placeholder-slate-400 overflow-y-scroll scrollbar-hide"
              rows={2}
              style={{
                maxHeight: '144px', // 6 * 24px line height
                minHeight: '48px',  // 2 * 24px line height
                overflowY: 'scroll',
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE/Edge
              }}
              onWheel={e => {
                // Allow scrolling inside textarea
                e.stopPropagation();
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (prompt.trim() && selectedModels.length > 0 && !loading) {
                    handleSend();
                  }
                }
              }}
              disabled={loading}
            />
            <style>{`
              textarea::-webkit-scrollbar { display: none; }
              @keyframes response-bar-3d {
                0% { background-position: 0% 50%; filter: brightness(0.95) drop-shadow(0 1px 2px #b6d0f7); }
                50% { background-position: 100% 50%; filter: brightness(1.15) drop-shadow(0 2px 6px #60a5fa); }
                100% { background-position: 0% 50%; filter: brightness(0.95) drop-shadow(0 1px 2px #b6d0f7); }
              }
              .loading-bar-3d {
                background-size: 200% 200%;
                animation: response-bar-3d 1.3s infinite cubic-bezier(0.4,0,0.2,1);
              }
              .animate-pulse-response .loading-bar-3d:nth-child(2) {
                animation-delay: 0.18s;
              }
              .animate-pulse-response .loading-bar-3d:nth-child(3) {
                animation-delay: 0.36s;
              }
              /* Prevent scroll flicker on loading */
              .animate-pulse-response { min-height: 64px; max-height: 240px; overflow: hidden; }
            `}</style>
            <button
              type="button"
              className="absolute top-1/2 right-4 transform -translate-y-1/2 rounded-full p-2 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ height: '2.5rem', width: '2.5rem', background: 'none', boxShadow: 'none' }}
              aria-label="Send"
              onClick={handleSend}
              disabled={selectedModels.length === 0 || !prompt.trim() || loading}
            >
              {loading ? (
                <span className="w-5 h-5 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                </span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600 hover:text-blue-700 transition-colors duration-150">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
                </svg>
              )}
            </button>
          </motion.div>
        )}
      </div>

      <div className="w-4/5 my-10">
        <ResponseGrid selectedModels={selectedModels} responses={responses} loading={loading} typingStates={typingStates} />
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
      </div>
    </div>
  );
}
