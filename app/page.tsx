'use client';

import React from 'react';
import { useArbitrageCalc } from '../hooks/useArbitrageCalc';
import RatesPanel from '../components/RatesPanel';
import RatesPanelProyecciones from '../components/RatesPanelProyecciones';
import ResultsGrid from '../components/ResultsGrid';
import SecondaryMetrics from '../components/SecondaryMetrics';
import CycleBreakdown from '../components/CycleBreakdown';
import MultiCycleTable from '../components/MultiCycleTable';
import HistoryModal from '../components/HistoryModal';
import { useDebounce } from '../hooks/useDebounce';

export default function Home() {
  const {
    inputs,
    updateInput,
    reset,
    singleCycleResult,
    multiCycleResults,
    isValid,
    history,
    addToHistory,
    clearHistory,
    activeTab,
    setActiveTab,
    gananciaObjetivoUSD,
    setGananciaObjetivoUSD,
    proyeccionResult
  } = useArbitrageCalc();

  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [showHistoryButton, setShowHistoryButton] = React.useState(false);

  const debouncedInputs = useDebounce(inputs, 2000);

  React.useEffect(() => {
    if (debouncedInputs !== inputs) {
      addToHistory();
      setShowHistoryButton(true);
    }
  }, [debouncedInputs, addToHistory, inputs]);

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

  const handleFeeChange = (key: string, value: number) => {
    updateInput(key, value);
  };

  const handleGananciaObjetivoChange = (value: number) => {
    setGananciaObjetivoUSD(value);
  };

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-zinc-100">
              Calculadora P2P
            </h1>
            {showHistoryButton && (
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="px-3 py-1 text-sm font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
              >
                Historial
              </button>
            )}
          </div>
          <p className="text-zinc-400">
            Calcula arbitraje entre tasas de cambio digitales y P2P
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <RatesPanel
                rates={rates}
                setField={handleFieldChange}
                reset={reset}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                feeBDV={inputs.feeBDV}
                feeBpay={inputs.feeBpay}
                onFeeChange={handleFeeChange}
              />
            </div>

            {activeTab === 'proyecciones' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <RatesPanelProyecciones
                  gananciaObjetivoUSD={gananciaObjetivoUSD}
                  onChange={handleGananciaObjetivoChange}
                  proyeccionResult={proyeccionResult}
                  currentRates={{
                    tasaDigital: inputs.tasaDigital,
                    tasaP2P: inputs.tasaP2P
                  }}
                />
              </div>
            )}
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
                multiCycleResults={multiCycleResults}
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

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClear={clearHistory}
      />
    </main>
  );
}
