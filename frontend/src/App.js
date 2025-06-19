import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import Playground from './components/Playground';
import PlaygroundSession from './components/PlaygroundSession';

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
      <div>
        <div>
          <Routes>
            <Route path="/" element={
              <div>
                <LandingPage />
              </div>
            } />
            <Route path="/playground" element={
              <div>
                <Playground />
              </div>
            } />
            <Route path="/playground/session" element={
              <div>
                <PlaygroundSessionWrapper />
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function PlaygroundSessionWrapper() {
  let selectedModels = [];
  try {
    selectedModels = JSON.parse(localStorage.getItem('selectedModels')) || [];
  } catch {
    selectedModels = [];
  }
  return <PlaygroundSession selectedModels={selectedModels} />;
}
