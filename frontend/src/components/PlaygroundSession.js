import React, { useState } from 'react';

export default function PlaygroundSession({ selectedModels }) {
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Inline PromptForm
  const PromptForm = ({ prompt, setPrompt, onSend, loading, disabled, sendDisabled }) => (
    <form onSubmit={onSend} style={{ marginBottom: 24 }}>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={disabled || loading}
        placeholder="Enter your prompt here..."
        style={{ width: '100%', minHeight: 80, borderRadius: 8, padding: 12, fontSize: 16, border: '1px solid #cbd5e1', marginBottom: 12 }}
      />
      <div>
        <button
          type="submit"
          disabled={sendDisabled}
          style={{
            padding: '12px 32px',
            fontSize: 18,
            fontWeight: 600,
            borderRadius: 8,
            background: sendDisabled ? '#b0b0b0' : '#2563eb',
            color: 'white',
            border: 'none',
            cursor: sendDisabled ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Processing...' : 'Send'}
        </button>
      </div>
    </form>
  );

  // Inline ResponseGrid
  const ResponseGrid = ({ selectedModels, responses, loading }) => {
    const container = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
      },
    };
    const item = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 },
    };
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
        {selectedModels.map((modelId) => {
          const [provider, model] = modelId.split('-');
          return (
            <div key={modelId} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 24, minWidth: 260, maxWidth: 320 }}>
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{model}</h3>
                <span style={{ fontSize: 14, color: '#2563eb', fontWeight: 600 }}>{provider === 'azure' ? 'Azure' : 'OpenAI'}</span>
              </div>
              <div>
                {loading ? (
                  <div>
                    <div style={{ height: 16, background: '#e0e7ef', borderRadius: 4, marginBottom: 8 }}></div>
                    <div style={{ height: 16, background: '#e0e7ef', borderRadius: 4, marginBottom: 8, width: '60%' }}></div>
                    <div style={{ height: 16, background: '#e0e7ef', borderRadius: 4, width: '80%' }}></div>
                  </div>
                ) : responses[modelId] ? (
                  <p style={{ color: '#334155', whiteSpace: 'pre-wrap' }}>{responses[modelId]}</p>
                ) : (
                  <p style={{ color: '#64748b', fontStyle: 'italic' }}>No response yet.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 60%, #00c6ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 950,
        margin: '0 auto',
        padding: '40px 0'
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '2.2rem',
          fontWeight: 900,
          marginBottom: 32,
          textAlign: 'center',
          letterSpacing: 0.5,
          textShadow: '0 2px 8px #0006'
        }}>
          Playground Session
        </h2>
        <PromptForm
          prompt={prompt}
          setPrompt={setPrompt}
          onSend={handleSend}
          loading={loading}
          disabled={selectedModels.length === 0}
          sendDisabled={selectedModels.length === 0 || !prompt.trim()}
        />
        <div style={{ marginTop: 32 }}>
          <ResponseGrid
            selectedModels={selectedModels.map(m => `${m.provider}-${m.label}`)}
            responses={responses}
            loading={loading}
          />
        </div>
        {error && (
          <div style={{ color: 'red', marginTop: 16 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
