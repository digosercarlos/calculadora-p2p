import React from 'react';
import { formatVES, formatPct } from '../lib/formatters';

export default function RatesPanelProyecciones({ gananciaObjetivoUSD, onChange, proyeccionResult, currentRates }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-zinc-100">
        Proyección de Capital
      </h3>

      <div>
        <label htmlFor="gananciaObjetivo" className="block text-sm font-medium text-zinc-400 mb-1">
          Ganancia Objetivo (USD)
        </label>
        <input
          type="number"
          id="gananciaObjetivo"
          inputMode="decimal"
          step="0.01"
          min="1"
          value={gananciaObjetivoUSD}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder="50.00"
          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-500 transition-all"
        />
      </div>

      {proyeccionResult?.error ? (
        <div className="bg-red-950/30 border border-red-700 rounded-lg p-4">
          <div className="text-sm text-red-400">{proyeccionResult.error}</div>
        </div>
      ) : proyeccionResult?.capitalRequerido && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 space-y-3">
          <div>
            <div className="text-sm text-zinc-400 mb-1">
              Capital Requerido:
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {formatVES(proyeccionResult.capitalRequerido)}
            </div>
          </div>

          {currentRates && (
            <div className="space-y-1 text-sm text-zinc-500 pt-2 border-t border-zinc-800">
              <div>• Tasa Digital: {currentRates.tasaDigital?.toFixed(2)} VES/USD</div>
              <div>• Tasa P2P: {currentRates.tasaP2P?.toFixed(2)} VES/USDT</div>
              <div>• Spread: {formatPct(proyeccionResult.gananciaPct)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
