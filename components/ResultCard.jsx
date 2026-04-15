import React from 'react';

/**
 * ResultCard Component
 *
 * Displays a result with a label, value, and optional styling.
 *
 * @param {Object} props
 * @param {string} props.label - The label text to display above the value
 * @param {string|number} props.value - The value to display
 * @param {string} props.color - The color scheme to use (e.g., 'green', 'red', 'blue', 'yellow')
 * @param {string} props.size - The size variant ('sm', 'md', 'lg')
 */
export default function ResultCard({ label, value, color = 'blue', size = 'md' }) {
  // Color mapping for different color schemes
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      label: 'text-green-600',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      label: 'text-red-600',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      label: 'text-blue-600',
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      label: 'text-yellow-600',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      label: 'text-purple-600',
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      label: 'text-gray-600',
    },
  };

  // Size mapping for different size variants
  const sizeClasses = {
    sm: {
      container: 'p-3',
      label: 'text-xs',
      value: 'text-xl',
    },
    md: {
      container: 'p-4',
      label: 'text-sm',
      value: 'text-2xl',
    },
    lg: {
      container: 'p-6',
      label: 'text-base',
      value: 'text-3xl',
    },
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;
  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`
        rounded-lg border-2
        ${selectedColor.bg}
        ${selectedColor.border}
        ${selectedSize.container}
      `}
    >
      <div className={selectedSize.label}>
        <span className={`font-medium ${selectedColor.label}`}>{label}</span>
      </div>
      <div className={selectedSize.value}>
        <span className={`font-bold ${selectedColor.text}`}>{value}</span>
      </div>
    </div>
  );
}
