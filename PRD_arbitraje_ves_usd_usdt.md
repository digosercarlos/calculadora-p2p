# PRD + Master Specs — Calculadora de Arbitraje VES/USD/USDT

**Proyecto:** Arbitrage Calc  
**Versión:** 1.0  
**Stack:** Next.js 14+ (App Router) + Tailwind CSS  
**Deploy:** Vercel  
**Persistencia:** localStorage — recordar tasas entre sesiones  
**PWA:** Sí — manifest + service worker, instalable en Android  
**Fuente de tasas:** 100% ingreso manual por el usuario  
**Referencia externa:** @monitordolarvzla (Instagram) — el usuario consulta y copia  
**Fecha:** Abril 2026  

---

## 1. Visión del Producto

Calculadora mobile-first (PWA) que permite a un operador de arbitraje
VES → USD Digital → USDT → VES visualizar en tiempo real:

- El **porcentaje de ganancia neta** del ciclo completo
- La **ganancia en USD y VES** dado un capital de trabajo
- El **detalle de cada paso** con comisiones desglosadas
- Métricas avanzadas: break-even, eficiencia, proyección multi-ciclo

El usuario consulta las tasas del día en @monitordolarvzla y las ingresa
manualmente. La app las recuerda entre sesiones vía localStorage.

---

## 2. Flujo del Arbitraje

```
VES (capital inicial)
  └─► Compra USD Digital en BDV
        comisión fija: 2.85%
        tasa: VES Digital (manual — ingresada por usuario)
  └─► USD en tarjeta digital BDV
        └─► Compra USDT vía Bpay en Binance
              comisión fija: 3.74%
        └─► USDT en Binance
              └─► Venta P2P en Binance
                    tasa: Binance P2P (manual — ingresada por usuario)
              └─► VES (resultado final)
```

---

## 3. Fórmulas Matemáticas

### Variables de entrada
| Variable | Descripción | Fuente |
|----------|-------------|--------|
| `C` | Capital inicial en VES | Manual |
| `T_d` | Tasa VES Digital (VES / 1 USD) | Manual — referencia @monitordolarvzla |
| `T_p2p` | Tasa Binance P2P (VES / 1 USDT) | Manual — referencia @monitordolarvzla |
| `T_bcv` | Tasa BCV oficial (VES / 1 USD) | Manual — referencia @monitordolarvzla |
| `FEE_bdv` | Comisión BDV | 0.0285 (default, configurable en UI) |
| `FEE_bpay` | Comisión Bpay | 0.0374 (default, configurable en UI) |
| `N` | Número de ciclos | Manual (default: 1) |

### Paso 1 — VES → USD Digital (BDV)
```
USD_bruto     = C / T_d
comision_BDV  = USD_bruto × FEE_bdv
USD_neto      = USD_bruto × (1 - FEE_bdv)
```

### Paso 2 — USD Digital → USDT (Bpay)
```
USDT_bruto    = USD_neto
comision_Bpay = USDT_bruto × FEE_bpay
USDT_neto     = USDT_bruto × (1 - FEE_bpay)
```

### Paso 3 — USDT → VES (P2P)
```
VES_final = USDT_neto × T_p2p
```

### Métricas del ciclo
```
ganancia_VES      = VES_final - C
ganancia_USD      = ganancia_VES / T_bcv
porcentaje        = (ganancia_VES / C) × 100
multiplicador     = VES_final / C                  (ej: 1.0247×)
comision_total_USD = comision_BDV + comision_Bpay  (en USD)
comision_total_VES = comision_total_USD × T_bcv    (en VES)
spread_pct        = ((T_p2p - T_d) / T_d) × 100   (spread P2P vs Digital)

break_even_T_p2p  = T_d / ((1 - FEE_bdv) × (1 - FEE_bpay))
                  ← tasa P2P mínima para ganancia = 0
```

### Multi-ciclo (N ciclos)
El capital se reinvierte: cada ciclo usa el VES_final del anterior.
```
Para ciclo i:
  C_i = VES_final del ciclo (i-1)    [C_1 = capital inicial]
  ... aplicar mismas fórmulas con C_i

ganancia_acumulada_VES = C_N_final - C_inicial
ganancia_acumulada_USD = ganancia_acumulada_VES / T_bcv
```

