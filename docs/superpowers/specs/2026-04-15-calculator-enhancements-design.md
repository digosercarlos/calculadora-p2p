# Calculadora P2P - Mejoras de Funcionalidades y UI/UX

**Fecha:** 2026-04-15
**Estado:** Aprobado
**Enfoque:** Panel Unificado

## Resumen

Este diseño especifica las mejoras solicitadas para la calculadora de arbitraje P2P:

1. Personalización de fees persistentes en localStorage
2. Historial de operaciones con hasta 20 registros
3. Calculadora inversa para proyecciones
4. Mejora de UI/UX con colores semánticos
5. Actualización en tiempo real de métricas de multiciclo

## Arquitectura General

### Estructura de Columnas
La aplicación mantiene su estructura de 2 columnas (1:2 ratio):

**Columna Izquierda (RatesPanel Expandido):**
- Header con título y botón de historial
- Sistema de tabs: [Normal | Proyecciones]
- Tab Normal: inputs de tasas, fees personalizables, capital y ciclos
- Tab Proyecciones: calculadora inversa
- Footer con link a @monitordolarvzla

**Columna Derecha (Resultados):**
- Results Grid (4 cards principales)
- NUEVO: Ganancia Multiciclo Card
- Secondary Metrics (6 métricas conservadas)
- Cycle Breakdown
- Multi-Cycle Table

**Modal de Historial:**
- Tabla con hasta 20 registros
- Timestamp, inputs clave, resultados principales
- Botón de limpiar historial

## Componentes

### 1. RatesPanel Expandido

#### Estructura de Tabs
```
┌─────────────────────────────────────┐
│  Tasas del Día      [Historial] │
│  ┌─────────┐ ┌───────────────────┐│
│  │ Normal  │ │   Proyecciones    ││
│  └─────────┘ └───────────────────┘│
├─────────────────────────────────────┤
│  (Contenido del tab activo)        │
└─────────────────────────────────────┘
```

#### Tab Normal - Fees Personalizables

```jsx
<div className="space-y-4">
  {/* Inputs de tasas */}
  <input label="Tasa BCV (VES/USD)" value={tasaBCV} />
  <input label="Tasa VES Digital (VES/USD)" value={tasaDigital} />
  <input label="Tasa Binance P2P (VES/USDT)" value={tasaP2P} />

  {/* Configuración de Comisiones - siempre visible */}
  <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/50">
    <h3 className="text-sm font-medium text-zinc-400 mb-3">
      Configuración de Comisiones
    </h3>

    <div className="space-y-3">
      <div>
        <label>Comisión BDV (2.85% predet.)</label>
        <input type="number" step="0.01" min="0" max="10" value={feeBDV} />
      </div>
      <div>
        <label>Comisión Bpay (3.74% predet.)</label>
        <input type="number" step="0.01" min="0" max="10" value={feeBpay} />
      </div>
    </div>
  </div>

  {/* Inputs de capital y ciclos */}
  <input label="Capital a trabajar (VES)" value={capital} />
  <input label="Número de ciclos (1-20)" value={numCiclos} min="1" max="20" />
</div>
```

**Características:**
- Inputs de fees siempre visibles (no colapsable)
- Validación: 0% - 10% para proteger contra errores
- Valores persisten en `localStorage['arbitrage-calculator-fees']`
- Botón reset restaura fees a valores por defecto (2.85%, 3.74%)

#### Tab Proyecciones - Calculadora Inversa

```jsx
<div className="space-y-4">
  <h3 className="text-lg font-semibold text-zinc-100">
    Proyección de Capital
  </h3>

  <div>
    <label>Ganancia Objetivo (USD)</label>
    <input type="number" value={gananciaObjetivoUSD} placeholder="50.00" />
  </div>

  {/* Resultados de Proyección */}
  {proyeccionResult && (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
      <div className="text-sm text-zinc-400 mb-2">
        Capital Requerido:
      </div>
      <div className="text-2xl font-bold text-emerald-400">
        {formatVES(proyeccionResult.capitalRequerido)}
      </div>

      <div className="mt-4 space-y-1 text-sm text-zinc-500">
        <div>• Tasa Digital: {formatVES(tasaDigital)}</div>
        <div>• Tasa P2P: {formatVES(tasaP2P)}</div>
        <div>• Spread: {formatPct(spreadPct)}</div>
      </div>
    </div>
  )}
</div>
```

