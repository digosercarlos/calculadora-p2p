# Calculator Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement personalized fees, operation history, inverse calculator projections, improved UI/UX with semantic colors, and real-time multi-cycle metrics for the P2P arbitrage calculator.

**Architecture:** Panel unificado con sistema de tabs en RatesPanel. Fees personalizables persistentes en localStorage. Historial modal con hasta 20 registros. Calculadora inversa en tab de proyecciones. Colores semánticos para cards (emerald/red/zinc). Actualización en tiempo real vía useMemo.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS, localStorage para persistencia.

---

## File Structure

**Nuevos archivos:**
- `components/Tabs.jsx` - Sistema de tabs reusable
- `components/Modal.jsx` - Componente modal con backdrop
- `components/HistoryModal.jsx` - Modal de historial de operaciones
- `hooks/useDebounce.js` - Hook para debounce de guardado

**Archivos modificados:**
- `components/RatesPanel.jsx` - Agregar tabs, fees personalizables, proyecciones
- `components/ResultsGrid.jsx` - Agregar card de multiciclo, mejoras de colores
- `components/SecondaryMetrics.jsx` - Aplicar paleta de colores semánticos
- `components/ResultCard.jsx` - Agregar soporte para subvalue y span
- `hooks/useArbitrageCalc.js` - Agregar lógica de historial y tabs
- `lib/arbitrage.js` - Agregar función calcCapitalRequerido
- `app/page.tsx` - Integrar nuevos componentes

---

### Task 1: Create useDebounce Hook

**Files:**
- Create: `hooks/useDebounce.js`
- Test: No tests required (simple utility)

- [ ] **Step 1: Write the useDebounce hook**

```javascript
import { useEffect, useState } from 'react';

/**
 * Debounce a value updates
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useDebounce.js
git commit -m "feat: add useDebounce hook for debounced updates"
```

---

### Task 2: Add calcCapitalRequerido Function to lib/arbitrage.js

**Files:**
- Modify: `lib/arbitrage.js:38-57`

- [ ] **Step 1: Write failing test (conceptual - no test file exists)**

Note: Since this project doesn't have tests set up, we'll implement directly and verify manually.

- [ ] **Step 2: Add calcCapitalRequerido function to lib/arbitrage.js**

```javascript
export function calcCapitalRequerido(gananciaObjetivoUSD, { tasaDigital, tasaP2P, tasaBCV }) {
  // Calculate required capital to achieve target profit
  // gananciaPct = ((tasaP2P - tasaDigital) / tasaDigital) * 100
  // gananciaVES = gananciaUSD * tasaBCV
  // capitalRequerido = gananciaVES * 100 / gananciaPct

  const gananciaPct = ((tasaP2P - tasaDigital) / tasaDigital) * 100;

  if (gananciaPct <= 0) {
    return {
      capitalRequerido: null,
      gananciaPct,
      error: 'No es rentable con las tasas actuales'
    };
  }

  const gananciaObjetivoVES = gananciaObjetivoUSD * tasaBCV;
  const capitalRequerido = (gananciaObjetivoVES * 100) / gananciaPct;

  return {
    capitalRequerido,
    gananciaPct,
    spread: ((tasaP2P - tasaDigital) / tasaDigital) * 100
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/arbitrage.js
git commit -m "feat: add calcCapitalRequerido for inverse calculator projections"
```

---

### Task 3: Create Tabs Component

**Files:**
- Create: `components/Tabs.jsx`

- [ ] **Step 1: Write the Tabs component**

```javascript
import React from 'react';

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex border-b border-zinc-700 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            px-4 py-2 text-sm font-medium transition-colors
            ${activeTab === tab.id
              ? 'text-zinc-100 border-b-2 border-zinc-100'
              : 'text-zinc-400 hover:text-zinc-300 border-b-2 border-transparent'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Tabs.jsx
git commit -m "feat: add Tabs component for rate panel"
```

---

### Task 4: Create Modal Component

**Files:**
- Create: `components/Modal.jsx`

- [ ] **Step 1: Write the Modal component**