---

## 4. Funcionalidades (MVP)

### F1 — Panel de tasas (todos manuales)
| Campo | Tipo | Persistencia |
|-------|------|-------------|
| Tasa BCV (VES/USD) | Numérico decimal | ✅ localStorage |
| Tasa VES Digital (VES/USD) | Numérico decimal | ✅ localStorage |
| Tasa Binance P2P (VES/USDT) | Numérico decimal | ✅ localStorage |
| Capital a trabajar (VES) | Numérico entero | ✅ localStorage |
| Número de ciclos | Entero 1–20 | ✅ localStorage |

**Comisiones (configurables):**
| Campo | Tipo | Default | Persistencia |
|-------|------|---------|-------------|
| Comisión BDV | Porcentaje (0-100) | 2.85% | ✅ localStorage |
| Comisión Bpay | Porcentaje (0-100) | 3.74% | ✅ localStorage |

Hint visual debajo de cada campo de tasa:
> "Consulta las tasas del día en @monitordolarvzla" (con link a IG)

### F2 — Resultados reactivos (se recalculan en cada keystroke)
Cards principales:
- % de ganancia del ciclo (grande, con color semántico)
- Ganancia en VES
- Ganancia en USD
- Multiplicador del capital (ej: 1.0247×)

Cards secundarias:
- USD neto tras comisión BDV
- USDT neto tras comisión Bpay
- VES finales obtenidos
- Spread P2P vs Digital (%)
- Comisión total pagada (USD + VES)
- Tasa P2P break-even (mínima para no perder)

### F3 — Desglose por paso
Sección expandible con el flujo visual:
```
1 000 000 VES
    ÷ 92.50 = 10 810.81 USD bruto
    − 2.85% = 308.11 USD fee BDV
    → 10 502.70 USD neto

10 502.70 USD
    − 3.74% = 392.80 USDT fee Bpay
    → 10 109.90 USDT neto

10 109.90 USDT
    × 95.80 = 968 528 VES
    → PÉRDIDA de 31 472 VES
```

### F4 — Multi-ciclo
- Input: número de ciclos (1–20)
- Tabla: ciclo | capital entrada | VES al final | ganancia ciclo | ganancia acumulada VES | ganancia acumulada USD
- Gráfico de barras simple (opcional v1.1): crecimiento del capital por ciclo

### F5 — Persistencia localStorage
- Guardar automáticamente al cambiar cualquier campo
- Restaurar al abrir la app
- Botón "Resetear" para limpiar todos los valores
- No guardar el capital (o hacerlo opcional) — decisión de UX

### F6 — PWA / instalación Android
- `manifest.json` con nombre, íconos, colores
- Service Worker para funcionamiento offline (la app funciona sin internet porque no hace fetch)
- Meta `theme-color` para colorear la barra de estado del teléfono
- Instrucción in-app: "Instala la app → menú Chrome → Añadir a pantalla de inicio"

---

## 5. Stack Técnico y Estructura de Archivos

### Stack
| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14+ (App Router) |
| Estilos | Tailwind CSS |
| Deploy | Vercel |
| PWA | `next-pwa` o configuración manual con `next-sitemap` |
| Persistencia | localStorage (client-side hook) |
| Sin backend | Todo es client-side, sin API routes necesarias |

### PWA — `public/manifest.json`
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

### `app/layout.js` — head tags PWA
```jsx
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#09090b" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

### Estructura de archivos
```
/app
  layout.js                 ← PWA meta tags, fuentes, global styles
  page.js                   ← Shell principal (client component)

/components
  RatesPanel.jsx            ← 5 inputs de tasas + capital + ciclos
  ResultCard.jsx            ← Card reutilizable para métricas
  ResultsGrid.jsx           ← Grid 2×2 de cards principales
  SecondaryMetrics.jsx      ← Cards de métricas secundarias
  CycleBreakdown.jsx        ← Desglose visual paso a paso
  MultiCycleTable.jsx       ← Tabla de N ciclos con reinversión
  InstallPrompt.jsx         ← Banner "Añadir a pantalla de inicio"

