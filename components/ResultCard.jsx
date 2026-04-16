import React from 'react';

/**
 * ResultCard Component
 *
 * Displays a result with a label, value, and optional styling.
 *
 * @param {Object} props
 * @param {string} props.label - The label text to display above value
 * @param {string|number} props.value - The value to display
 * @param {string} props.subvalue - Optional secondary value below main value
 * @param {string} props.color - The color scheme to use ('profit-green', 'profit-red', 'neutral', 'profit-blue', 'profit-yellow')
 * @param {string} props.size - The size variant ('sm', 'md', 'lg')
 * @param {number} props.span - Grid span (1, 2, or 3) for responsive layouts
 */
export default function ResultCard({ label, value, subvalue, color = 'neutral', size = 'md', span = 1 }) {
  // Color mapping for dark theme (zinc-950 background)
  const colorClasses = {
    'profit-green': {
      bg: 'bg-emerald-950/30',
      border: 'border-emerald-700',
      text: 'text-emerald-400',
      label: 'text-emerald-300',
      hover: 'hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-900/20'
    },
    'profit-red': {
      bg: 'bg-red-950/30',
      border: 'border-red-700',
      text: 'text-red-400',
      label: 'text-red-300',
      hover: 'hover:border-red-600 hover:shadow-lg hover:shadow-red-900/20'
    },
    'profit-blue': {
      bg: 'bg-blue-950/30',
      border: 'border-blue-700',
      text: 'text-blue-400',
      label: 'text-blue-300',
      hover: 'hover:border-blue-600 hover:shadow-lg hover:shadow-blue-900/20'
    },
    'profit-yellow': {
      bg: 'bg-amber-950/30',
      border: 'border-amber-700',
      text: 'text-amber-400',
      label: 'text-amber-300',
      hover: 'hover:border-amber-600 hover:shadow-lg hover:shadow-amber-900/20'
    },
    neutral: {
      bg: 'bg-zinc-900',
      border: 'border-zinc-700',
      text: 'text-zinc-300',
      label: 'text-zinc-400',
      hover: 'hover:border-zinc-600 hover:shadow-lg hover:shadow-zinc-900/20'
    },
  };

  // Size mapping for different size variants
  const sizeClasses = {
    sm: {
      container: 'p-3',
      label: 'text-xs',
      value: subvalue ? 'text-lg' : 'text-xl',
      subvalue: 'text-xs',
    },
    md: {
      container: 'p-4',
      label: 'text-sm',
      value: subvalue ? 'text-xl' : 'text-2xl',
      subvalue: 'text-sm',
    },
    lg: {
      container: 'p-6',
      label: 'text-base',
      value: subvalue ? 'text-2xl' : 'text-3xl',
      subvalue: 'text-base',
    },
  };

  const selectedColor = colorClasses[color] || colorClasses.neutral;
  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`
        rounded-lg border-2 transition-all duration-200
        ${selectedColor.bg}
        ${selectedColor.border}
        ${selectedSize.container}
        ${selectedColor.hover}
        col-span-${span}
      `}
    >
      <div className={selectedSize.label}>
        <span className={`font-medium ${selectedColor.label}`}>{label}</span>
      </div>
      <div className={selectedSize.value}>
        <span className={`font-bold ${selectedColor.text}`}>{value}</span>
      </div>
      {subvalue && (
        <div className={`mt-1 ${selectedSize.subvalue} ${selectedColor.label}`}>
          {subvalue}
        </div>
      )}
    </div>
  );
}