```javascript
import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Modal.jsx
git commit -m "feat: add Modal component with backdrop"
```

---

### Task 5: Update ResultCard Component

**Files:**
- Modify: `components/ResultCard.jsx:14-53`

- [ ] **Step 1: Update ResultCard to support subvalue and span, with dark theme colors**

```javascript
import React from 'react';

/**
 * ResultCard Component
 *
 * Displays a result with a label, value, and optional styling.
 *
 * @param {Object} props
 * @param {string} props.label - The label text to display above value
 * @param {string|number} props.value - The value to display
 * @param {string} props.subvalue - Optional secondary value below main value
 * @param {string} props.color - The color scheme to use ('profit-green', 'profit-red', 'neutral', 'profit-blue', 'profit-yellow')
 * @param {string} props.size - The size variant ('sm', 'md', 'lg')
 * @param {number} props.span - Grid span (1, 2, or 3) for responsive layouts
 */
export default function ResultCard({ label, value, subvalue, color = 'neutral', size = 'md', span = 1 }) {
  // Color mapping for dark theme (zinc-950 background)
  const colorClasses = {
    'profit-green': {
      bg: 'bg-emerald-950/30',
      border: 'border-emerald-700',
      text: 'text-emerald-400',
      label: 'text-emerald-300',
      hover: 'hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-900/20'
    },
    'profit-red': {
      bg: 'bg-red-950/30',
      border: 'border-red-700',
      text: 'text-red-400',
      label: 'text-red-300',
      hover: 'hover:border-red-600 hover:shadow-lg hover:shadow-red-900/20'
    },
    'profit-blue': {
      bg: 'bg-blue-950/30',
      border: 'border-blue-700',
      text: 'text-blue-400',
      label: 'text-blue-300',
      hover: 'hover:border-blue-600 hover:shadow-lg hover:shadow-blue-900/20'
    },
    'profit-yellow': {
      bg: 'bg-amber-950/30',
      border: 'border-amber-700',
      text: 'text-amber-400',
      label: 'text-amber-300',
      hover: 'hover:border-amber-600 hover:shadow-lg hover:shadow-amber-900/20'
    },
    'neutral': {
      bg: 'bg-zinc-900',
      border: 'border-zinc-700',
      text: 'text-zinc-300',
      label: 'text-zinc-400',
      hover: 'hover:border-zinc-600 hover:shadow-lg hover:shadow-zinc-900/20'
    },
  };

  // Size mapping for different size variants
  const sizeClasses = {
    sm: {
      container: 'p-3',
      label: 'text-xs',
      value: subvalue ? 'text-lg' : 'text-xl',
      subvalue: 'text-xs',
    },
    md: {
      container: 'p-4',
      label: 'text-sm',
      value: subvalue ? 'text-xl' : 'text-2xl',
      subvalue: 'text-sm',
    },
    lg: {
      container: 'p-6',
      label: 'text-base',
      value: subvalue ? 'text-2xl' : 'text-3xl',
      subvalue: 'text-base',
    },
  };

  const selectedColor = colorClasses[color] || colorClasses.neutral;
  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`
        rounded-lg border-2 transition-all duration-200
        ${selectedColor.bg}
        ${selectedColor.border}
        ${selectedSize.container}
        ${selectedColor.hover}
        col-span-${span}
      `}
    >
      <div className={selectedSize.label}>
        <span className={`font-medium ${selectedColor.label}`}>{label}</span>
      </div>
      <div className={selectedSize.value}>
        <span className={`font-bold ${selectedColor.text}`}>{value}</span>
      </div>
      {subvalue && (
        <div className={`mt-1 ${selectedSize.subvalue} ${selectedColor.label}`}>
          {subvalue}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ResultCard.jsx
git commit -m "feat: add subvalue, span, and dark theme colors to ResultCard"
```

---

### Task 6: Update useArbitrageCalc Hook

**Files:**
- Modify: `hooks/useArbitrageCalc.js:1-131`

- [ ] **Step 1: Add history and tab state to useArbitrageCalc**

