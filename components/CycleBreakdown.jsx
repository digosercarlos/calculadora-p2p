import React, { useState } from 'react';
import { formatVES, formatUSD } from '../lib/formatters.js';

/**
 * CycleBreakdown Component
 *
 * Displays an expandable step-by-step breakdown of the arbitrage cycle.
 * Shows each step with calculations, fees, and intermediate results.
 *
 * @param {Object} props
 * @param {Object|null} props.results - The single cycle calculation results
 * @param {Object} props.inputs - The input values used for calculations
 */
export default function CycleBreakdown({ results, inputs }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!results) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Desglose del Ciclo
          </h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 animate-pulse bg-zinc-800 rounded"></div>
                <div className="h-3 w-48 animate-pulse bg-zinc-800 rounded"></div>
                <div className="h-3 w-40 animate-pulse bg-zinc-800 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const feeBDVPct = (inputs.feeBDV * 100).toFixed(2);
  const feeBpayPct = (inputs.feeBpay * 100).toFixed(2);

  const steps = [
    {
      title: 'Paso 1: VES → USD Digital (BDV)',
      operations: [
        {
          label: 'Capital inicial',
          value: formatVES(inputs.capital),
          type: 'initial',
        },
        {
          label: `÷ Tasa Digital (${formatVES(inputs.tasaDigital)})`,
          value: formatUSD(results.usdBruto),
          type: 'operation',
        },
        {
          label: `- Comisión BDV (${feeBDVPct}%)`,
          value: `-${formatUSD(results.comisionBDV_USD)}`,
          type: 'fee',
        },
        {
          label: '→ USD neto',
          value: formatUSD(results.usdNeto),
          type: 'result',
        },
      ],
    },
    {
      title: 'Paso 2: USD Digital → USDT (Bpay)',
      operations: [
        {
          label: 'USD neto',
          value: formatUSD(results.usdNeto),
          type: 'initial',
        },
        {
          label: `- Comisión Bpay (${feeBpayPct}%)`,
          value: `-${formatUSD(results.comisionBpay_USDT)}`,
          type: 'fee',
        },
        {
          label: '→ USDT neto',
          value: formatUSD(results.usdtNeto),
          type: 'result',
        },
      ],
    },
    {
      title: 'Paso 3: USDT → VES (P2P)',
      operations: [
        {
          label: 'USDT neto',
          value: formatUSD(results.usdtNeto),
          type: 'initial',
        },
        {
          label: `× Tasa P2P (${formatVES(inputs.tasaP2P)})`,
          value: formatVES(results.vesFinales),
          type: 'operation',
        },
        {
          label: results.esRentable ? '→ GANANCIA' : '→ PÉRDIDA',
          value: results.esRentable
            ? `+${formatVES(results.gananciaVES)}`
            : `${formatVES(results.gananciaVES)}`,
          type: results.esRentable ? 'profit' : 'loss',
        },
      ],
    },
  ];

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left group"
        aria-expanded={isExpanded}
      >
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
          Desglose del Ciclo
        </h3>
        <svg
          className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="divide-y divide-zinc-800">
            {steps.map((step, stepIndex) => (
              <div key={stepIndex} className="p-4 last:pb-4">
                <h4 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-zinc-700 rounded-full text-xs">
                    {stepIndex + 1}
                  </span>
                  {step.title}
                </h4>
                <div className="ml-8 space-y-2">
                  {step.operations.map((op, opIndex) => {
                    const typeStyles = {
                      initial: 'text-zinc-500',
                      operation: 'text-zinc-400',
                      fee: 'text-amber-500',
                      result: 'text-emerald-400 font-medium',
                      profit: 'text-emerald-400 font-bold',
                      loss: 'text-red-400 font-bold',
                    };

                    return (
                      <div
                        key={opIndex}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <span className={typeStyles[op.type]}>{op.label}</span>
                        <span className={`font-mono ${typeStyles[op.type]}`}>
                          {op.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="p-4 bg-zinc-800/50 border-t border-zinc-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-500 block mb-1">Comisión total pagada</span>
                <span className="text-zinc-300 font-mono">
                  {formatUSD(results.comisionTotalUSD)} /{' '}
                  {formatVES(results.comisionTotalVES)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block mb-1">Resultado neto</span>
                <span
                  className={`font-mono font-bold ${
                    results.esRentable ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {results.esRentable ? '+' : ''}
                  {formatVES(results.gananciaVES)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