/hooks
  useArbitrageCalc.js       ← Lógica de cálculo central (puro JS)
  useLocalStorage.js        ← Hook genérico de persistencia

/lib
  arbitrage.js              ← Funciones puras: calcCycle(), calcMulti()
  formatters.js             ← formatVES(), formatUSD(), formatPct()
  constants.js              ← FEE_BDV = 0.0285, FEE_BPAY = 0.0374

/public
  manifest.json
  sw.js                     ← Service Worker (cache-first para offline)
  icon-192.png
  icon-512.png
```

---

## 6. Hook Central — `useArbitrageCalc`

```js
// /hooks/useArbitrageCalc.js

const DEFAULT_STATE = {
  tasaBCV: '',
  tasaDigital: '',
  tasaP2P: '',
  capitalVES: '',
  numCiclos: 1,
  feeBDV: 2.85,
  feeBpay: 3.74,
}

// Output del hook
{
  // Estado (input)
  rates: { tasaBCV, tasaDigital, tasaP2P, capitalVES, numCiclos, feeBDV, feeBpay },
  setField: (key, value) => void,
  reset: () => void,

  // Resultados calculados (null si inputs incompletos)
  results: {
    // Paso 1
    usdBruto: number,
    comisionBDV_USD: number,
    usdNeto: number,

    // Paso 2
    comisionBpay_USDT: number,
    usdtNeto: number,

    // Paso 3
    vesFinales: number,

    // Métricas ciclo único
    gananciaPct: number,
    gananciaVES: number,
    gananciaUSD: number,
    multiplicador: number,
    spreadPct: number,
    comisionTotalUSD: number,
    comisionTotalVES: number,
    breakEvenP2P: number,
    esRentable: boolean,

    // Multi-ciclo
    ciclos: Array<{
      n: number,
      capitalEntrada: number,
      vesFinales: number,
      gananciaCicloVES: number,
      gananciaAcumuladaVES: number,
      gananciaAcumuladaUSD: number,
    }>
  } | null
}
```

---

## 7. Funciones Puras — `/lib/arbitrage.js`

```js
// Valores por defecto (se pueden sobrescribir desde la UI)
export const DEFAULT_FEE_BDV = 0.0285;  // 2.85%
export const DEFAULT_FEE_BPAY = 0.0374; // 3.74%

export function calcCycle({ capital, tasaDigital, tasaP2P, tasaBCV, feeBDV = DEFAULT_FEE_BDV, feeBpay = DEFAULT_FEE_BPAY }) {
  const usdBruto = capital / tasaDigital
  const comisionBDV = usdBruto * FEE_BDV
  const usdNeto = usdBruto * (1 - FEE_BDV)
  const comisionBpay = usdNeto * FEE_BPAY
  const usdtNeto = usdNeto * (1 - FEE_BPAY)
  const vesFinales = usdtNeto * tasaP2P

  const gananciaVES = vesFinales - capital
  const gananciaUSD = gananciaVES / tasaBCV
  const gananciaPct = (gananciaVES / capital) * 100
  const multiplicador = vesFinales / capital
  const spreadPct = ((tasaP2P - tasaDigital) / tasaDigital) * 100
  const comisionTotalUSD = comisionBDV + comisionBpay
  const comisionTotalVES = comisionTotalUSD * tasaBCV
  const breakEvenP2P = tasaDigital / ((1 - FEE_BDV) * (1 - FEE_BPAY))

  return {
    usdBruto, comisionBDV_USD: comisionBDV, usdNeto,
    comisionBpay_USDT: comisionBpay, usdtNeto, vesFinales,
    gananciaVES, gananciaUSD, gananciaPct, multiplicador,
    spreadPct, comisionTotalUSD, comisionTotalVES, breakEvenP2P,
    esRentable: gananciaVES > 0
  }
}

