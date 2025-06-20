import React, { useState, useRef, useLayoutEffect } from 'react';

export default function PlaygroundSession({ selectedModels }) {
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handlePromptChange = (e) => setPrompt(e.target.value);

  const handleSend = async (e) => {
    e.preventDefault();
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

  const chunkModels = (models) => {
    const total = models.length;
    if (total <= 3) return [models];
    if (total === 4) return [models.slice(0, 2), models.slice(2)];
    if (total === 5) return [models.slice(0, 3), models.slice(3)];
    if (total === 6) return [models.slice(0, 3), models.slice(3)];
    const chunks = [];
    for (let i = 0; i < total; i += 3) chunks.push(models.slice(i, i + 3));
    return chunks;
  };

  const PromptForm = () => (
    <form onSubmit={handleSend} className="w-4/5 relative flex items-center bg-white rounded-xl shadow-md p-4 mt-10">
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={handlePromptChange}
        disabled={selectedModels.length === 0 || loading}
        placeholder="Enter your prompt here..."
        rows={2}
        className="flex-1 resize-none border-none outline-none text-base min-h-[48px] max-h-[144px] leading-6 pr-10 bg-transparent text-slate-800 overflow-hidden"
        onWheel={(e) => e.stopPropagation()}
      />
      <button
        type="submit"
        disabled={selectedModels.length === 0 || !prompt.trim()}
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full w-8 h-8 flex items-center justify-center transition-colors ${!prompt.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        tabIndex={-1}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 17.5L17.5 10L2.5 2.5V8.33333L13.3333 10L2.5 11.6667V17.5Z" fill="#fff" />
        </svg>
      </button>
    </form>
  );

  const ResponseGrid = () => {
    const rows = chunkModels(selectedModels.map(m => `${m.provider}-${m.label}`));

    return (
      <div className="flex flex-col gap-6 w-4/5">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#00c6ff] flex flex-col items-center font-sans px-3">
      <PromptForm />
      <div className="w-4/5 my-10">
        <h2 className="text-white text-3xl font-black mb-8 text-center tracking-wide drop-shadow-lg">
          Playground Session
        </h2>
        <ResponseGrid />
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
      </div>
    </div>
  );
}