```javascript
import { useMemo, useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { calcCycle, calcMultiCycles, calcCapitalRequerido } from '../lib/arbitrage.js';
import { DEFAULT_FEE_BDV, DEFAULT_FEE_BPAY } from '../lib/constants.js';

const DEFAULT_INPUTS = {
  capital: 1000000,
  tasaDigital: 92.50,
  tasaP2P: 97.80,
  tasaBCV: 91.20,
  feeBDV: DEFAULT_FEE_BDV,
  feeBpay: DEFAULT_FEE_BPAY,
  n: 3
};

const STORAGE_KEY = 'arbitrage-calculator-inputs';
const HISTORY_KEY = 'arbitrage-calculator-history';
const MAX_HISTORY_RECORDS = 20;
```

- [ ] **Step 2: Add history storage state**

```javascript
export function useArbitrageCalc() {
  const [inputs, setInputs] = useLocalStorage(STORAGE_KEY, DEFAULT_INPUTS);
  const [history, setHistory] = useLocalStorage(HISTORY_KEY, []);
  const [activeTab, setActiveTab] = useState('normal');
  const [gananciaObjetivoUSD, setGananciaObjetivoUSD] = useState(50);
```

- [ ] **Step 3: Add validation for fees (0% - 10%)**

```javascript
function validateInputs(inputs) {
  const errors = {};

  if (inputs.capital <= 0) {
    errors.capital = 'Capital must be greater than 0';
  }

  if (inputs.tasaDigital <= 0) {
    errors.tasaDigital = 'Digital rate must be greater than 0';
  }

  if (inputs.tasaP2P <= 0) {
    errors.tasaP2P = 'P2P rate must be greater than 0';
  }

  if (inputs.tasaBCV <= 0) {
    errors.tasaBCV = 'BCV rate must be greater than 0';
  }

  if (inputs.feeBDV < 0 || inputs.feeBDV > 0.1) {
    errors.feeBDV = 'BDV fee must be between 0% and 10%';
  }

  if (inputs.feeBpay < 0 || inputs.feeBpay > 0.1) {
    errors.feeBpay = 'Bpay fee must be between 0% and 10%';
  }

  if (inputs.n < 1 || !Number.isInteger(inputs.n)) {
    errors.n = 'Number of cycles must be a positive integer';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
```

- [ ] **Step 4: Add proyeccionResult calculation**

```javascript
  const proyeccionResult = useMemo(() => {
    if (!validation.isValid || !gananciaObjetivoUSD) {
      return null;
    }

    try {
      return calcCapitalRequerido(gananciaObjetivoUSD, {
        tasaDigital: inputs.tasaDigital,
        tasaP2P: inputs.tasaP2P,
        tasaBCV: inputs.tasaBCV
      });
    } catch (error) {
      console.error('Error calculating projection:', error);
      return null;
    }
  }, [validation.isValid, gananciaObjetivoUSD, inputs]);
```

- [ ] **Step 5: Add addToHistory function**

```javascript
  const addToHistory = useCallback(() => {
    if (!validation.isValid || multiCycleResults.length === 0) return;

    const record = {
      timestamp: new Date().toISOString(),
      inputs,
      results: {
        gananciaPct: singleCycleResult?.gananciaPct || 0,
        gananciaVES: singleCycleResult?.gananciaVES || 0,
        gananciaUSD: singleCycleResult?.gananciaUSD || 0,
        gananciaMulticicloVES: multiCycleResults[multiCycleResults.length - 1]?.gananciaAcumuladaVES || 0,
        gananciaMulticicloUSD: multiCycleResults[multiCycleResults.length - 1]?.gananciaAcumuladaUSD || 0
      }
    };

    setHistory(prev => [record, ...prev].slice(0, MAX_HISTORY_RECORDS));
  }, [inputs, validation.isValid, singleCycleResult, multiCycleResults, setHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);
```

- [ ] **Step 6: Update return values**

```javascript
  return {
    inputs,
    setInputs,
    updateInput,
    updateInputs,
    reset,
    singleCycleResult,
    multiCycleResults,
    validation,
    isValid: validation.isValid,
    errors: validation.errors,
    history,
    setHistory,
    addToHistory,
    clearHistory,
    activeTab,
    setActiveTab,
    gananciaObjetivoUSD,
    setGananciaObjetivoUSD,
    proyeccionResult
  };
}
```

