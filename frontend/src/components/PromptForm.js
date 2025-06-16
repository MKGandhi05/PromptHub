import React from 'react';
import { motion } from 'framer-motion';

export default function PromptForm({ prompt, setPrompt, onSend, loading, disabled, sendDisabled }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="card p-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={disabled || loading}
          placeholder="Enter your prompt here..."
          className={`
            textarea mb-4
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: !sendDisabled ? 1.02 : 1 }}
            whileTap={{ scale: !sendDisabled ? 0.98 : 1 }}
            onClick={onSend}
            disabled={sendDisabled}
            className={`
              btn btn-primary
              ${sendDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${loading ? 'animate-pulse' : ''}
            `}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Send'
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
