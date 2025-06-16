import React from 'react';
import { motion } from 'framer-motion';

export default function ModelCard({ model, provider, selected, onSelect, interactive }) {
  const cardVariants = {
    unselected: { scale: 1 },
    selected: { scale: 1.02 }
  };

  return (
    <motion.div
      variants={cardVariants}
      animate={selected ? 'selected' : 'unselected'}
      whileHover={{ scale: interactive ? 1.05 : 1 }}
      onClick={() => interactive && onSelect()}
      className={`
        card relative overflow-hidden p-6 cursor-pointer
        ${selected ? 'border-primary-500 shadow-custom' : 'border-gray-100'}
        ${interactive ? 'hover:shadow-custom-lg card-hover' : ''}
      `}
    >
      {/* Provider Badge */}
      <div className={`
        absolute right-4 top-4 px-3 py-1 rounded-full text-xs font-semibold
        ${provider === 'azure' ? 'bg-secondary-100 text-secondary-700' : 'bg-primary-100 text-primary-700'}
      `}>
        {provider === 'azure' ? 'Azure' : 'OpenAI'}
      </div>

      {/* Model Icon */}
      <div className="text-4xl mb-4">
        {model.includes('GPT-4') ? '🧠' : '⚡'}
      </div>

      {/* Model Name */}
      <h3 className="text-xl font-semibold mb-2 text-gray-800">
        {model}
      </h3>

      {/* Selection Indicator */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 border-2 border-primary-500 rounded-2xl"
        />
      )}

      {/* Hover Overlay */}
      {interactive && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </motion.div>
  );
}
