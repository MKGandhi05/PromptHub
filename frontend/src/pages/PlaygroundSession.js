import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import '@fontsource/inter/700.css';
import '@fontsource/inter/400.css';

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
            // Correctly split provider and model name, even if model has dashes
            const dashIndex = modelId.indexOf('-');
            const provider = modelId.slice(0, dashIndex);
            const model = modelId.slice(dashIndex + 1);
            // Increase maxHeight if only one row (1, 2, or 3 models)
            const isSingleRow = rows.length === 1;
            return (
              <motion.div
                key={modelId}
                initial={{ y: 40, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.35 + i * 0.08 }}
                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col border border-blue-200 relative"
                style={{
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
                  maxHeight: isSingleRow ? '450px' : '350px', // Decreased by 1%
                }}
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
                <div className="flex-1 overflow-y-auto text-slate-700 whitespace-pre-wrap custom-scrollbar" style={{ maxHeight: isSingleRow ? '366px' : '240px', paddingRight: 0, marginRight: '-8px' }}>
                  {loading ? (
                    <div className="flex flex-col gap-2 animate-pulse-response" style={{overflow: 'hidden', minHeight: '64px'}}>
                      <div className="h-4 bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200 rounded w-full loading-bar-3d"></div>
                      <div className="h-4 bg-gradient-to-r from-slate-200 via-blue-100 to-slate-200 rounded w-3/5 loading-bar-3d"></div>
                      <div className="h-4 bg-gradient-to-r from-slate-200 via-blue-300 to-slate-200 rounded w-4/5 loading-bar-3d"></div>
                    </div>
                  ) : responses[modelId] ? (
                    typingStates && typingStates[modelId] !== undefined ? (
                      <RenderResponse text={typingStates[modelId]} />
                    ) : (
                      <RenderResponse text={responses[modelId]} />
                    )
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
            setTimeout(typeChar, 1 + Math.random() * 3); // Much faster typing
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
        const accessToken = localStorage.getItem('access');
        const res = await fetch('http://localhost:8000/api/prompts/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
          },
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#00c6ff] flex flex-col items-center font-sans px-3" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-11/12 mt-10 relative">
        <motion.h2
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-white text-4xl md:text-5xl font-extrabold mb-3 text-center tracking-tight drop-shadow-xl" style={{letterSpacing: '0.01em'}}
        >
          Playground <span className="text-blue-300">Session</span>
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

      <div className="w-11/12 my-10">
        <ResponseGrid selectedModels={selectedModels} responses={responses} loading={loading} typingStates={typingStates} />
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
      </div>
    </div>
  );
}
