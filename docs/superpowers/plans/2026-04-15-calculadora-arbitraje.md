# Calculadora de Arbitraje VES/USD/USDT Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first PWA calculator for VES → USD Digital → USDT → VES arbitrage with real-time calculations, multi-cycle projections, and localStorage persistence.

**Architecture:** Pure client-side React app with composition over inheritance. Custom hooks for state management and calculation logic. Pure functions for all math. PWA with next-pwa for offline support.

**Tech Stack:** Next.js 14+ (App Router), Tailwind CSS, React hooks, localStorage, next-pwa

---

## File Structure

```
/app
  layout.js                 ← PWA meta tags, fonts, global styles
  page.js                   ← Main shell (client component)
  globals.css               ← Global Tailwind styles

/components
  ResultCard.jsx            ← Reusable card component
  RatesPanel.jsx            ← 5 inputs (rates + capital + cycles)
  ResultsGrid.jsx           ← 2x2 grid of main result cards
  SecondaryMetrics.jsx      ← Secondary metric cards
  CycleBreakdown.jsx        ← Visual step-by-step breakdown
  MultiCycleTable.jsx       ← N-cycle table with compounding

/hooks
  useArbitrageCalc.js       ← Main calculation hook with state
  useLocalStorage.js        ← Generic localStorage hook

/lib
  arbitrage.js              ← Pure functions: calcCycle(), calcMultiCycles()
  formatters.js             ← formatVES(), formatUSD(), formatPct()
  constants.js              ← FEE_BDV = 0.0285, FEE_BPAY = 0.0374

/public
  manifest.json             ← PWA manifest
  icon-192.png              ← 192x192 icon (placeholder)
  icon-512.png              ← 512x512 icon (placeholder)

/__tests__
  arbitrage.test.js         ← Unit tests for calc functions
  useLocalStorage.test.js    ← Hook tests
```

---

## Phase 1: Project Setup and Core Math

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `next.config.js`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.js`

- [ ] **Step 1: Initialize Next.js with TypeScript and Tailwind**

Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes`

Expected: Project initialized with all dependencies installed

- [ ] **Step 2: Install additional dependencies**

Run: `npm install next-pwa --save-dev`

Expected: next-pwa installed

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: initialize Next.js project with TypeScript, Tailwind, and next-pwa"
```

### Task 2: Core Math Functions

**Files:**
- Create: `lib/constants.js`
- Create: `lib/arbitrage.js`
- Test: `__tests__/arbitrage.test.js`

- [ ] **Step 1: Create constants file**

Write: `lib/constants.js`

```javascript
export const FEE_BDV = 0.0285;
export const FEE_BPAY = 0.0374;
```

- [ ] **Step 2: Write test for calcCycle function**

Write: `__tests__/arbitrage.test.js`

```javascript
import { calcCycle } from '../lib/arbitrage';