**Lógica de calculadora inversa:**
```javascript
function calcCapitalRequerido(gananciaObjetivoUSD, { tasaDigital, tasaP2P, tasaBCV, feeBDV, feeBpay }) {
  // GananciaPct = (vesFinales - capital) / capital * 100
  // GananciaUSD = gananciaVES / tasaBCV
  // GananciaVES = capital * (gananciaPct / 100)

  const gananciaObjetivoVES = gananciaObjetivoUSD * tasaBCV;

  // De la fórmula original:
  // multiplicador = vesFinales / capital
  // gananciaPct = (multiplicador - 1) * 100
  // multiplicador = (gananciaPct / 100) + 1
  // vesFinales = capital * multiplicador
  // gananciaVES = vesFinales - capital = capital * (multiplicador - 1)
  // capital = gananciaVES / (multiplicador - 1)

  // Simplificando:
  // capitalRequerido = gananciaObjetivoVES / (gananciaPct / 100)
  // capitalRequerido = (gananciaObjetivoUSD * tasaBCV) / (gananciaPct / 100)
  // capitalRequerido = gananciaObjetivoUSD * tasaBCV * 100 / gananciaPct

  const gananciaPct = ((tasaP2P - tasaDigital) / tasaDigital) * 100;
  const capitalRequerido = (gananciaObjetivoUSD * tasaBCV * 100) / gananciaPct;

  return { capitalRequerido, gananciaPct };
}
```

### 2. Resultados Expandidos

#### Layout de Results Grid + Multiciclo Card
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards principales */}
  <ResultCard label="Ganancia %" value={formatPct(gananciaPct)} color={profitColor} size="lg" />
  <ResultCard label="Ganancia VES" value={formatVES(gananciaVES)} color={profitColor} size="md" />
  <ResultCard label="Ganancia USD" value={formatUSD(gananciaUSD)} color={profitColor} size="md" />
  <ResultCard label="Multiplicador" value={`${multiplicador.toFixed(4)}x`} color="neutral" size="md" />

  {/* NUEVO: Ganancia Multiciclo */}
  <ResultCard
    label="Ganancia N Ciclos"
    value={formatVES(gananciaMulticicloVES)}
    subvalue={formatUSD(gananciaMulticicloUSD)}
    color={multiProfitColor}
    size="lg"
    span={2} // Ocupa 2 columnas en layouts de 3 cols
  />
</div>
```

#### Colores de Cards (tema oscuro zinc-950)

| Tipo | Background | Border | Text | Clases |
|------|-----------|---------|------|--------|
| Ganancia positiva | `bg-emerald-950/30` | `border-emerald-700` | `text-emerald-400` | `profit-green` |
| Pérdida/roja | `bg-red-950/30` | `border-red-700` | `text-red-400` | `profit-red` |
| Neutro/informativo | `bg-zinc-900` | `border-zinc-700` | `text-zinc-300` | `neutral` |

#### Mejoras UI/UX aplicadas:
```jsx
// Hover states suaves
className="hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-900/20 transition-all duration-200"

// Border highlighting en focus
className="focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-500"

// Mejor espaciado
className="gap-6" // Entre secciones principales

