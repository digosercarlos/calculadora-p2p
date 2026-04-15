'use client';

import { useArbitrageCalc } from '../hooks/useArbitrageCalc';
import RatesPanel from '../components/RatesPanel';
import ResultsGrid from '../components/ResultsGrid';
import SecondaryMetrics from '../components/SecondaryMetrics';
import CycleBreakdown from '../components/CycleBreakdown';
import MultiCycleTable from '../components/MultiCycleTable';

export default function Home() {
  const {
    inputs,
    updateInput,
    reset,
    singleCycleResult,
    multiCycleResults,
    isValid
  } = useArbitrageCalc();

  // Map inputs to the format expected by RatesPanel
  const rates = {
    tasaBCV: inputs.tasaBCV,
    tasaDigital: inputs.tasaDigital,
    tasaP2P: inputs.tasaP2P,
    capitalVES: inputs.capital,
    numCiclos: inputs.n
  };

  // Map RatesPanel's setField back to the hook's updateInput
  const handleFieldChange = (key: string, value: string | number) => {
    // Convert back to hook's property names
    const keyMap: Record<string, string> = {
      'tasaBCV': 'tasaBCV',
      'tasaDigital': 'tasaDigital',
      'tasaP2P': 'tasaP2P',
      'capitalVES': 'capital',
      'numCiclos': 'n'
    };

    const hookKey = keyMap[key] || key;
    let parsedValue: number = typeof value === 'number' ? value : 0;

    // Parse numeric values
    if (key === 'numCiclos') {
      parsedValue = parseInt(String(value), 10);
    } else if (typeof value === 'string') {
      // Remove formatting for numeric inputs
      const cleanValue = value.replace(/[.,\s]/g, '');
      parsedValue = parseFloat(cleanValue) || 0;
    }

    updateInput(hookKey, parsedValue);
  };

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-zinc-100 mb-2">
            Calculadora P2P
          </h1>
          <p className="text-zinc-400">
            Calcula arbitraje entre tasas de cambio digitales y P2P
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <RatesPanel
                rates={rates}
                setField={handleFieldChange}
                reset={reset}
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Results Grid */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">
                Resultados del Ciclo
              </h2>
              <ResultsGrid
                singleCycleResult={singleCycleResult}
                isValid={isValid}
              />
            </div>

            {/* Secondary Metrics */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <SecondaryMetrics results={singleCycleResult} />
            </div>

            {/* Cycle Breakdown */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <CycleBreakdown
                results={singleCycleResult}
                inputs={inputs}
              />
            </div>

            {/* Multi-Cycle Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <MultiCycleTable
                cycles={multiCycleResults}
                numCiclos={inputs.n}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
