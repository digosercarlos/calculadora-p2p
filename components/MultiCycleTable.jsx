import { formatVES, formatUSD } from '../lib/formatters.js';

/**
 * MultiCycleTable Component
 *
 * Displays a table showing the progression of N cycles with compounding.
 * Each cycle reinvests the VES from the previous cycle.
 *
 * @param {Object} props
 * @param {Array|null} props.cycles - Array of cycle objects from calcMultiCycles
 * @param {number} props.numCiclos - Number of cycles to display (for loading state)
 */
export default function MultiCycleTable({ cycles, numCiclos = 1 }) {
  // Loading state - show skeleton
  if (!cycles) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Multi-Ciclo ({numCiclos} ciclos)
        </h3>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              {/* Header skeleton */}
              <div className="grid grid-cols-5 gap-4 p-3 bg-zinc-800 border-b border-zinc-700">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 w-16 bg-zinc-700 rounded animate-pulse"></div>
                ))}
              </div>
              {/* Row skeletons */}
              {[...Array(Math.min(numCiclos, 3))].map((_, i) => (
                <div key={i} className="grid grid-cols-5 gap-4 p-3 border-b border-zinc-800">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-6 w-24 bg-zinc-800 rounded animate-pulse"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (cycles.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Multi-Ciclo ({numCiclos} ciclos)
        </h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
          <p className="text-zinc-500">No hay datos para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Multi-Ciclo ({numCiclos} ciclo{numCiclos !== 1 ? 's' : ''})
      </h3>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 p-3 bg-zinc-800 border-b border-zinc-700">
              <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Ciclo
              </div>
              <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Capital Entrada
              </div>
              <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                VES Finales
              </div>
              <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Ganancia Ciclo
              </div>
              <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Ganancia Acumulada
              </div>
            </div>

            {/* Table Body */}
            <div>
              {cycles.map((cycle) => (
                <div
                  key={cycle.n}
                  className={`
                    grid grid-cols-5 gap-4 p-3 border-b border-zinc-800
                    ${cycle.n % 2 === 0 ? 'bg-zinc-900/50' : 'bg-zinc-900'}
                    hover:bg-zinc-800 transition-colors
                  `}
                >
                  {/* Cycle Number */}
                  <div className="text-sm font-medium text-zinc-400 flex items-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-700 text-zinc-300 text-xs font-bold mr-2">
                      {cycle.n}
                    </span>
                  </div>

                  {/* Capital Entrada */}
                  <div className="text-sm text-zinc-300 font-mono">
                    {formatVES(cycle.capitalEntrada)}
                  </div>

                  {/* VES Finales */}
                  <div className="text-sm text-zinc-100 font-mono font-medium">
                    {formatVES(cycle.vesFinales)}
                  </div>

                  {/* Ganancia Ciclo */}
                  <div
                    className={`text-sm font-mono font-medium ${
                      cycle.gananciaCicloVES >= 0
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {cycle.gananciaCicloVES >= 0 ? '+' : ''}
                    {formatVES(cycle.gananciaCicloVES)}
                  </div>

                  {/* Ganancia Acumulada */}
                  <div className="space-y-0.5">
                    <div
                      className={`text-sm font-mono font-medium ${
                        cycle.gananciaAcumuladaVES >= 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {cycle.gananciaAcumuladaVES >= 0 ? '+' : ''}
                      {formatVES(cycle.gananciaAcumuladaVES)}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">
                      {cycle.gananciaAcumuladaUSD >= 0 ? '+' : ''}
                      {formatUSD(cycle.gananciaAcumuladaUSD)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with totals */}
            <div className="bg-zinc-800/50 border-t border-zinc-700 p-3">
              <div className="grid grid-cols-5 gap-4">
                <div></div>
                <div></div>
                <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                  Total Final
                </div>
                <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                  Ganancia Total
                </div>
                <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                  Acumulado Final
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4 mt-1">
                <div></div>
                <div></div>
                <div className="text-sm text-zinc-100 font-mono font-semibold">
                  {formatVES(cycles[cycles.length - 1].vesFinales)}
                </div>
                <div className="text-sm text-zinc-400 font-mono">
                  {cycles.reduce((sum, c) => sum + c.gananciaCicloVES, 0).toLocaleString('es-VE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} VES
                </div>
                <div>
                  <div
                    className={`text-sm font-mono font-semibold ${
                      cycles[cycles.length - 1].gananciaAcumuladaVES >= 0
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {cycles[cycles.length - 1].gananciaAcumuladaVES >= 0 ? '+' : ''}
                    {formatVES(cycles[cycles.length - 1].gananciaAcumuladaVES)}
                  </div>
                  <div className="text-xs text-zinc-500 font-mono">
                    {cycles[cycles.length - 1].gananciaAcumuladaUSD >= 0 ? '+' : ''}
                    {formatUSD(cycles[cycles.length - 1].gananciaAcumuladaUSD)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 text-xs text-zinc-500 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          El capital se reinvierte automáticamente en cada ciclo. Los resultados muestran
          el crecimiento compuesto del capital inicial.
        </p>
      </div>
    </div>
  );
}
