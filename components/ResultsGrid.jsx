import React from 'react';
import ResultCard from './ResultCard';
import { formatPct, formatVES, formatUSD } from '../lib/formatters';

/**
 * ResultsGrid Component
 *
 * Displays the main arbitrage metrics in a grid:
 * - Percentage gain (with semantic color)
 * - Gain in VES
 * - Gain in USD
 * - Capital multiplier
 * - Multi-cycle gain card (NEW)
 *
 * @param {Object} props
 * @param {Object|null} props.singleCycleResult - The calculated cycle result from useArbitrageCalc
 * @param {Array|null} props.multiCycleResults - Array of multi-cycle results
 * @param {boolean} props.isValid - Whether the inputs are valid
 */
export default function ResultsGrid({ singleCycleResult, multiCycleResults, isValid }) {
  // If not valid or no result, show placeholder cards
  if (!isValid || !singleCycleResult) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResultCard label="Ganancia %" value="—" color="neutral" size="lg" />
        <ResultCard label="Ganancia VES" value="—" color="neutral" size="md" />
        <ResultCard label="Ganancia USD" value="—" color="neutral" size="md" />
        <ResultCard label="Multiplicador" value="—" color="neutral" size="md" />
      </div>
    );
  }

  // Determine color based on profitability - new color scheme for dark theme
  const getColorForProfit = () => {
    if (singleCycleResult.gananciaPct > 5) return 'profit-green';
    if (singleCycleResult.gananciaPct > 0) return 'profit-blue';
    if (singleCycleResult.gananciaPct > -2) return 'profit-yellow';
    return 'profit-red';
  };

  const getMultiCycleColor = () => {
    const lastCycle = multiCycleResults?.[multiCycleResults.length - 1];
    if (!lastCycle) return 'neutral';
    if (lastCycle.gananciaAcumuladaVES > 0) return 'profit-green';
    return 'profit-red';
  };

  const profitColor = getColorForProfit();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Main metric: Percentage gain */}
      <ResultCard
        label="Ganancia %"
        value={formatPct(singleCycleResult.gananciaPct)}
        color={profitColor}
        size="lg"
      />

      {/* Gain in VES */}
      <ResultCard
        label="Ganancia VES"
        value={formatVES(singleCycleResult.gananciaVES)}
        color={profitColor}
        size="md"
      />

      {/* Gain in USD */}
      <ResultCard
        label="Ganancia USD"
        value={formatUSD(singleCycleResult.gananciaUSD)}
        color={profitColor}
        size="md"
      />

      {/* Capital multiplier */}
      <ResultCard
        label="Multiplicador"
        value={singleCycleResult.multiplicador.toFixed(4) + 'x'}
        color="neutral"
        size="md"
      />

      {/* NEW: Multi-cycle gain card */}
      {multiCycleResults && multiCycleResults.length > 0 && (
        <ResultCard
          label="Ganancia N Ciclos"
          value={formatVES(multiCycleResults[multiCycleResults.length - 1].gananciaAcumuladaVES)}
          subvalue={formatUSD(multiCycleResults[multiCycleResults.length - 1].gananciaAcumuladaUSD)}
          color={getMultiCycleColor()}
          size="lg"
          span={2}
        />
      )}
    </div>
  );
}
