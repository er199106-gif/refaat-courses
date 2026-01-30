import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressRing({ progress, size = 120, strokeWidth = 12, color = "violet" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colors = {
    violet: { from: '#8B5CF6', to: '#6366F1' },
    cyan: { from: '#06B6D4', to: '#0EA5E9' },
    pink: { from: '#EC4899', to: '#F43F5E' },
    yellow: { from: '#F59E0B', to: '#EAB308' },
    green: { from: '#10B981', to: '#22C55E' },
  };

  const selectedColor = colors[color] || colors.violet;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={selectedColor.from} />
            <stop offset="100%" stopColor={selectedColor.to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${color})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
