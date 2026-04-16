import React from 'react';
import Tabs from './Tabs';

export default function RatesPanel({ rates, setField, reset, activeTab, onTabChange, feeBDV, feeBpay, onFeeChange }) {
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

      <Tabs
        tabs={[
          { id: 'normal', label: 'Normal' },
          { id: 'proyecciones', label: 'Proyecciones' }
        ]}
        activeTab={activeTab}
        onChange={onTabChange}
      />

      {/* Tab Normal content */}
      {activeTab === 'normal' && (
        <div className="space-y-3">
          {/* Configuración de Comisiones */}
          <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/50 space-y-3">
            <h3 className="text-sm font-medium text-zinc-400">
              Configuración de Comisiones
            </h3>

            <div>
              <label htmlFor="feeBDV" className="block text-sm font-medium text-zinc-400 mb-1">
                Comisión BDV (2.85% predet.)
              </label>
              <input
                type="number"
                id="feeBDV"
                inputMode="decimal"
                step="0.01"
                min="0"
                max="10"
                value={(feeBDV * 100).toFixed(2)}
                onChange={(e) => onFeeChange('feeBDV', parseFloat(e.target.value) / 100)}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="feeBpay" className="block text-sm font-medium text-zinc-400 mb-1">
                Comisión Bpay (3.74% predet.)
              </label>
              <input
                type="number"
                id="feeBpay"
                inputMode="decimal"
                step="0.01"
                min="0"
                max="10"
                value={(feeBpay * 100).toFixed(2)}
                onChange={(e) => onFeeChange('feeBpay', parseFloat(e.target.value) / 100)}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

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
      )}

      {/* Tab Proyecciones content */}
      {activeTab === 'proyecciones' && (
        <RatesPanelProyecciones />
      )}
    </div>
  );
}

// Placeholder for the projections panel - will be implemented in separate component
function RatesPanelProyecciones() {
  return (
    <div className="space-y-4">
      <p className="text-zinc-500 text-sm">
        Las proyecciones de capital inversa se mostrarán aquí.
      </p>
    </div>
  );
}

export { default as RatesPanelProyecciones } from './RatesPanelProyecciones';
