import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PlaygroundSession({ selectedModels }) {
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInput, setShowInput] = useState(false);
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
    // Trigger the prompt input animation only once
    setShowInput(true);
  }, []);

  const chunkModels = (models) => {
    const total = models.length;
    if (total <= 3) return [models];
    if (total === 4) return [models.slice(0, 2), models.slice(2)];
    if (total <= 6) return [models.slice(0, 3), models.slice(3)];
    const chunks = [];
    for (let i = 0; i < total; i += 3) chunks.push(models.slice(i, i + 3));
    return chunks;
  };

  const ResponseGrid = () => {
    const rows = chunkModels(selectedModels.map(m => `${m.provider}-${m.label}`));

    return (
      <div className="flex flex-col gap-6">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`grid gap-6 ${row.length === 1 ? 'grid-cols-1' : row.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}
          >
            {row.map((modelId) => {
              const [provider, model] = modelId.split('-');
              return (
                <div key={modelId} className="bg-white rounded-2xl shadow-md p-6 max-h-[350px] flex flex-col">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold mb-1">{model}</h3>
                    <span className="text-sm text-blue-600 font-semibold">{provider === 'azure' ? 'Azure' : 'OpenAI'}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-[240px] pr-1 text-slate-700 whitespace-pre-wrap">
                    {loading ? (
                      <>
                        <div className="h-4 bg-slate-200 rounded mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded mb-2 w-3/5"></div>
                        <div className="h-4 bg-slate-200 rounded w-4/5"></div>
                      </>
                    ) : responses[modelId] ? (
                      <p>{responses[modelId]}</p>
                    ) : (
                      <p className="italic text-slate-500">No response yet.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Add send logic from provided code
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
      } catch (err) {
        setError('Something went wrong.');
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#00c6ff] flex flex-col items-center font-sans px-3">
      <div className="w-4/5 mt-10 relative">
        <h2 className="text-white text-3xl font-black mb-8 text-center tracking-wide drop-shadow-lg">
          Playground Session
        </h2>
        <button
          className="absolute top-0 right-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded shadow transition-colors duration-150"
          onClick={() => window.location.href = '/playground'}
        >
          Select New Models
        </button>
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
              className="w-full rounded-lg p-4 pr-12 resize-none bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 font-medium placeholder-slate-400"
              rows={2}
            />
            <button
              type="button"
              className="absolute top-1/2 right-4 transform -translate-y-1/2 rounded-full p-2 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ height: '2.5rem', width: '2.5rem', background: 'none', boxShadow: 'none' }}
              aria-label="Send"
              onClick={handleSend}
              disabled={selectedModels.length === 0 || !prompt.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600 hover:text-blue-700 transition-colors duration-150">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
              </svg>
            </button>
          </motion.div>
        )}
      </div>

      <div className="w-4/5 my-10">
        <ResponseGrid />
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
      </div>
    </div>
  );
}