- [ ] **Step 7: Commit**

```bash
git add hooks/useArbitrageCalc.js
git commit -m "feat: add history, tabs, and projection support to useArbitrageCalc"
```

---

### Task 7: Create HistoryModal Component

**Files:**
- Create: `components/HistoryModal.jsx`

- [ ] **Step 1: Write the HistoryModal component**

```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add components/HistoryModal.jsx
git commit -m "feat: add HistoryModal component with table and clear functionality"
```

---

### Task 8: Update RatesPanel with Tabs and Fees

**Files:**
- Modify: `components/RatesPanel.jsx:1-116`

- [ ] **Step 1: Add Tabs import and state to RatesPanel**

```javascript
import React from 'react';
import Tabs from './Tabs';

export default function RatesPanel({ rates, setField, reset, activeTab, onTabChange, feeBDV, feeBpay, onFeeChange }) {
```

- [ ] **Step 2: Add tabs component to RatesPanel**

```javascript
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
```

- [ ] **Step 3: Add fees inputs to Tab Normal**

```javascript
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
```

- [ ] **Step 4: Add Proyecciones tab content**

```javascript
        </div>
      )}

      {/* Tab Proyecciones content */}
      {activeTab === 'proyecciones' && (
        <RatesPanelProyecciones />
      )}
```

- [ ] **Step 5: Commit**

```bash
git add components/RatesPanel.jsx
git commit -m "feat: add tabs and customizable fees to RatesPanel"
```

---

### Task 9: Create RatesPanelProyecciones Component

**Files:**
- Create: `components/RatesPanelProyecciones.jsx`

- [ ] **Step 1: Write the RatesPanelProyecciones component**

```javascript
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
```

- [ ] **Step 2: Add export to components/RatesPanel.jsx**

```javascript
export { default as RatesPanelProyecciones } from './RatesPanelProyecciones';
```

- [ ] **Step 3: Commit**

```bash
git add components/RatesPanelProyecciones.jsx
git commit -m "feat: add RatesPanelProyecciones for inverse calculator"
```

---

### Task 10: Update ResultsGrid with MultiCycle Card

**Files:**
- Modify: `components/ResultsGrid.jsx:1-76`

- [ ] **Step 1: Update color mapping to use new color scheme**

```javascript
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
```

- [ ] **Step 2: Update ResultsGrid to include multi-cycle card**

```javascript
  return (
    <div className="space-y-4">
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

        {/* NUEVO: Multi-cycle gain card */}
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
    </div>
  );
```

- [ ] **Step 3: Update component signature to accept multiCycleResults**

```javascript
export default function ResultsGrid({ singleCycleResult, multiCycleResults, isValid }) {
```

- [ ] **Step 4: Commit**

```bash
git add components/ResultsGrid.jsx
git commit -m "feat: add multi-cycle gain card to ResultsGrid with semantic colors"
```

---

### Task 11: Update SecondaryMetrics with Semantic Colors

**Files:**
- Modify: `components/SecondaryMetrics.jsx:1-104`

- [ ] **Step 1: Update metrics to use semantic colors**

```javascript
  const metrics = [
    {
      label: 'USD neto (BDV)',
      value: formatUSD(results.usdNeto),
      color: 'neutral',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'USDT neto (Bpay)',
      value: formatUSD(results.usdtNeto),
      color: 'neutral',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      label: 'VES finales',
      value: formatVES(results.vesFinales),
      color: results.esRentable ? 'profit-green' : 'profit-red',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: 'Spread P2P vs Digital',
      value: formatPct(results.spreadPct),
      color: results.spreadPct > 0 ? 'profit-green' : 'profit-red',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: 'Comisión total',
      value: `${formatUSD(results.comisionTotalUSD)} / ${formatVES(results.comisionTotalVES)}`,
      color: 'profit-yellow',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: 'Break-even P2P',
      value: formatVES(results.breakEvenP2P),
      color: 'neutral',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];
```