export function calcMultiCiclo({ capital, tasaDigital, tasaP2P, tasaBCV, n, feeBDV = DEFAULT_FEE_BDV, feeBpay = DEFAULT_FEE_BPAY }) {
  const ciclos = []
  let capitalActual = capital
  for (let i = 1; i <= n; i++) {
    const r = calcCycle({ capital: capitalActual, tasaDigital, tasaP2P, tasaBCV, feeBDV, feeBpay })
    ciclos.push({
      n: i,
      capitalEntrada: capitalActual,
      vesFinales: r.vesFinales,
      gananciaCicloVES: r.gananciaVES,
      gananciaAcumuladaVES: r.vesFinales - capital,
      gananciaAcumuladaUSD: (r.vesFinales - capital) / tasaBCV,
    })
    capitalActual = r.vesFinales
  }
  return ciclos
}
```

---

## 8. UI — Layout Mobile First

### Wireframe móvil
```
┌─────────────────────────────┐
│  ARBITRAGE CALC        [↻]  │  ← header con botón reset
├─────────────────────────────┤
│  TASAS DEL DÍA              │
│  ┌─────────────────────┐    │
│  │ BCV      [  91.45 ] │    │
│  │ Digital  [  92.50 ] │    │
│  │ P2P      [  97.80 ] │    │
│  └─────────────────────┘    │
│  Capital VES [1.000.000]    │
│  Ciclos      [    1    ]    │
│  "Tasas de @monitordolarvzla"│
├─────────────────────────────┤
│  ┌──────────┐ ┌──────────┐  │
│  │  +2.47%  │ │ +$25.40  │  │  ← verde si rentable
│  │ ganancia │ │  en USD  │  │     rojo si pérdida
│  └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐  │
│  │ 24.700   │ │  1.0247× │  │
│  │  VES     │ │  capital │  │
│  └──────────┘ └──────────┘  │
├─────────────────────────────┤
│  DESGLOSE  [expandir ▼]     │
│  1.000.000 VES              │
│    ÷ 92.50 → 10.810 USD     │
│    −2.85% → 10.503 USD neto │
│    −3.74% → 10.110 USDT     │
│    ×97.80 → 1.024.700 VES   │
├─────────────────────────────┤
│  MÉTRICAS                   │
│  Break-even P2P: 96.22      │
│  Spread P2P/Digital: +5.7%  │
│  Comisiones: $7.01 USD      │
├─────────────────────────────┤
│  MULTI-CICLO (N=3)          │
│  #  Capital     Ganancia    │
│  1  1.000.000   +24.700     │
│  2  1.024.700   +25.310     │
│  3  1.050.010   +25.938     │
└─────────────────────────────┘
```

### Colores semánticos
| Estado | Color Tailwind |
|--------|---------------|
| Ganancia positiva | `text-emerald-400` / `bg-emerald-950` |
| Pérdida | `text-red-400` / `bg-red-950` |
| Comisiones | `text-amber-400` |
| Neutro / referencia | `text-zinc-400` |
| Fondo app | `bg-zinc-950` (dark default) |
| Cards | `bg-zinc-900 border border-zinc-800` |

### UX Rules
- Cálculos reactivos: recalcular en cada `onChange`
- Inputs aceptan `.` y `,` como separador decimal
- Formato visual de miles: `1.000.000` (punto como separador en VES)
- `inputMode="decimal"` en todos los campos numéricos (teclado numérico en mobile)
- Si algún campo está vacío, mostrar cards en estado "—" sin error agresivo
- Feedback inmediato: el color del % de ganancia cambia en tiempo real

---

## 9. Validaciones y Edge Cases

| Condición | Comportamiento |
|-----------|---------------|
| Campo vacío | Mostrar "—" en resultados, sin bloquear |
| T_p2p < T_d | Warning badge: "La tasa P2P es menor que la Digital" |
| Ciclo en pérdida | Cards en rojo + mensaje "Ciclo no rentable" |
| Capital = 0 | No calcular |
| Tasas = 0 | No calcular (división por cero) |
| N ciclos muy alto (>20) | Cap en 20 para no sobrecargar la tabla |

---

## 10. Valores de Prueba para QA

```
Tasa BCV:      91.20 VES/USD
Tasa Digital:  92.50 VES/USD
Tasa P2P:      97.80 VES/USDT
Capital:       1.000.000 VES
Ciclos:        1

