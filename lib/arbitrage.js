import { DEFAULT_FEE_BDV, DEFAULT_FEE_BPAY } from './constants.js';

export function calcCycle({ capital, tasaDigital, tasaP2P, tasaBCV, feeBDV = DEFAULT_FEE_BDV, feeBpay = DEFAULT_FEE_BPAY }) {
  const usdBruto = capital / tasaDigital;
  const comisionBDV = usdBruto * feeBDV;
  const usdNeto = usdBruto * (1 - feeBDV);
  const comisionBpay = usdNeto * feeBpay;
  const usdtNeto = usdNeto * (1 - feeBpay);
  const vesFinales = usdtNeto * tasaP2P;

  const gananciaVES = vesFinales - capital;
  const gananciaUSD = gananciaVES / tasaBCV;
  const gananciaPct = (gananciaVES / capital) * 100;
  const multiplicador = vesFinales / capital;
  const spreadPct = ((tasaP2P - tasaDigital) / tasaDigital) * 100;
  const comisionTotalUSD = comisionBDV + comisionBpay;
  const comisionTotalVES = comisionTotalUSD * tasaBCV;
  const breakEvenP2P = tasaDigital / ((1 - feeBDV) * (1 - feeBpay));

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

export function calcMultiCycles({ capital, tasaDigital, tasaP2P, tasaBCV, n, feeBDV = DEFAULT_FEE_BDV, feeBpay = DEFAULT_FEE_BPAY }) {
  const cycles = [];
  let capitalActual = capital;

  for (let i = 1; i <= n; i++) {
    const r = calcCycle({ capital: capitalActual, tasaDigital, tasaP2P, tasaBCV, feeBDV, feeBpay });
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
