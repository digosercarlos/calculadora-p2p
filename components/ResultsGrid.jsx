import React from 'react';
import ResultCard from './ResultCard';
import { formatPct, formatVES, formatUSD } from '../lib/formatters';

/**
 * ResultsGrid Component
 *
 * Displays the 4 main arbitrage metrics in a 2x2 grid:
 * - Percentage gain (with semantic color)
 * - Gain in VES
 * - Gain in USD
 * - Capital multiplier
 *
 * @param {Object} props
 * @param {Object|null} props.singleCycleResult - The calculated cycle result from useArbitrageCalc
 * @param {boolean} props.isValid - Whether the inputs are valid
 */
export default function ResultsGrid({ singleCycleResult, isValid }) {
  // If not valid or no result, show placeholder cards
  if (!isValid || !singleCycleResult) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResultCard label="Ganancia %" value="—" color="gray" size="lg" />
        <ResultCard label="Ganancia VES" value="—" color="gray" size="md" />
        <ResultCard label="Ganancia USD" value="—" color="gray" size="md" />
        <ResultCard label="Multiplicador" value="—" color="gray" size="md" />
      </div>
    );
  }

  // Determine color based on profitability
  const getColorForProfit = () => {
    if (singleCycleResult.gananciaPct > 5) return 'green';
    if (singleCycleResult.gananciaPct > 0) return 'blue';
    if (singleCycleResult.gananciaPct > -2) return 'yellow';
    return 'red';
  };

  const profitColor = getColorForProfit();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        color="blue"
        size="md"
      />
    </div>
  );
}