Paso 1:
  USD bruto    = 1.000.000 / 92.50      = 10.810,81 USD
  Fee BDV      = 10.810,81 × 2.85%     =    308,11 USD
  USD neto     = 10.810,81 - 308,11    = 10.502,70 USD

Paso 2:
  USDT bruto   = 10.502,70
  Fee Bpay     = 10.502,70 × 3.74%     =    392,80 USDT
  USDT neto    = 10.502,70 - 392,80    = 10.109,90 USDT

Paso 3:
  VES finales  = 10.109,90 × 97.80     = 988.748,22 VES

Resultado:
  Ganancia VES = 988.748,22 - 1.000.000 = -11.251,78 VES  ← PÉRDIDA
  Ganancia USD = -11.251,78 / 91.20     =    -123,37 USD
  Porcentaje   = -1.125%
  Break-even P2P ≈ 98.91 VES/USDT

→ Con P2P = 99.40 el ciclo entra en ganancia mínima
→ La tasa P2P necesita superar ~7.43% a la Digital para cubrir ambas comisiones
```

---

## 11. Service Worker (Offline)

La app es 100% client-side y no hace fetch. El SW debe:
1. Pre-cachear todos los assets en install (`cache-first`)
2. Responder desde caché cuando no hay red
3. No intentar cachear recursos externos

```js
// /public/sw.js (simplificado)
const CACHE = 'arbcalc-v1'
const ASSETS = ['/', '/index.html', '/_next/static/...']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)))
})
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)))
})
```

> Con `next-pwa` esto se genera automáticamente — no es necesario escribirlo a mano.

---

## 12. Criterios de Aceptación

- [ ] Dado capital=1.000.000, Digital=92.50, P2P=97.80, BCV=91.20 → el resultado coincide con los valores de prueba del punto 10
- [ ] Al cerrar y reabrir la app, las tasas ingresadas persisten
- [ ] En Android, Chrome muestra banner "Añadir a pantalla de inicio"
- [ ] La app funciona completamente sin conexión a internet
- [ ] Con P2P < break-even, los cards se muestran en rojo
- [ ] Con P2P > break-even, los cards se muestran en verde
- [ ] Cambiar cualquier campo actualiza todos los resultados inmediatamente
- [ ] Los inputs abren teclado numérico en móvil
- [ ] La tabla multi-ciclo muestra capitalización correcta (reinversión)
- [ ] El break-even P2P calculado coincide con la fórmula matemática

---

## 13. Prompt de Inicio para Claude Code

Pegar esto al iniciar la sesión de Claude Code:

```
Quiero construir una PWA mobile-first con Next.js 14 (App Router) + Tailwind CSS.
Es una calculadora de arbitraje VES/USD/USDT. Lee el PRD completo adjunto antes
de escribir cualquier código. 

Empieza por:
1. Crear la estructura de carpetas y archivos base
2. Implementar /lib/arbitrage.js con las funciones puras y sus unit tests
3. Implementar useArbitrageCalc.js y useLocalStorage.js
4. Construir los componentes de menor a mayor: ResultCard → RatesPanel → ResultsGrid → CycleBreakdown → MultiCycleTable
5. Configurar la PWA (manifest.json + next-pwa)
6. Estilo dark mode por defecto con Tailwind zinc palette

Valida cada paso con los valores de prueba del punto 10 del PRD antes de continuar.
```

---

## 14. Roadmap v2

- Historial de operaciones con timestamp y exportar a CSV
- Alertas: notificar cuando el spread supere X% configurable
- Proyección de ganancia anual si se hacen N ciclos por día
- Calculadora inversa: ¿cuánto capital necesito para ganar $X?
- Widget compartible por URL con parámetros pre-cargados (`?digital=92.5&p2p=97.8`)
- Soporte multi-cuenta con diferentes límites por operador
