import { calcCycle, calcMultiCycles } from '../lib/arbitrage';

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
    expect(result.vesFinales).toBeCloseTo(988748.38, 2);
    expect(result.gananciaVES).toBeCloseTo(-11251.62, 2);
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
