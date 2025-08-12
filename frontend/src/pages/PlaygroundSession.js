import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
// import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import '@fontsource/inter/700.css';
import '@fontsource/inter/400.css';

// ✅ ResponseGrid moved outside to prevent unnecessary re-renders
const ResponseGrid = ({ selectedModels, responses, loading, chatHistory }) => {
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
    <div className="flex flex-col gap-6">
      {rows.map((row, i) => (
        <div
          key={i}
          className={`grid gap-6 ${row.length === 1 ? 'grid-cols-1' : row.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}
        >
          {row.map((modelId) => {
            const dashIndex = modelId.indexOf('-');
            const provider = modelId.slice(0, dashIndex);
            const model = modelId.slice(dashIndex + 1);
            const isSingleRow = rows.length === 1;
            return (
              <div
                key={modelId}
                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col border border-blue-200 relative"
                style={{
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
                  maxHeight: isSingleRow ? '450px' : '350px',
                }}
              >
                <img
                  src={providerLogos[provider]}
                  alt={provider}
                  className="absolute top-4 right-4 w-6 h-6 object-contain drop-shadow-md"
                  style={{ borderRadius: '50%', border: 'none', padding: 0 }}
                />
                <div className="mb-3 pr-12">
                  <h3 className="text-xl font-bold mb-1 text-slate-800">{model}</h3>
                </div>
                {/* Render chat history for each model */}
                <div className="space-y-2 mb-2">
                  {chatHistory.filter(msg => !msg.modelId || msg.modelId === modelId).map((msg, idx) => (
                    <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                      <span className={msg.role === 'user' ? 'bg-blue-100 text-blue-800 rounded-lg px-3 py-1 inline-block' : 'bg-gray-100 text-gray-800 rounded-lg px-3 py-1 inline-block'}>
                        {msg.content}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto text-slate-700 whitespace-pre-wrap custom-scrollbar" style={{ maxHeight: isSingleRow ? '366px' : '240px', paddingRight: 0, marginRight: '-8px' }}>
                  {loading ? (
                    <div className="flex flex-col gap-2" style={{overflow: 'hidden', minHeight: '64px'}}>
                      <div className="h-4 bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-gradient-to-r from-slate-200 via-blue-100 to-slate-200 rounded w-3/5"></div>
                      <div className="h-4 bg-gradient-to-r from-slate-200 via-blue-300 to-slate-200 rounded w-4/5"></div>
                    </div>
                  ) : responses[modelId] ? (
                    <RenderResponse text={responses[modelId]} />
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

function RenderResponse({ text }) {
  if (!text) return null;
  let lastIndex = 0;
  const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  const elements = [];
  let codeBlockCount = 0;
  while ((match = codeRegex.exec(text)) !== null) {
    // Push text before code block
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      elements.push(renderStyledText(before, elements.length));
    }
    // Push code block
    const language = match[1] || 'javascript';
    const code = match[2];
    elements.push(
      <CodeBlockWithCopy key={`codeblock-${elements.length}`} code={code} language={language} />
    );
    lastIndex = match.index + match[0].length;
    codeBlockCount++;
  }
  // Push any remaining text after last code block
  if (lastIndex < text.length) {
    elements.push(renderStyledText(text.slice(lastIndex), elements.length));
  }
  return <>{elements}</>;
}

// Enhanced text renderer for headings, subheadings, and inline code
function renderStyledText(text, keyPrefix = '') {
  // Split by lines
  const lines = text.split(/\n/);
  let inList = false;
  let listType = null;
  let listBuffer = [];
  const rendered = [];
  const flushList = () => {
    if (listBuffer.length > 0) {
      if (listType === 'ul') {
        rendered.push(
          <ul key={keyPrefix + '-ul-list-' + rendered.length} className="pl-6 mb-1 list-disc">
            {listBuffer.map((item, idx) => <li key={keyPrefix + '-ul-li-' + idx}>{item}</li>)}
          </ul>
        );
      } else if (listType === 'ol') {
        rendered.push(
          <ol key={keyPrefix + '-ol-list-' + rendered.length} className="pl-6 mb-1 list-decimal">
            {listBuffer.map((item, idx) => <li key={keyPrefix + '-ol-li-' + idx}>{item}</li>)}
          </ol>
        );
      }
      listBuffer = [];
      listType = null;
      inList = false;
    }
  };
  lines.forEach((line, i) => {
    // Heading: #, ##, ###, #### (remove hashes, no color, just font size/bold)
    if (/^# (.*)/.test(line)) {
      flushList();
      rendered.push(<div key={keyPrefix + '-h1-' + i} className="text-2xl font-extrabold mt-4 mb-2">{line.replace(/^# /, '')}</div>);
      return;
    }
    if (/^## (.*)/.test(line)) {
      flushList();
      rendered.push(<div key={keyPrefix + '-h2-' + i} className="text-xl font-bold mt-3 mb-1">{line.replace(/^## /, '')}</div>);
      return;
    }
    if (/^### (.*)/.test(line)) {
      flushList();
      rendered.push(<div key={keyPrefix + '-h3-' + i} className="text-lg font-semibold mt-2 mb-1">{line.replace(/^### /, '')}</div>);
      return;
    }
    if (/^#### (.*)/.test(line)) {
      flushList();
      rendered.push(<div key={keyPrefix + '-h4-' + i} className="text-base font-semibold mt-2 mb-1">{line.replace(/^#### /, '')}</div>);
      return;
    }
    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
      }
      listBuffer.push(renderInlineAndBold(line.replace(/^\d+\.\s+/, ''), keyPrefix + '-' + i));
      return;
    }
    // Bullet list
    if (/^[-*]\s+/.test(line)) {
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
      }
      listBuffer.push(renderInlineAndBold(line.replace(/^[-*]\s+/, ''), keyPrefix + '-' + i));
      return;
    }
    // Indented bullet (sub-list)
    if (/^\s{2,}[-*]\s+/.test(line)) {
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
      }
      // Add as a nested list item
      const content = renderInlineAndBold(line.replace(/^\s{2,}[-*]\s+/, ''), keyPrefix + '-' + i);
      listBuffer.push(<ul className="pl-6 list-disc"><li>{content}</li></ul>);
      return;
    }
    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      flushList();
      rendered.push(<hr key={keyPrefix + '-hr-' + i} className="my-2 border-blue-200" />);
      return;
    }
    // Normal text
    flushList();
    rendered.push(<div key={keyPrefix + '-d-' + i} className="mb-1">{renderInlineAndBold(line, keyPrefix + '-' + i)}</div>);
  });
  flushList();
  return rendered;
}

// Enhanced inline renderer for code and bold
function renderInlineAndBold(text, keyPrefix = '') {
  // Handle inline code first
  const codeParts = text.split(/(`[^`]+`)/g);
  return codeParts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={keyPrefix + '-code-' + i} className="bg-slate-100 px-1 rounded text-blue-700 text-sm font-mono">{part.slice(1, -1)}</code>;
    } else {
      // Handle bold (**text** or __text__)
      // Use a regex that matches **bold** or __bold__ and supports nested bold
      const boldParts = [];
      let lastIdx = 0;
      const boldRegex = /(\*\*|__)(.*?)\1/g;
      let match;
      let idx = 0;
      while ((match = boldRegex.exec(part)) !== null) {
        if (match.index > lastIdx) {
          boldParts.push(<span key={keyPrefix + '-span-' + i + '-' + idx}>{part.slice(lastIdx, match.index)}</span>);
          idx++;
        }
        boldParts.push(<strong key={keyPrefix + '-bold-' + i + '-' + idx} className="font-bold">{match[2]}</strong>);
        lastIdx = match.index + match[0].length;
        idx++;
      }
      if (lastIdx < part.length) {
        boldParts.push(<span key={keyPrefix + '-span-' + i + '-' + idx}>{part.slice(lastIdx)}</span>);
      }
      return boldParts;
    }
  });
}