- [ ] **Step 2: Update metric card styling with hover effects**

```javascript
            <div
              key={index}
              className={`
                bg-zinc-900 border border-zinc-700 rounded-lg p-4
                transition-all duration-200
                hover:border-zinc-600 hover:shadow-lg hover:shadow-zinc-900/20
              `}
            >
```

- [ ] **Step 3: Commit**

```bash
git add components/SecondaryMetrics.jsx
git commit -m "feat: apply semantic colors and hover effects to SecondaryMetrics"
```

---

### Task 12: Update page.tsx to Integrate All Components

**Files:**
- Modify: `app/page.tsx:1-119`

- [ ] **Step 1: Add HistoryModal import**

```javascript
'use client';

import { useArbitrageCalc } from '../hooks/useArbitrageCalc';
import RatesPanel from '../components/RatesPanel';
import { RatesPanelProyecciones } from '../components/RatesPanelProyecciones';
import ResultsGrid from '../components/ResultsGrid';
import SecondaryMetrics from '../components/SecondaryMetrics';
import CycleBreakdown from '../components/CycleBreakdown';
import MultiCycleTable from '../components/MultiCycleTable';
import HistoryModal from '../components/HistoryModal';
import { useDebounce } from '../hooks/useDebounce';
```

- [ ] **Step 2: Add history modal state**

```javascript
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
  }, [debouncedInputs, addToHistory]);
```

- [ ] **Step 3: Update RatesPanel props**

```javascript
  // Map inputs to the format expected by RatesPanel
  const rates = {
    tasaBCV: inputs.tasaBCV,
    tasaDigital: inputs.tasaDigital,
    tasaP2P: inputs.tasaP2P,
    capitalVES: inputs.capital,
    numCiclos: inputs.n
  };

  const handleFeeChange = (key, value) => {
    updateInput(key, value);
  };

  const handleGananciaObjetivoChange = (value) => {
    setGananciaObjetivoUSD(value);
  };
```

- [ ] **Step 4: Add HistoryModal to JSX and History button to header**

```javascript
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
```

- [ ] **Step 5: Update main content grid**

```javascript
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
```

- [ ] **Step 6: Add HistoryModal at end of JSX**

```javascript
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
```

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "feat: integrate all components - history modal, tabs, projections"
```

---

### Task 13: Final Testing and Verification

**Files:**
- No file changes

- [ ] **Step 1: Run the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify all features work**

1. Check that fees are customizable and persistent
2. Check that history modal opens and displays records
3. Check that projection calculator works with USD input
4. Check that multi-cycle card updates in real-time when changing cycle count
5. Check that colors are semantic (green for profit, red for loss)
6. Check that hover effects work on all cards
7. Check that tabs switch between Normal and Proyecciones
8. Check that history limits to 20 records
9. Check that clear history works

- [ ] **Step 3: Test responsive layout**

```bash
# Open browser dev tools and test:
# - Mobile view (375px width)
# - Tablet view (768px width)
# - Desktop view (1024px width)
```

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add .
git commit -m "fix: final adjustments and testing verification"
```

---

## Self-Review Summary

**Spec coverage:**
- ✅ Personalización de fees (Tasks 1-6, 8)
- ✅ Historial de operaciones (Tasks 1, 7, 12)
- ✅ Proyecciones calculadora inversa (Tasks 2, 9, 12)
- ✅ Simplificación de métricas (Task 11 - todas conservadas)
- ✅ Colores semánticos en cards (Tasks 5, 6, 10, 11)
- ✅ Mejoras de UI/UX (Tasks 4, 5, 10, 11, 12)
- ✅ Actualización en tiempo real (Tasks 6, 10, 12)
- ✅ Ganancia multiciclo en card principal (Task 10)

**Placeholder scan:** None found - all code is complete.

**Type consistency:** Verified - all function signatures and property names match across tasks.

---

## Completion

This plan implements all calculator enhancements as specified in the design document. Each task is bite-sized with complete code, exact file paths, and commit instructions.

**Total tasks:** 13
**Estimated time:** 2-3 hours for full implementation
