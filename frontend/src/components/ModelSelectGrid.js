import React from 'react';
import { motion } from 'framer-motion';
import ModelCard from './ModelCard';

const MODELS = [
  { provider: 'openai', label: 'GPT-4o' },
  { provider: 'openai', label: 'o4 – mini' },
  { provider: 'openai', label: 'GPT-4.1 -mini' },
  { provider: 'azure', label: 'GPT-4o' },
  { provider: 'azure', label: 'o4 – mini' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ModelSelectGrid({ selectedModels, onSelect }) {
  return (
    <div className="w-full mb-12">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
      >
        {MODELS.map((model) => (
          <motion.div key={`${model.provider}-${model.label}`} variants={item}>
            <ModelCard
              model={model.label}
              provider={model.provider}
              selected={selectedModels.some(
                (m) => m.provider === model.provider && m.label === model.label
              )}
              onSelect={() => onSelect(model)}
              interactive={true}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
