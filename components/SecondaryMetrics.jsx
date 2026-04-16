import { formatUSD, formatVES, formatPct } from '../lib/formatters.js';

export default function SecondaryMetrics({ results }) {
  if (!results) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Métricas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-zinc-500 text-sm h-5 w-24 animate-pulse bg-zinc-800 rounded"></div>
              <div className="text-zinc-700 text-lg font-mono mt-1 h-6 w-32 animate-pulse bg-zinc-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'USD neto (BDV)',
      value: formatUSD(results.usdNeto),
      color: 'neutral',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'USDT neto (Bpay)',
      value: formatUSD(results.usdtNeto),
      color: 'neutral',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      label: 'VES finales',
      value: formatVES(results.vesFinales),
      color: results.esRentable ? 'profit-green' : 'profit-red',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: 'Spread P2P vs Digital',
      value: formatPct(results.spreadPct),
      color: results.spreadPct > 0 ? 'profit-green' : 'profit-red',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: 'Comisión total',
      value: `${formatUSD(results.comisionTotalUSD)} / ${formatVES(results.comisionTotalVES)}`,
      color: 'profit-yellow',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: 'Break-even P2P',
      value: formatVES(results.breakEvenP2P),
      color: 'neutral',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  // Color mapping for semantic colors
  const colorClasses = {
    'profit-green': {
      bg: 'bg-emerald-950/30',
      border: 'border-emerald-700',
      hover: 'hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-900/20'
    },
    'profit-red': {
      bg: 'bg-red-950/30',
      border: 'border-red-700',
      hover: 'hover:border-red-600 hover:shadow-lg hover:shadow-red-900/20'
    },
    'profit-blue': {
      bg: 'bg-blue-950/30',
      border: 'border-blue-700',
      hover: 'hover:border-blue-600 hover:shadow-lg hover:shadow-blue-900/20'
    },
    'profit-yellow': {
      bg: 'bg-amber-950/30',
      border: 'border-amber-700',
      hover: 'hover:border-amber-600 hover:shadow-lg hover:shadow-amber-900/20'
    },
    neutral: {
      bg: 'bg-zinc-900',
      border: 'border-zinc-700',
      hover: 'hover:border-zinc-600 hover:shadow-lg hover:shadow-zinc-900/20'
    },
  };

  // Text color mapping
  const textColors = {
    'profit-green': 'text-emerald-400',
    'profit-red': 'text-red-400',
    'profit-blue': 'text-blue-400',
    'profit-yellow': 'text-amber-400',
    neutral: 'text-zinc-400',
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Métricas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {metrics.map((metric, index) => {
          const colorClass = colorClasses[metric.color] || colorClasses.neutral;
          const textColor = textColors[metric.color] || textColors.neutral;

          return (
            <div
              key={index}
              className={`
                bg-zinc-900 rounded-lg p-4 transition-all duration-200
                ${colorClass.bg}
                ${colorClass.border}
                ${colorClass.hover}
              `}
            >
              <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                {metric.icon}
                <span>{metric.label}</span>
              </div>
              <div className={`${textColor} text-lg font-mono font-semibold`}>
                {metric.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
