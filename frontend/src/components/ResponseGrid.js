import React from 'react';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ResponseGrid({ selectedModels, responses, loading }) {
  const gridCols = selectedModels.length === 1 
    ? 'grid-cols-1' 
    : selectedModels.length === 2 
      ? 'grid-cols-1 lg:grid-cols-2' 
      : 'grid-cols-1 lg:grid-cols-3';

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`grid ${gridCols} gap-8 w-full mt-12`}
    >
      {selectedModels.map((modelId) => {
        const [provider, model] = modelId.split('-');
        return (
          <motion.div
            key={modelId}
            variants={item}
            className="card overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  {model}
                </h3>
                <span className={`
                  px-3 py-1 rounded-full text-xs font-semibold
                  ${provider === 'azure' ? 'bg-secondary-100 text-secondary-700' : 'bg-primary-100 text-primary-700'}
                `}>
                  {provider === 'azure' ? 'Azure' : 'OpenAI'}
                </span>
              </div>
            </div>

            {/* Response Content */}
            <div className="p-6">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ) : responses[modelId] ? (
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {responses[modelId]}
                </p>
              ) : (
                <p className="text-gray-400 italic">
                  No response yet.
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