function CodeBlockWithCopy({ code, language }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="my-2 relative group">
      <SyntaxHighlighter language={language} style={oneDark} customStyle={{ borderRadius: 8, fontSize: 14, margin: 0, padding: 16 }}>
        {code}
      </SyntaxHighlighter>
      <button
        className={`absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded shadow transition-colors duration-150 opacity-80 group-hover:opacity-100`}
        style={{zIndex:2}}
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

function renderInlineCode(text, keyPrefix = '') {
  // Inline code (single backticks)
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code key={keyPrefix + '-' + i} className="bg-slate-100 px-1 rounded text-blue-700 text-sm font-mono">{part.slice(1, -1)}</code>
    ) : (
      <span key={keyPrefix + '-' + i}>{part}</span>
    )
  );
}

export default function PlaygroundSession({ selectedModels }) {
  // If coming from history, prefill prompt
  const [prompt, setPrompt] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('fromHistory')) {
      const histPrompt = localStorage.getItem('historyPrompt');
      return histPrompt || '';
    }
    return '';
  });
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [freeTrials, setFreeTrials] = useState(null);
  const [credits, setCredits] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]); // [{role, content, modelId}]
  const textareaRef = useRef(null);

  useEffect(() => {
    // Fetch user stats on mount
    const fetchStats = async () => {
      const accessToken = localStorage.getItem('access');
      if (!accessToken) return;
      try {
        const res = await fetch('http://localhost:8000/api/userstats/', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          // setFreeTrials(data.remaining_free_trials);
          setCredits(data.available_credits);
        }
      } catch {}
    };
    fetchStats();
  }, []);

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


  // Calculate comparison cost
  const getComparisonCost = () => {
    if (!selectedModels || !Array.isArray(selectedModels)) return 0;
    return selectedModels.reduce((sum, m) => sum + (m.price || 0), 0);
  };

  // Fix: Ensure selectedModels have numeric price
  useEffect(() => {
    if (selectedModels && Array.isArray(selectedModels)) {
      selectedModels.forEach(m => {
        if (typeof m.price === 'string') m.price = parseFloat(m.price);
      });
    }
    // Optionally, force a re-render if needed
    // setSelectedModels([...selectedModels]);
  }, [selectedModels]);

  // Update handleSend for multi-turn
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('access');
      const payload = {
        text: prompt,
        models: selectedModels,
      };
      if (sessionId) payload.session_id = sessionId;
      const res = await fetch('http://localhost:8000/api/prompts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to fetch response');
      const data = await res.json();
      setResponses(data.responses || {});
      if (data.session_id) setSessionId(data.session_id);
      if (data.available_credits !== undefined) setCredits(data.available_credits);
      // Update chat history
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: prompt },
        ...Object.entries(data.responses || {}).map(([modelId, content]) => ({ role: 'assistant', content, modelId }))
      ]);
      setPrompt('');
      setLoading(false);
      if (textareaRef.current) textareaRef.current.focus();
    } catch (err) {
      setError('Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#00c6ff] flex flex-col items-center font-sans px-3" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Stats bar at top left */}
      <div style={{
        position: 'absolute',
        top: 32,
        left: 32,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'row',
        gap: '18px',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.92)',
        borderRadius: '14px',
        boxShadow: '0 4px 24px 0 #2563eb22',
        padding: '12px 28px',
        minHeight: 56,
        minWidth: 320,
        border: '1.5px solid #e0e7ef',
      }}>
        {/* Credits with color logic */}
        {credits !== null && (
          <div style={{
            color: credits <= 10 ? '#dc2626' : credits <= 25 ? '#ea8800' : '#059669',
            fontWeight: 700,
            fontSize: 16,
            padding: '0 10px',
            borderRight: selectedModels && selectedModels.length > 0 ? '1.5px solid #e0e7ef' : 'none',
            marginRight: selectedModels && selectedModels.length > 0 ? 10 : 0,
            letterSpacing: 0.2,
            transition: 'color 0.2s',
          }}>
            Credits: <span style={{fontWeight:800}}>{Number(credits).toFixed(2)}</span>
          </div>
        )}
        {/* Comparison cost */}
        {selectedModels && selectedModels.length > 0 && (
          <div style={{
            color: '#0e7490',
            fontWeight: 700,
            fontSize: 16,
            padding: '0 10px',
            letterSpacing: 0.2,
          }}>
            Comparison Cost: <span style={{fontWeight:800}}>{Number(getComparisonCost() || 0).toFixed(2)}</span> credits
          </div>
        )}
      </div>
      {/* Main content */}
      <div className="w-11/12 mt-10 relative">
        <h2
          className="text-white text-4xl md:text-5xl font-extrabold mb-3 text-center tracking-tight drop-shadow-xl" style={{letterSpacing: '0.01em'}}>
          Playground <span className="text-blue-300">Session</span>
        </h2>
        {/* Display free trials, credits, and comparison cost */}
        
        <button
          className="absolute top-0 right-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded shadow transition-colors duration-150"
          onClick={() => window.location.href = '/playground'}
        >
          Select New Models
        </button>
        {showInput && (
          <div className="mt-6 relative">
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

              /* Custom scrollbar for response cards */
              .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #60a5fa #e0e7ef;
              }
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
                background: #e0e7ef;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #60a5fa 40%, #2563eb 100%);
                border-radius: 6px;
                min-height: 24px;
                box-shadow: 0 2px 6px rgba(96,165,250,0.15);
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #e0e7ef;
                border-radius: 6px;
              }
            `}</style>
            <button
              type="button"
              className="absolute top-1/2 right-4 transform -translate-y-1/2 rounded-full p-2 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ height: '2.5rem', width: '2.5rem', background: 'none', boxShadow: 'none' }}
              aria-label="Send"
              onClick={handleSend}
              disabled={selectedModels.length === 0 || !prompt.trim() || loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600 hover:text-blue-700 transition-colors duration-150">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
              </svg>
            </button>
          </div>
  )}
      </div>

      <div className="w-11/12 my-10">
  <ResponseGrid selectedModels={selectedModels} responses={responses} loading={loading} chatHistory={chatHistory} />
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
      </div>
    </div>
  );
}
