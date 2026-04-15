import React from 'react';

export default function RatesPanel({ rates, setField, reset }) {
  const handleInputChange = (key, value) => {
    setField(key, value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Tasas del Día</h2>
        <button
          onClick={reset}
          className="px-3 py-1 text-sm font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
        >
          Resetear
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="tasaBCV" className="block text-sm font-medium text-zinc-400 mb-1">
            Tasa BCV (VES/USD)
          </label>
          <input
            type="text"
            id="tasaBCV"
            inputMode="decimal"
            value={rates.tasaBCV}
            onChange={(e) => handleInputChange('tasaBCV', e.target.value)}
            placeholder="91.45"
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="tasaDigital" className="block text-sm font-medium text-zinc-400 mb-1">
            Tasa VES Digital (VES/USD)
          </label>
          <input
            type="text"
            id="tasaDigital"
            inputMode="decimal"
            value={rates.tasaDigital}
            onChange={(e) => handleInputChange('tasaDigital', e.target.value)}
            placeholder="92.50"
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="tasaP2P" className="block text-sm font-medium text-zinc-400 mb-1">
            Tasa Binance P2P (VES/USDT)
          </label>
          <input
            type="text"
            id="tasaP2P"
            inputMode="decimal"
            value={rates.tasaP2P}
            onChange={(e) => handleInputChange('tasaP2P', e.target.value)}
            placeholder="97.80"
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="capitalVES" className="block text-sm font-medium text-zinc-400 mb-1">
            Capital a trabajar (VES)
          </label>
          <input
            type="text"
            id="capitalVES"
            inputMode="decimal"
            value={rates.capitalVES}
            onChange={(e) => handleInputChange('capitalVES', e.target.value)}
            placeholder="1.000.000"
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="numCiclos" className="block text-sm font-medium text-zinc-400 mb-1">
            Número de ciclos (1-20)
          </label>
          <input
            type="number"
            id="numCiclos"
            inputMode="numeric"
            min="1"
            max="20"
            value={rates.numCiclos}
            onChange={(e) => {
              const value = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
              handleInputChange('numCiclos', value);
            }}
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-center py-2">
        <p className="text-sm text-zinc-500">
          Consulta las tasas del día en{' '}
          <a
            href="https://instagram.com/monitordolarvzla"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            @monitordolarvzla
          </a>
        </p>
      </div>
    </div>
  );
}
