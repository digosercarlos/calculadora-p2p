import React from 'react';

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex border-b border-zinc-700 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            px-4 py-2 text-sm font-medium transition-colors
            ${activeTab === tab.id
              ? 'text-zinc-100 border-b-2 border-zinc-100'
              : 'text-zinc-400 hover:text-zinc-300 border-b-2 border-transparent'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
