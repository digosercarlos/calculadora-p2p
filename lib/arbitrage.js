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
