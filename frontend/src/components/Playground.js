import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModelSelectGrid from './ModelSelectGrid';
import PromptForm from './PromptForm';
import ResponseGrid from './ResponseGrid';
import { Link } from 'react-router-dom';

export default function Playground() {
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
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container-custom h-16 flex items-center justify-between">
          <Link to="/" className="gradient-text text-2xl font-bold font-poppins">
            PromptHUB
          </Link>
          <a 
            href="https://github.com/yourusername/prompthub" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-custom pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="h2 mb-4 gradient-text">
            AI Model Playground
          </h1>
          <p className="body-large text-gray-600 max-w-2xl mx-auto">
            Select models and start comparing their responses to your prompts.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showResponse ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <ModelSelectGrid 
                selectedModels={selectedModels} 
                onSelect={handleSelectModel} 
              />
              <PromptForm
                prompt={prompt}
                setPrompt={setPrompt}
                onSend={handleSend}
                loading={loading}
                disabled={selectedModels.length === 0}
                sendDisabled={selectedModels.length === 0 || !prompt.trim()}
              />
            </motion.div>
          ) : (
            <motion.div
              key="response"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowResponse(false)}
                  className="btn btn-secondary"
                >
                  ← Back to Prompt
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setPrompt('');
                    setResponses({});
                    setShowResponse(false);
                  }}
                  className="btn btn-primary"
                >
                  New Prompt
                </motion.button>
              </div>
              <ResponseGrid 
                selectedModels={selectedModels.map(m => `${m.provider}-${m.label}`)}
                responses={responses}
                loading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </main>
    </div>
  );
}