// Iconos visuales en métricas secundarias
<Icon className="w-4 h-4" />
```

### 3. Secondary Metrics (todas las 6 conservadas)

```jsx
const metrics = [
  { label: 'USD neto (BDV)', value: formatUSD(results.usdNeto), color: 'neutral', icon: DollarIcon },
  { label: 'USDT neto (Bpay)', value: formatUSD(results.usdtNeto), color: 'neutral', icon: ArrowIcon },
  { label: 'VES finales', value: formatVES(results.vesFinales), color: results.esRentable ? 'profit-green' : 'profit-red', icon: ChartIcon },
  { label: 'Spread P2P vs Digital', value: formatPct(results.spreadPct), color: results.spreadPct > 0 ? 'profit-green' : 'profit-red', icon: TrendIcon },
  { label: 'Comisión total', value: `${formatUSD(results.comisionTotalUSD)} / ${formatVES(results.comisionTotalVES)}`, color: 'amber' },
  { label: 'Break-even P2P', value: formatVES(results.breakEvenP2P), color: 'neutral', icon: ShieldIcon },
];
```

### 4. Modal de Historial

#### Estructura
```jsx
<Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)}>
  <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-zinc-100">Historial de Operaciones</h2>
      <button onClick={() => setIsHistoryOpen(false)}>[× Cerrar]</button>
    </div>

    <div className="overflow-y-auto max-h-96">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-700">
            <th className="text-left text-zinc-400 py-2">Fecha</th>
            <th className="text-left text-zinc-400 py-2">Capital</th>
            <th className="text-left text-zinc-400 py-2">Spread</th>
            <th className="text-left text-zinc-400 py-2">Ganancia %</th>
          </tr>
        </thead>
        <tbody>
          {history.map((record, index) => (
            <tr key={index} className="border-b border-zinc-800 hover:bg-zinc-800/50 cursor-pointer">
              <td className="text-zinc-300 py-2">{formatTimestamp(record.timestamp)}</td>
              <td className="text-zinc-300 py-2">{formatShort(record.inputs.capital)}</td>
              <td className={record.results.gananciaPct > 0 ? 'text-emerald-400' : 'text-red-400'}>
                {record.results.gananciaPct > 0 ? '+' : ''}{formatPct(record.results.gananciaPct)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="mt-4 flex justify-between">
      <button onClick={clearHistory} className="text-red-400 hover:text-red-300">
        [🗑 Limpiar Historial]
      </button>
      <button onClick={() => setIsHistoryOpen(false)}>[Cerrar]</button>
    </div>
  </div>
</Modal>
```

#### Registro de Operación
```javascript
{
  timestamp: "2026-04-15T14:30:00Z",
  inputs: {
    capital: 1000000,
    tasaDigital: 92.50,
    tasaP2P: 97.80,
    tasaBCV: 91.20,
    feeBDV: 0.0285,
    feeBpay: 0.0374,
    n: 3
  },
  results: {
    gananciaPct: 5.68,
    gananciaVES: 56800,
    gananciaUSD: 622.54,
    gananciaMulticicloVES: 180240,
    gananciaMulticicloUSD: 1975.60
  }
}
```

#### Comportamiento de Guardado
Los cálculos se guardan automáticamente cuando:
1. El usuario hace clic fuera de un input (onBlur)
2. Han pasado 2 segundos desde el último cambio (debounce)

## Comportamiento y Actualización en Tiempo Real

### Actualización de Métricas al Cambiar Ciclos

```jsx
// En useArbitrageCalc hook
const updateInput = (key, value) => {
  setInputs((prev) => ({ ...prev, [key]: value }));

  // Si cambia el número de ciclos, recalcula multiciclo
  if (key === 'n') {
    // multiCycleResults se recalcula vía useMemo
  }
};

// Métricas de ciclo único NO cambian con N
const singleCycleResult = useMemo(() => calcCycle({...}), [inputs]);

// Métricas de multiciclo SÍ cambian con N
const multiCycleResults = useMemo(() => calcMultiCycles({...}), [inputs]);
```

### Configuración Persistente

```javascript
// Estructura de localStorage
{
  'arbitrage-calculator-inputs': {  // ya existe
    capital: 1000000,
    tasaDigital: 92.50,
    tasaP2P: 97.80,
    tasaBCV: 91.20,
    feeBDV: 0.0285,
    feeBpay: 0.0374,
    n: 3
  },
  'arbitrage-calculator-fees': {  // NUEVO - redundante pero claro
    feeBDV: 0.0285,
    feeBpay: 0.0374
  },
  'arbitrage-calculator-history': [  // NUEVO
    { timestamp, inputs, results },
    ...
  ]
}
```

### Validación de Inputs

| Input | Rango válido | Mensaje de error |
|-------|-------------|-----------------|
| Capital | > 0 | Capital debe ser mayor a 0 |
| Tasas (Digital, P2P, BCV) | > 0 | Tasa debe ser mayor a 0 |
| Fees | 0% - 10% | Comisión debe estar entre 0% y 10% |
| Ciclos | 1 - 20 (entero) | Número de ciclos debe ser entre 1 y 20 |

## Hooks Personalizados

### useArbitrageCalc (Modificado)
```javascript
export function useArbitrageCalc() {
  const [inputs, setInputs] = useLocalStorage('arbitrage-calculator-inputs', DEFAULT_INPUTS);
  const [history, setHistory] = useLocalStorage('arbitrage-calculator-history', []);
  const [activeTab, setActiveTab] = useState('normal');

  // ... lógica existente ...

  // NUEVO: Guardar en historial
  const addToHistory = useCallback(() => {
    if (!validation.isValid) return;

    const record = {
      timestamp: new Date().toISOString(),
      inputs,
      results: {
        gananciaPct: singleCycleResult.gananciaPct,
        gananciaVES: singleCycleResult.gananciaVES,
        gananciaUSD: singleCycleResult.gananciaUSD,
        gananciaMulticicloVES: multiCycleResults[multiCycleResults.length - 1]?.gananciaAcumuladaVES || 0,
        gananciaMulticicloUSD: multiCycleResults[multiCycleResults.length - 1]?.gananciaAcumuladaUSD || 0
      }
    };

    setHistory(prev => [record, ...prev].slice(0, 20)); // Máximo 20 registros
  }, [inputs, validation.isValid, singleCycleResult, multiCycleResults]);

  return {
    // ... retornos existentes ...
    history,
    setHistory,
    activeTab,
    setActiveTab,
    addToHistory
  };
}
```

## Archivos a Crear/Modificar

### Nuevos Archivos
- `components/Tabs.jsx` - Sistema de tabs reusable
- `components/Modal.jsx` - Componente modal con backdrop
- `components/HistoryModal.jsx` - Modal de historial de operaciones
- `hooks/useDebounce.js` - Hook para debounce de guardado

### Archivos Modificados
- `components/RatesPanel.jsx` - Agregar tabs, fees personalizables, proyecciones
- `components/ResultsGrid.jsx` - Agregar card de multiciclo, mejoras de colores
- `components/SecondaryMetrics.jsx` - Aplicar paleta de colores semánticos
- `components/ResultCard.jsx` - Agregar soporte para subvalue y span
- `hooks/useArbitrageCalc.js` - Agregar lógica de historial y tabs
- `lib/arbitrage.js` - Agregar función calcCapitalRequerido
- `app/page.tsx` - Integrar nuevos componentes

## Consideraciones de Implementación

1. **Migración de localStorage existente**: Los usuarios que ya tienen el key `arbitrage-calculator-inputs` con fees deben migrar sus valores al formato actual.

2. **Performance**: El historial se guarda con debounce de 2 segundos para evitar escrituras excesivas en localStorage.

3. **Accesibilidad**: Todos los inputs tienen labels adecuados y estados de focus claros.

4. **Responsive**: El layout se adapta a móvil (1 columna) y desktop (2 columnas).

5. **PWA**: La app continúa siendo una PWA funcional con offline support.

6. **Testing**: Se deben agregar tests para:
   - Lógica de calculadora inversa
   - Guardado y carga de historial
   - Validación de inputs de fees

## Cronograma Estimado

1. Configurar hooks personalizados (useDebounce, history)
2. Modificar useArbitrageCalc con nueva lógica
3. Crear componentes base (Tabs, Modal)
4. Modificar RatesPanel con tabs y fees
5. Implementar calculadora inversa
6. Crear HistoryModal
7. Actualizar ResultsGrid con card de multiciclo
8. Aplicar mejoras de colores en ResultCard y SecondaryMetrics
9. Integrar todo en page.tsx
10. Testing y refinamiento