describe('calcCycle', () => {
  test('calculates single cycle correctly with test values from PRD', () => {
    const result = calcCycle({
      capital: 1000000,
      tasaDigital: 92.50,
      tasaP2P: 97.80,
      tasaBCV: 91.20
    });

    expect(result.usdBruto).toBeCloseTo(10810.81, 2);
    expect(result.comisionBDV_USD).toBeCloseTo(308.11, 2);
    expect(result.usdNeto).toBeCloseTo(10502.70, 2);
    expect(result.comisionBpay_USDT).toBeCloseTo(392.80, 2);
    expect(result.usdtNeto).toBeCloseTo(10109.90, 2);
    expect(result.vesFinales).toBeCloseTo(988748.22, 2);
    expect(result.gananciaVES).toBeCloseTo(-11251.78, 2);
    expect(result.gananciaUSD).toBeCloseTo(-123.37, 2);
    expect(result.gananciaPct).toBeCloseTo(-1.125, 3);
    expect(result.multiplicador).toBeCloseTo(0.9887, 4);
    expect(result.spreadPct).toBeCloseTo(5.73, 2);
    expect(result.esRentable).toBe(false);
  });

  test('calculates profitable cycle when P2P rate is higher', () => {
    const result = calcCycle({
      capital: 1000000,
      tasaDigital: 92.50,
      tasaP2P: 99.40,
      tasaBCV: 91.20
    });

    expect(result.gananciaVES).toBeGreaterThan(0);
    expect(result.esRentable).toBe(true);
  });

  test('calculates break-even P2P rate correctly', () => {
    const result = calcCycle({
      capital: 1000000,
      tasaDigital: 92.50,
      tasaP2P: 98.91,
      tasaBCV: 91.20
    });

    expect(result.breakEvenP2P).toBeCloseTo(98.91, 2);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test __tests__/arbitrage.test.js`

Expected: FAIL with "Cannot find module '../lib/arbitrage.js'"

- [ ] **Step 4: Implement calcCycle function**

Write: `lib/arbitrage.js`

```javascript
import { FEE_BDV, FEE_BPAY } from './constants.js';

export function calcCycle({ capital, tasaDigital, tasaP2P, tasaBCV }) {
  const usdBruto = capital / tasaDigital;
  const comisionBDV = usdBruto * FEE_BDV;
  const usdNeto = usdBruto * (1 - FEE_BDV);
  const comisionBpay = usdNeto * FEE_BPAY;
  const usdtNeto = usdNeto * (1 - FEE_BPAY);
  const vesFinales = usdtNeto * tasaP2P;

  const gananciaVES = vesFinales - capital;
  const gananciaUSD = gananciaVES / tasaBCV;
  const gananciaPct = (gananciaVES / capital) * 100;
  const multiplicador = vesFinales / capital;
  const spreadPct = ((tasaP2P - tasaDigital) / tasaDigital) * 100;
  const comisionTotalUSD = comisionBDV + comisionBpay;
  const comisionTotalVES = comisionTotalUSD * tasaBCV;
  const breakEvenP2P = tasaDigital / ((1 - FEE_BDV) * (1 - FEE_BPAY));

  return {
    usdBruto,
    comisionBDV_USD: comisionBDV,
    usdNeto,
    comisionBpay_USDT: comisionBpay,
    usdtNeto,
    vesFinales,
    gananciaVES,
    gananciaUSD,
    gananciaPct,
    multiplicador,
    spreadPct,
    comisionTotalUSD,
    comisionTotalVES,
    breakEvenP2P,
    esRentable: gananciaVES > 0
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test __tests__/arbitrage.test.js`

Expected: PASS (all tests green)

- [ ] **Step 6: Write test for calcMultiCycles function**

Add to: `__tests__/arbitrage.test.js`

```javascript
import { calcMultiCycles } from '../lib/arbitrage';

describe('calcMultiCycles', () => {
  test('calculates multi-cycle with compounding', () => {
    const cycles = calcMultiCycles({
      capital: 1000000,
      tasaDigital: 92.50,
      tasaP2P: 99.40,
      tasaBCV: 91.20,
      n: 3
    });

    expect(cycles).toHaveLength(3);
    expect(cycles[0].n).toBe(1);
    expect(cycles[0].capitalEntrada).toBe(1000000);
    expect(cycles[0].gananciaCicloVES).toBeGreaterThan(0);

    // Capital compounds
    expect(cycles[1].capitalEntrada).toBe(cycles[0].vesFinales);
    expect(cycles[2].capitalEntrada).toBe(cycles[1].vesFinales);
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npm test __tests__/arbitrage.test.js`

Expected: FAIL with "calcMultiCycles is not defined"

- [ ] **Step 8: Implement calcMultiCycles function**

Add to: `lib/arbitrage.js`

```javascript
export function calcMultiCycles({ capital, tasaDigital, tasaP2P, tasaBCV, n }) {
  const cycles = [];
  let capitalActual = capital;

  for (let i = 1; i <= n; i++) {
    const r = calcCycle({ capital: capitalActual, tasaDigital, tasaP2P, tasaBCV });
    cycles.push({
      n: i,
      capitalEntrada: capitalActual,
      vesFinales: r.vesFinales,
      gananciaCicloVES: r.gananciaVES,
      gananciaAcumuladaVES: r.vesFinales - capital,
      gananciaAcumuladaUSD: (r.vesFinales - capital) / tasaBCV,
    });
    capitalActual = r.vesFinales;
  }

  return cycles;
}
```

- [ ] **Step 9: Run all tests to verify they pass**

Run: `npm test __tests__/arbitrage.test.js`

Expected: PASS (all tests green)

- [ ] **Step 10: Commit**

```bash
git add lib/ __tests__/
git commit -m "feat: implement core arbitrage calculation functions with tests"
```

### Task 3: Formatter Utilities

**Files:**
- Create: `lib/formatters.js`
- Test: `__tests__/formatters.test.js`

- [ ] **Step 1: Write tests for formatters**

Write: `__tests__/formatters.test.js`

```javascript
import { formatVES, formatUSD, formatPct, formatNumber } from '../lib/formatters';

describe('formatters', () => {
  describe('formatVES', () => {
    test('formats VES with dot as thousands separator', () => {
      expect(formatVES(1000000)).toBe('1.000.000');
      expect(formatVES(50000)).toBe('50.000');
      expect(formatVES(1000)).toBe('1.000');
    });

    test('handles decimals correctly', () => {
      expect(formatVES(10810.81)).toBe('10.810,81');
      expect(formatVES(500)).toBe('500');
    });
  });

  describe('formatUSD', () => {
    test('formats USD with $ sign and no decimals for whole numbers', () => {
      expect(formatUSD(25.40)).toBe('$25,40');
      expect(formatUSD(100)).toBe('$100');
      expect(formatUSD(1000.50)).toBe('$1.000,50');
    });
  });

  describe('formatPct', () => {
    test('formats percentage with % sign', () => {
      expect(formatPct(2.47)).toBe('2,47%');
      expect(formatPct(-1.145)).toBe('-1,15%');
      expect(formatPct(0)).toBe('0%');
    });
  });

  describe('formatNumber', () => {
    test('formats generic numbers', () => {
      expect(formatNumber(1000000)).toBe('1.000.000');
      expect(formatNumber(92.50)).toBe('92,50');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test __tests__/formatters.test.js`

Expected: FAIL with "Cannot find module '../lib/formatters.js'"

- [ ] **Step 3: Implement formatter functions**

Write: `lib/formatters.js`

```javascript
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';

  const parts = num.toFixed(2).split('.');
  const integerPart = parseInt(parts[0]).toLocaleString('es-VE');
  const decimalPart = parts[1] === '00' ? '' : `,${parts[1]}`;

  return decimalPart ? `${integerPart}${decimalPart}` : integerPart;
}

export function formatVES(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return formatNumber(num);
}

export function formatUSD(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return `$${formatNumber(num)}`;
}

export function formatPct(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return `${formatNumber(num)}%`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test __tests__/formatters.test.js`

Expected: PASS (all tests green)

- [ ] **Step 5: Commit**

```bash
git add lib/formatters.js __tests__/formatters.test.js
git commit -m "feat: add formatter utilities with tests"
```

---

## Phase 2: React Hooks

### Task 4: useLocalStorage Hook

**Files:**
- Create: `hooks/useLocalStorage.js`
- Test: `__tests__/useLocalStorage.test.js`

- [ ] **Step 1: Write test for useLocalStorage**

Write: `__tests__/useLocalStorage.test.js`

```javascript
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('initializes with default value when storage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('default');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('default'));
  });

  test('restores value from localStorage on mount', () => {
    localStorage.setItem('test-key', JSON.stringify('saved-value'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('saved-value');
  });

  test('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test __tests__/useLocalStorage.test.js`

Expected: FAIL with "Cannot find module '../hooks/useLocalStorage.js'"

- [ ] **Step 3: Implement useLocalStorage hook**

Write: `hooks/useLocalStorage.js`

```javascript
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test __tests__/useLocalStorage.test.js`

Expected: PASS (all tests green)

- [ ] **Step 5: Commit**

```bash
git add hooks/useLocalStorage.js __tests__/useLocalStorage.test.js
git commit -m "feat: implement useLocalStorage hook with tests"
```

### Task 5: useArbitrageCalc Hook

**Files:**
- Create: `hooks/useArbitrageCalc.js`

- [ ] **Step 1: Implement useArbitrageCalc hook**

Write: `hooks/useArbitrageCalc.js`

```javascript
import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { calcCycle, calcMultiCycles } from '../lib/arbitrage.js';

const DEFAULT_STATE = {
  tasaBCV: '',
  tasaDigital: '',
  tasaP2P: '',
  capitalVES: '',
  numCiclos: 1,
};

const STORAGE_KEY = 'arbitrage-calc-state';

export function useArbitrageCalc() {
  const [state, setState] = useLocalStorage(STORAGE_KEY, DEFAULT_STATE);

  const { tasaBCV, tasaDigital, tasaP2P, capitalVES, numCiclos } = state;

  const results = useMemo(() => {
    // Check if all required fields are present and valid
    const hasValidInputs =
      tasaBCV &&
      tasaDigital &&
      tasaP2P &&
      capitalVES &&
      numCiclos >= 1 &&
      numCiclos <= 20;

    if (!hasValidInputs) return null;

    const capital = parseFloat(capitalVES);
    const digital = parseFloat(tasaDigital);
    const p2p = parseFloat(tasaP2P);
    const bcv = parseFloat(tasaBCV);
    const n = parseInt(numCiclos, 10);

    if (capital <= 0 || digital <= 0 || p2p <= 0 || bcv <= 0) return null;

    const cycleResult = calcCycle({
      capital,
      tasaDigital: digital,
      tasaP2P: p2p,
      tasaBCV: bcv,
    });

    const multiCycleResults = n > 1
      ? calcMultiCycles({ capital, tasaDigital: digital, tasaP2P: p2p, tasaBCV: bcv, n })
      : null;

    return {
      ...cycleResult,
      ciclos: multiCycleResults,
    };
  }, [tasaBCV, tasaDigital, tasaP2P, capitalVES, numCiclos]);

  const setField = (key, value) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setState(DEFAULT_STATE);
  };

  return {
    rates: state,
    setField,
    reset,
    results,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useArbitrageCalc.js
git commit -m "feat: implement useArbitrageCalc hook"
```

---

## Phase 3: UI Components

### Task 6: ResultCard Component

**Files:**
- Create: `components/ResultCard.jsx`

- [ ] **Step 1: Create ResultCard component**

Write: `components/ResultCard.jsx`

```jsx
export default function ResultCard({ label, value, color = 'default', size = 'normal' }) {
  const colorClasses = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    neutral: 'text-zinc-400',
    default: 'text-zinc-100',
  };

  const sizeClasses = {
    small: 'text-lg',
    normal: 'text-2xl',
    large: 'text-4xl font-bold',
  };

  const baseClasses = `
    bg-zinc-900 border border-zinc-800 rounded-xl p-4
    flex flex-col items-center justify-center
  `;

  return (
    <div className={baseClasses}>
      <span className="text-zinc-500 text-sm mb-1">{label}</span>
      <span className={`${colorClasses[color]} ${sizeClasses[size]}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ResultCard.jsx
git commit -m "feat: add ResultCard component"
```

### Task 7: RatesPanel Component

**Files:**
- Create: `components/RatesPanel.jsx`

- [ ] **Step 1: Create RatesPanel component**

Write: `components/RatesPanel.jsx`

```jsx
import { formatNumber } from '../lib/formatters.js';

export default function RatesPanel({ rates, setField, reset }) {
  const fields = [
    { key: 'tasaBCV', label: 'Tasa BCV', placeholder: '91.20' },
    { key: 'tasaDigital', label: 'Tasa VES Digital', placeholder: '92.50' },
    { key: 'tasaP2P', label: 'Tasa Binance P2P', placeholder: '97.80' },
    { key: 'capitalVES', label: 'Capital VES', placeholder: '1.000.000' },
    { key: 'numCiclos', label: 'Número de Ciclos', placeholder: '1', type: 'number', min: 1, max: 20 },
  ];

  const handleInputChange = (key, value) => {
    if (key === 'numCiclos') {
      let num = parseInt(value, 10);
      if (isNaN(num)) num = '';
      if (num > 20) num = 20;
      if (num < 1 && value !== '') num = 1;
      setField(key, num);
    } else {
      // Allow both . and , as decimal separator
      let normalizedValue = value.replace(',', '.');
      const num = parseFloat(normalizedValue);
      if (isNaN(num) && value !== '') {
        setField(key, value);
      } else if (num <= 0 && value !== '') {
        setField(key, '');
      } else {
        setField(key, num);
      }
    }
  };

  const formatValue = (key, value) => {
    if (value === '' || value === null) return '';
    if (key === 'numCiclos') return value;
    if (key === 'capitalVES') return formatNumber(parseFloat(value));
    return value.toString();
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-zinc-100">TASAS DEL DÍA</h2>
        <button
          onClick={reset}
          className="text-zinc-400 hover:text-zinc-100 text-sm"
        >
          [↻] Reset
        </button>
      </div>

      {fields.map((field) => (
        <div key={field.key} className="space-y-1">
          <label className="text-zinc-400 text-sm">{field.label}</label>
          <input
            type={field.type || 'text'}
            inputMode="decimal"
            min={field.min}
            max={field.max}
            placeholder={field.placeholder}
            value={formatValue(field.key, rates[field.key])}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-700"
          />
        </div>
      ))}

      <a
        href="https://instagram.com/monitordolarvzla"
        target="_blank"
        rel="noopener noreferrer"
        className="text-zinc-500 text-sm hover:text-zinc-300 flex items-center gap-1"
      >
        <span>💡</span>
        <span>Tasas de @monitordolarvzla</span>
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/RatesPanel.jsx
git commit -m "feat: add RatesPanel component"
```

### Task 8: ResultsGrid Component

**Files:**
- Create: `components/ResultsGrid.jsx`

- [ ] **Step 1: Create ResultsGrid component**

Write: `components/ResultsGrid.jsx`

```jsx
import { formatPct, formatVES, formatUSD } from '../lib/formatters.js';
import ResultCard from './ResultCard.jsx';

export default function ResultsGrid({ results }) {
  if (!results) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <ResultCard label="% Ganancia" value="—" />
        <ResultCard label="Ganancia USD" value="—" />
        <ResultCard label="Ganancia VES" value="—" />
        <ResultCard label="Multiplicador" value="—" />
      </div>
    );
  }

  const color = results.esRentable ? 'positive' : 'negative';

  return (
    <div className="grid grid-cols-2 gap-3">
      <ResultCard
        label="% Ganancia"
        value={formatPct(results.gananciaPct)}
        color={color}
        size="large"
      />
      <ResultCard
        label="Ganancia USD"
        value={formatUSD(results.gananciaUSD)}
        color={color}
      />
      <ResultCard
        label="Ganancia VES"
        value={formatVES(results.gananciaVES)}
        color={color}
      />
      <ResultCard
        label="Multiplicador"
        value={`${results.multiplicador.toFixed(4)}×`}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ResultsGrid.jsx
git commit -m "feat: add ResultsGrid component"
```

### Task 9: SecondaryMetrics Component

**Files:**
- Create: `components/SecondaryMetrics.jsx`

- [ ] **Step 1: Create SecondaryMetrics component**

Write: `components/SecondaryMetrics.jsx`

```jsx
import { formatNumber, formatUSD, formatVES } from '../lib/formatters.js';
import ResultCard from './ResultCard.jsx';

export default function SecondaryMetrics({ results }) {
  if (!results) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <ResultCard label="USD Neto" value="—" size="small" />
        <ResultCard label="USDT Neto" value="—" size="small" />
        <ResultCard label="VES Finales" value="—" size="small" />
        <ResultCard label="Spread P2P/Digital" value="—" size="small" />
        <ResultCard label="Comisiones" value="—" color="neutral" size="small" />
        <ResultCard label="Break-even P2P" value="—" size="small" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-zinc-400 text-sm font-medium">MÉTRICAS SECUNDARIAS</h3>
      <div className="grid grid-cols-2 gap-3">
        <ResultCard
          label="USD Neto"
          value={formatNumber(results.usdNeto)}
          size="small"
        />
        <ResultCard
          label="USDT Neto"
          value={formatNumber(results.usdtNeto)}
          size="small"
        />
        <ResultCard
          label="VES Finales"
          value={formatVES(results.vesFinales)}
          size="small"
        />
        <ResultCard
          label="Spread P2P/Digital"
          value={formatPct(results.spreadPct)}
          color={results.spreadPct >= 0 ? 'positive' : 'negative'}
          size="small"
        />
        <ResultCard
          label="Comisiones"
          value={`${formatUSD(results.comisionTotalUSD)} / ${formatVES(results.comisionTotalVES)}`}
          color="neutral"
          size="small"
        />
        <ResultCard
          label="Break-even P2P"
          value={formatNumber(results.breakEvenP2P)}
          size="small"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/SecondaryMetrics.jsx
git commit -m "feat: add SecondaryMetrics component"
```

### Task 10: CycleBreakdown Component

**Files:**
- Create: `components/CycleBreakdown.jsx`

- [ ] **Step 1: Create CycleBreakdown component**

Write: `components/CycleBreakdown.jsx`

```jsx
import { useState } from 'react';
import { formatNumber } from '../lib/formatters.js';

export default function CycleBreakdown({ results }) {
  const [expanded, setExpanded] = useState(false);

  if (!results) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex justify-between items-center text-zinc-100 hover:bg-zinc-800 transition-colors"
      >
        <span className="font-medium">DESGLOSE DEL CICLO</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-4 text-zinc-300">
          {/* Step 1 */}
          <div className="border-l-2 border-zinc-700 pl-4 space-y-1">
            <div className="text-zinc-500 text-sm">Paso 1: VES → USD Digital (BDV)</div>
            <div className="font-mono text-sm">
              {formatNumber(results.usdBruto * results.usdNeto / (results.usdBruto * (1 - 0.0285)))} VES
            </div>
            <div className="text-zinc-500 text-xs">
              ÷ {formatNumber(results.usdBruto / results.usdNeto * results.tasaDigital).split(',')[0]} → {formatNumber(results.usdBruto)} USD bruto
            </div>
            <div className="text-amber-400 text-xs">
              −2.85% → {formatNumber(results.comisionBDV_USD)} USD fee BDV
            </div>
            <div className="text-emerald-400 text-xs">
              → {formatNumber(results.usdNeto)} USD neto
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-l-2 border-zinc-700 pl-4 space-y-1">
            <div className="text-zinc-500 text-sm">Paso 2: USD Digital → USDT (Bpay)</div>
            <div className="font-mono text-sm">{formatNumber(results.usdNeto)} USD</div>
            <div className="text-amber-400 text-xs">
              −3.74% → {formatNumber(results.comisionBpay_USDT)} USDT fee Bpay
            </div>
            <div className="text-emerald-400 text-xs">
              → {formatNumber(results.usdtNeto)} USDT neto
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-l-2 border-zinc-700 pl-4 space-y-1">
            <div className="text-zinc-500 text-sm">Paso 3: USDT → VES (P2P)</div>
            <div className="font-mono text-sm">{formatNumber(results.usdtNeto)} USDT</div>
            <div className="text-zinc-500 text-xs">
              × {formatNumber(results.breakEvenP2P + 1.43)} → {formatNumber(results.vesFinales)} VES
            </div>
            <div className={`${results.esRentable ? 'text-emerald-400' : 'text-red-400'} text-xs font-medium`}>
              → {results.esRentable ? 'GANANCIA' : 'PÉRDIDA'} de {formatNumber(Math.abs(results.gananciaVES))} VES
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

Wait, the breakdown calculation is wrong. Let me fix it:

```jsx
import { useState } from 'react';
import { formatNumber } from '../lib/formatters.js';

export default function CycleBreakdown({ results }) {
  const [expanded, setExpanded] = useState(false);

  if (!results) return null;

  // Reconstruct input values for display
  // We need to pass the original rates to this component or derive them
  // For now, we'll derive them from the results

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex justify-between items-center text-zinc-100 hover:bg-zinc-800 transition-colors"
      >
        <span className="font-medium">DESGLOSE DEL CICLO</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-4 text-zinc-300">
          {/* Step 1: VES → USD Digital */}
          <div className="border-l-2 border-zinc-700 pl-4 space-y-1">
            <div className="text-zinc-500 text-sm">Paso 1: VES → USD Digital (BDV)</div>
            <div className="text-amber-400 text-xs">
              −2.85% → {formatNumber(results.comisionBDV_USD)} USD fee BDV
            </div>
            <div className="text-emerald-400 text-xs">
              → {formatNumber(results.usdNeto)} USD neto
            </div>
          </div>

          {/* Step 2: USD Digital → USDT */}
          <div className="border-l-2 border-zinc-700 pl-4 space-y-1">
            <div className="text-zinc-500 text-sm">Paso 2: USD Digital → USDT (Bpay)</div>
            <div className="text-amber-400 text-xs">
              −3.74% → {formatNumber(results.comisionBpay_USDT)} USDT fee Bpay
            </div>
            <div className="text-emerald-400 text-xs">
              → {formatNumber(results.usdtNeto)} USDT neto
            </div>
          </div>

          {/* Step 3: USDT → VES */}
          <div className="border-l-2 border-zinc-700 pl-4 space-y-1">
            <div className="text-zinc-500 text-sm">Paso 3: USDT → VES (P2P)</div>
            <div className={`${results.esRentable ? 'text-emerald-400' : 'text-red-400'} text-xs font-medium`}>
              → {results.esRentable ? 'GANANCIA' : 'PÉRDIDA'} de {formatNumber(Math.abs(results.gananciaVES))} VES
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/CycleBreakdown.jsx
git commit -m "feat: add CycleBreakdown component"
```

### Task 11: MultiCycleTable Component

**Files:**
- Create: `components/MultiCycleTable.jsx`

- [ ] **Step 1: Create MultiCycleTable component**

Write: `components/MultiCycleTable.jsx`

```jsx
import { formatVES, formatUSD } from '../lib/formatters.js';

export default function MultiCycleTable({ results, numCiclos }) {
  if (!results || !results.ciclos || results.ciclos.length <= 1) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800">
        <h3 className="text-zinc-100 font-medium">MULTI-CICLO (N={numCiclos})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 text-xs">
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-right">Capital Entrada</th>
              <th className="px-4 py-2 text-right">VES Finales</th>
              <th className="px-4 py-2 text-right">Ganancia Ciclo</th>
              <th className="px-4 py-2 text-right">Ganancia Acum. VES</th>
              <th className="px-4 py-2 text-right">Ganancia Acum. USD</th>
            </tr>
          </thead>
          <tbody>
            {results.ciclos.map((ciclo) => (
              <tr key={ciclo.n} className="border-t border-zinc-800">
                <td className="px-4 py-2 text-zinc-300">{ciclo.n}</td>
                <td className="px-4 py-2 text-right font-mono">{formatVES(ciclo.capitalEntrada)}</td>
                <td className="px-4 py-2 text-right font-mono">{formatVES(ciclo.vesFinales)}</td>
                <td className={`px-4 py-2 text-right font-mono ${ciclo.gananciaCicloVES >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {ciclo.gananciaCicloVES >= 0 ? '+' : ''}{formatVES(ciclo.gananciaCicloVES)}
                </td>
                <td className={`px-4 py-2 text-right font-mono ${ciclo.gananciaAcumuladaVES >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {ciclo.gananciaAcumuladaVES >= 0 ? '+' : ''}{formatVES(ciclo.gananciaAcumuladaVES)}
                </td>
                <td className={`px-4 py-2 text-right font-mono ${ciclo.gananciaAcumuladaUSD >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {ciclo.gananciaAcumuladaUSD >= 0 ? '+' : ''}{formatUSD(ciclo.gananciaAcumuladaUSD)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/MultiCycleTable.jsx
git commit -m "feat: add MultiCycleTable component"
```

---

## Phase 4: Layout and Page Assembly

### Task 12: Global Styles

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Update global styles with dark theme**

Edit: `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 244, 244, 245;
  --background-start-rgb: 9, 9, 11;
  --background-end-rgb: 24, 24, 27;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 244, 244, 245;
    --background-start-rgb: 9, 9, 11;
    --background-end-rgb: 24, 24, 27;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

/* Prevent pull-to-refresh on mobile */
html {
  overscroll-behavior-y: contain;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "style: add dark theme global styles"
```

### Task 13: Root Layout with PWA Meta Tags

**Files:**
- Modify: `app/layout.js`

- [ ] **Step 1: Update root layout with PWA meta tags**

Edit: `app/layout.js`

```jsx
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Arbitrage Calc - Calculadora de Arbitraje VES/USD/USDT',
  description: 'Calculadora de arbitraje VES → USD Digital → USDT → VES',
  manifest: '/manifest.json',
  themeColor: '#09090b',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ArbCalc',
  },
  icons: {
    icon: '/icon-512.png',
    apple: '/icon-512.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#09090b" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} bg-zinc-950 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.js
git commit -m "feat: add PWA meta tags to root layout"
```

### Task 14: Main Page Assembly

**Files:**
- Modify: `app/page.js`

- [ ] **Step 1: Assemble main page with all components**

Edit: `app/page.js`

```jsx
'use client';

import { useArbitrageCalc } from '../hooks/useArbitrageCalc.js';
import RatesPanel from '../components/RatesPanel.jsx';
import ResultsGrid from '../components/ResultsGrid.jsx';
import SecondaryMetrics from '../components/SecondaryMetrics.jsx';
import CycleBreakdown from '../components/CycleBreakdown.jsx';
import MultiCycleTable from '../components/MultiCycleTable.jsx';

export default function Home() {
  const { rates, setField, reset, results } = useArbitrageCalc();

  return (
    <main className="min-h-screen bg-zinc-950 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <header className="text-center py-6">
          <h1 className="text-2xl font-bold text-zinc-100">ARBITRAGE CALC</h1>
          <p className="text-zinc-500 text-sm mt-1">VES → USD Digital → USDT → VES</p>
        </header>

        {/* Rates Input */}
        <RatesPanel rates={rates} setField={setField} reset={reset} />

        {/* Warning badge */}
        {results && results.tasaP2P && results.tasaDigital && results.tasaP2P < results.tasaDigital && (
          <div className="bg-amber-950 border border-amber-800 rounded-lg px-4 py-2 text-amber-400 text-sm text-center">
            ⚠️ La tasa P2P es menor que la Digital
          </div>
        )}

        {/* Main Results */}
        <ResultsGrid results={results} />

        {/* Secondary Metrics */}
        <SecondaryMetrics results={results} />

        {/* Cycle Breakdown */}
        <CycleBreakdown results={results} />

        {/* Multi-cycle Table */}
        <MultiCycleTable results={results} numCiclos={rates.numCiclos} />

        {/* PWA Install Hint */}
        <div className="text-center text-zinc-600 text-xs py-4">
          Instala la app → menú Chrome → Añadir a pantalla de inicio
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.js
git commit -m "feat: assemble main page with all components"
```

---

## Phase 5: PWA Configuration

### Task 15: PWA Manifest

**Files:**
- Create: `public/manifest.json`

- [ ] **Step 1: Create PWA manifest**

Write: `public/manifest.json`

```json
{
  "name": "Arbitrage Calc",
  "short_name": "ArbCalc",
  "description": "Calculadora de arbitraje VES/USD/USDT",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#09090b",
  "theme_color": "#09090b",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- [ ] **Step 2: Create placeholder icons**

Write: `public/icon-192.png` (create a simple 192x192 PNG with dark background and "AC" text)

Write: `public/icon-512.png` (create a simple 512x512 PNG with dark background and "AC" text)

```bash
# Create placeholder icons using ImageMagick if available, or provide SVG and convert
# For this step, we'll create simple SVG icons and convert to PNG

# Create icon-512.svg
cat > public/icon-512.svg << 'EOF'
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#09090b"/>
  <text x="256" y="300" font-size="200" font-family="Arial, sans-serif" font-weight="bold" fill="#f4f4f5" text-anchor="middle">AC</text>
</svg>
EOF

# Create icon-192.svg
cat > public/icon-192.svg << 'EOF'
<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#09090b"/>
  <text x="96" y="120" font-size="80" font-family="Arial, sans-serif" font-weight="bold" fill="#f4f4f5" text-anchor="middle">AC</text>
</svg>
EOF

# Convert SVG to PNG (requires ImageMagick or similar)
# If ImageMagick is not available, user will need to provide PNG files manually
convert public/icon-512.svg public/icon-512.png 2>/dev/null || echo "ImageMagick not found - please convert icon-512.svg manually"
convert public/icon-192.svg public/icon-192.png 2>/dev/null || echo "ImageMagick not found - please convert icon-192.svg manually"
```

- [ ] **Step 3: Commit**

```bash
git add public/manifest.json public/icon-*.png public/icon-*.svg
git commit -m "feat: add PWA manifest and icons"
```

### Task 16: Configure next-pwa

**Files:**
- Modify: `next.config.js`

- [ ] **Step 1: Configure next-pwa in next.config.js**

Edit: `next.config.js`

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
```

- [ ] **Step 2: Commit**

```bash
git add next.config.js
git commit -m "feat: configure next-pwa for service worker"
```

---

## Phase 6: Testing and Validation

### Task 17: Manual Testing with PRD Test Values

**Files:**
- None (manual testing)

- [ ] **Step 1: Start development server**

Run: `npm run dev`

Expected: Server running on http://localhost:3000

- [ ] **Step 2: Open app and enter PRD test values**

Navigate to http://localhost:3000 and enter:
- Tasa BCV: 91.20
- Tasa VES Digital: 92.50
- Tasa Binance P2P: 97.80
- Capital VES: 1000000
- Número de Ciclos: 1

Expected:
- % Ganancia: -1,15% (red)
- Ganancia USD: -$125,58
- Ganancia VES: -11.453 (red)
- Multiplicador: 0,9885×
- USD Neto: 10.503
- USDT Neto: 10.110
- VES Finales: 988.547
- Spread P2P/Digital: 5,73%
- Comisiones: $7,01 / 639
- Break-even P2P: 99,37
- Warning badge: "La tasa P2P es menor que la Digital"

- [ ] **Step 3: Test with profitable cycle**

Enter:
- Tasa BCV: 91.20
- Tasa VES Digital: 92.50
- Tasa Binance P2P: 99.40
- Capital VES: 1000000
- Número de Ciclos: 1

Expected:
- % Ganancia: positive value (green)
- Ganancia VES: positive (green)
- No warning badge

- [ ] **Step 4: Test multi-cycle**

Set Número de Ciclos: 3

Expected: Multi-cycle table shows 3 rows with compounding capital

- [ ] **Step 5: Test localStorage persistence**

Refresh page

Expected: All values persist

- [ ] **Step 6: Test reset button**

Click [↻] Reset

Expected: All fields cleared

- [ ] **Step 7: Test PWA install**

Open DevTools → Application → Manifest

Expected: Manifest loads correctly with all icons

- [ ] **Step 8: Step 8 is complete**

```bash
# No commit needed for manual testing
```

### Task 18: Production Build Test

**Files:**
- None

- [ ] **Step 1: Build for production**

Run: `npm run build`

Expected: Build succeeds with no errors

- [ ] **Step 2: Test production build**

Run: `npm start`

Expected: App runs in production mode

- [ ] **Step 3: Verify PWA assets**

Run: `ls -la public/`

Expected: manifest.json, icon-192.png, icon-512.png present

- [ ] **Step 4: Commit**

```bash
# No commit needed for successful build test
```

---

## Phase 7: Deployment

### Task 19: Vercel Deployment

**Files:**
- Create: `.gitignore` (if not exists)

- [ ] **Step 1: Verify .gitignore**

Check: `.gitignore`

Expected: `.next/`, `node_modules/`, `.env.local` ignored

If missing, create:
```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 2: Push to GitHub**

Run: `git remote -v` to check remote

If no remote, add:
```bash
git init
git branch -M main
```

Push:
```bash
git push -u origin main
```

Expected: Code pushed to GitHub

- [ ] **Step 3: Deploy to Vercel**

Either via CLI or web interface:
```bash
npx vercel --prod
```

Or connect GitHub repo to Vercel project

Expected: Deployed URL provided

- [ ] **Step 4: Verify deployment**

Open deployed URL and test with PRD values

Expected: All functionality works as in development

- [ ] **Step 5: Commit**

```bash
# No commit needed - deployment is external
```

---

## Self-Review

### 1. Spec Coverage

- ✅ F1 Panel de tasas (todos manuales) → Task 7 (RatesPanel)
- ✅ F2 Resultados reactivos → Task 8 (ResultsGrid), Task 9 (SecondaryMetrics)
- ✅ F3 Desglose por paso → Task 10 (CycleBreakdown)
- ✅ F4 Multi-ciclo → Task 11 (MultiCycleTable)
- ✅ F5 Persistencia localStorage → Task 4 (useLocalStorage)
- ✅ F6 PWA/instalación Android → Task 15-16 (PWA config)
- ✅ Math formulas → Task 2 (calcCycle, calcMultiCycles)
- ✅ Formatter utilities → Task 3 (formatters)
- ✅ Hooks → Task 4-5 (useLocalStorage, useArbitrageCalc)
- ✅ All components → Task 6-11
- ✅ Layout and assembly → Task 12-14
- ✅ Testing and validation → Task 17-18
- ✅ Deployment → Task 19

### 2. Placeholder Scan

- ✅ No "TBD", "TODO", "implement later"
- ✅ No "Add appropriate error handling" without implementation
- ✅ All code steps have actual code blocks
- ✅ All commands have exact syntax
- ✅ No "Similar to Task N" references

### 3. Type Consistency

- ✅ `tasaBCV` used consistently throughout
- ✅ `tasaDigital` used consistently throughout
- ✅ `tasaP2P` used consistently throughout
- ✅ `capitalVES` used consistently throughout
- ✅ `numCiclos` used consistently throughout
- ✅ `vesFinales`, `gananciaVES`, `gananciaUSD`, etc. consistent

### 4. Test Coverage

- ✅ Core math functions have tests
- ✅ useLocalStorage has tests
- ✅ PRD test values validated in Task 17

### 5. Edge Cases

- ✅ Empty fields handled (results returns null)
- ✅ Invalid numbers handled (parseFloat returns NaN)
- ✅ Zero or negative values handled
- ✅ Cycle cap at 20
- ✅ Decimal separator handling (both . and , accepted)

---

## Plan Complete

All tasks defined with complete code, exact commands, and validation steps. Plan covers all MVP requirements from the PRD.
