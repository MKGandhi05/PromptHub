import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import Playground from './components/Playground';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModels, setSelectedModels] = useState([]);
  const [showResponse, setShowResponse] = useState(false);

  const handleSelectModel = (model) => {
    setSelectedModels(prev => {
      const exists = prev.some(
        (m) => m.provider === model.provider && m.label === model.label
      );
      if (exists) {
        return prev.filter(
          (m) => !(m.provider === model.provider && m.label === model.label)
        );
      } else {
        return [...prev, model];
      }
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    setResponses({});
    setLoading(true);
    // Smooth transition: fade out selection/prompt, then fade in response
    setTimeout(async () => {
      setShowResponse(true);
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
    }, 400); // 400ms fade out
  };

  return (
    <Router>
      <div className="min-h-screen w-full flex flex-col items-center justify-start bg-neutral-900">
        <div className="w-full max-w-7xl mt-8 px-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center text-white mb-8 tracking-tight drop-shadow-lg font-poppins">PromptHUB : Multi LLM Playground</h1>
          <Routes>
            <Route path="/" element={
              <div className="transition-opacity duration-400 opacity-100 animate-fade-in">
                <LandingPage />
              </div>
            } />
            <Route path="/playground" element={
              <div className="transition-opacity duration-400 opacity-100 animate-fade-in">
                <Playground
                  selectedModels={selectedModels}
                  onSelectModel={handleSelectModel}
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onSend={handleSend}
                  loading={loading}
                  error={error}
                  responses={responses}
                  showResponse={showResponse}
                />
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
