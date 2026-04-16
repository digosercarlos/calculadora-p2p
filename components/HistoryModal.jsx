import React from 'react';
import Modal from './Modal';
import { formatVES, formatUSD, formatPct } from '../lib/formatters';

function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatShort(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }
  return value.toLocaleString('es-VE', { maximumFractionDigits: 0 });
}

export default function HistoryModal({ isOpen, onClose, history, onClear }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-zinc-100">
            Historial de Operaciones
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors text-lg"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            No hay operaciones en el historial
          </div>
        ) : (
          <div className="overflow-y-auto max-h-96 border border-zinc-700 rounded-lg">
            <table className="w-full">
              <thead className="bg-zinc-800 sticky top-0">
                <tr className="border-b border-zinc-700">
                  <th className="text-left text-zinc-400 py-2 px-3 text-xs font-semibold uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-left text-zinc-400 py-2 px-3 text-xs font-semibold uppercase tracking-wider">
                    Capital
                  </th>
                  <th className="text-left text-zinc-400 py-2 px-3 text-xs font-semibold uppercase tracking-wider">
                    Spread
                  </th>
                  <th className="text-left text-zinc-400 py-2 px-3 text-xs font-semibold uppercase tracking-wider">
                    Ganancia %
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <tr
                    key={index}
                    className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="text-zinc-300 py-2 px-3 text-sm">
                      {formatTimestamp(record.timestamp)}
                    </td>
                    <td className="text-zinc-300 py-2 px-3 text-sm font-mono">
                      {formatShort(record.inputs.capital)}
                    </td>
                    <td className="py-2 px-3 text-sm font-mono">
                      <span className={record.results.gananciaPct > 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {formatPct(record.results.gananciaPct)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm font-mono">
                      <span className={record.results.gananciaPct > 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {record.results.gananciaPct > 0 ? '+' : ''}{formatPct(record.results.gananciaPct)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Limpiar Historial
            </button>
          )}
          <div className="text-xs text-zinc-500">
            {history.length} / 20 registros
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
