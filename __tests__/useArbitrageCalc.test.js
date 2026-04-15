import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useArbitrageCalc } from '../hooks/useArbitrageCalc';

describe('useArbitrageCalc', () => {
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => {
        store[key] = String(value);
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    global.localStorage = localStorageMock;
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('initial state', () => {
    it('loads default inputs when localStorage is empty', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      expect(result.current.inputs).toEqual({
        capital: 1000000,
        tasaDigital: 92.50,
        tasaP2P: 97.80,
        tasaBCV: 91.20,
        feeBDV: 0.0285,
        feeBpay: 0.0374,
        n: 3
      });
    });

    it('calculates single cycle result with default inputs', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      expect(result.current.singleCycleResult).toBeDefined();
      expect(result.current.singleCycleResult.gananciaVES).toBeCloseTo(-11251.62, 2);
      expect(result.current.singleCycleResult.esRentable).toBe(false);
    });

    it('calculates multi cycle results with default inputs', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      expect(result.current.multiCycleResults).toHaveLength(3);
      expect(result.current.multiCycleResults[0].n).toBe(1);
      expect(result.current.multiCycleResults[0].capitalEntrada).toBe(1000000);
    });

    it('validates default inputs', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      expect(result.current.isValid).toBe(true);
      expect(result.current.errors).toEqual({});
    });
  });

  describe('updateInput', () => {
    it('updates a single input value', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('capital', 2000000);
      });

      expect(result.current.inputs.capital).toBe(2000000);
      expect(result.current.singleCycleResult.capitalEntrada).toBeUndefined();
      expect(result.current.singleCycleResult.gananciaVES).toBeDefined();
    });

    it('recalculates results when input changes', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      const originalGanancia = result.current.singleCycleResult.gananciaVES;

      act(() => {
        result.current.updateInput('tasaP2P', 99.40);
      });

      expect(result.current.singleCycleResult.gananciaVES).not.toBe(originalGanancia);
      expect(result.current.singleCycleResult.esRentable).toBe(true);
    });

    it('updates number of cycles for multi cycle results', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('n', 5);
      });

      expect(result.current.multiCycleResults).toHaveLength(5);
      expect(result.current.multiCycleResults[4].n).toBe(5);
    });
  });

  describe('updateInputs', () => {
    it('updates multiple inputs at once', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInputs({
          capital: 5000000,
          tasaP2P: 99.50,
          n: 5
        });
      });

      expect(result.current.inputs.capital).toBe(5000000);
      expect(result.current.inputs.tasaP2P).toBe(99.50);
      expect(result.current.inputs.n).toBe(5);
    });

    it('recalculates with updated inputs', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInputs({
          capital: 5000000,
          tasaP2P: 99.50
        });
      });

      expect(result.current.singleCycleResult.gananciaVES).toBeGreaterThan(0);
      expect(result.current.multiCycleResults).toHaveLength(3);
      expect(result.current.multiCycleResults[0].capitalEntrada).toBe(5000000);
    });
  });

  describe('setInputs', () => {
    it('replaces all inputs with new values', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      const newInputs = {
        capital: 2500000,
        tasaDigital: 95.00,
        tasaP2P: 100.00,
        tasaBCV: 92.00,
        feeBDV: 0.025,
        feeBpay: 0.035,
        n: 4
      };

      act(() => {
        result.current.setInputs(newInputs);
      });

      expect(result.current.inputs).toEqual(newInputs);
      expect(result.current.multiCycleResults).toHaveLength(4);
    });

    it('supports functional updates', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.setInputs((prev) => ({
          ...prev,
          capital: prev.capital * 2
        }));
      });

      expect(result.current.inputs.capital).toBe(2000000);
    });
  });

  describe('reset', () => {
    it('resets all inputs to default values', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInputs({
          capital: 5000000,
          tasaP2P: 99.50,
          n: 10
        });
      });

      expect(result.current.inputs.capital).toBe(5000000);
      expect(result.current.inputs.n).toBe(10);

      act(() => {
        result.current.reset();
      });

      expect(result.current.inputs).toEqual({
        capital: 1000000,
        tasaDigital: 92.50,
        tasaP2P: 97.80,
        tasaBCV: 91.20,
        feeBDV: 0.0285,
        feeBpay: 0.0374,
        n: 3
      });
    });

    it('clears localStorage on reset', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('capital', 3000000);
      });

      expect(localStorageMock.getItem('arbitrage-calculator-inputs')).toBeTruthy();

      act(() => {
        result.current.reset();
      });

      const stored = JSON.parse(localStorageMock.getItem('arbitrage-calculator-inputs'));
      expect(stored.capital).toBe(1000000);
    });
  });

  describe('validation', () => {
    it('detects invalid capital (zero)', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('capital', 0);
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.errors.capital).toBe('Capital must be greater than 0');
    });

    it('detects invalid capital (negative)', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('capital', -1000);
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.errors.capital).toBe('Capital must be greater than 0');
    });

    it('detects invalid digital rate', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('tasaDigital', 0);
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.errors.tasaDigital).toBe('Digital rate must be greater than 0');
    });

    it('detects invalid P2P rate', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('tasaP2P', -50);
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.errors.tasaP2P).toBe('P2P rate must be greater than 0');
    });

    it('detects invalid BCV rate', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('tasaBCV', 0);
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.errors.tasaBCV).toBe('BCV rate must be greater than 0');
    });

    it('detects invalid BDV fee (too high)', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('feeBDV', 1.5);
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.errors.feeBDV).toBe('BDV fee must be between 0 and 1');
    });

    it('detects invalid BDV fee (negative)', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('feeBDV', -0.1);
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.errors.feeBDV).toBe('BDV fee must be between 0 and 1');
    });

    it('detects invalid Bpay fee', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('feeBpay', 2.0);
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.errors.feeBpay).toBe('Bpay fee must be between 0 and 1');
    });

    it('detects invalid number of cycles (zero)', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('n', 0);
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.errors.n).toBe('Number of cycles must be a positive integer');
    });

    it('detects invalid number of cycles (non-integer)', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('n', 2.5);
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.errors.n).toBe('Number of cycles must be a positive integer');
    });

    it('collects multiple validation errors', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInputs({
          capital: -1000,
          tasaDigital: 0,
          n: 0
        });
      });

      expect(result.current.isValid).toBe(false);
      expect(Object.keys(result.current.errors)).toHaveLength(3);
      expect(result.current.errors.capital).toBeDefined();
      expect(result.current.errors.tasaDigital).toBeDefined();
      expect(result.current.errors.n).toBeDefined();
    });

    it('returns null results when validation fails', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('capital', 0);
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.singleCycleResult).toBeNull();
      expect(result.current.multiCycleResults).toEqual([]);
    });
  });

  describe('localStorage persistence', () => {
    it('saves inputs to localStorage on update', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInputs({
          capital: 2000000,
          tasaP2P: 99.00,
          n: 5
        });
      });

      const stored = JSON.parse(localStorageMock.getItem('arbitrage-calculator-inputs'));
      expect(stored.capital).toBe(2000000);
      expect(stored.tasaP2P).toBe(99.00);
      expect(stored.n).toBe(5);
    });

    it('loads inputs from localStorage on mount', () => {
      const savedInputs = {
        capital: 3000000,
        tasaDigital: 95.00,
        tasaP2P: 100.00,
        tasaBCV: 93.00,
        feeBDV: 0.025,
        feeBpay: 0.035,
        n: 4
      };

      localStorageMock.setItem('arbitrage-calculator-inputs', JSON.stringify(savedInputs));

      const { result } = renderHook(() => useArbitrageCalc());

      expect(result.current.inputs).toEqual(savedInputs);
      expect(result.current.multiCycleResults).toHaveLength(4);
    });
  });

  describe('calculation accuracy', () => {
    it('matches calcCycle results exactly', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      const hookResult = result.current.singleCycleResult;

      expect(hookResult.usdBruto).toBeCloseTo(10810.81, 2);
      expect(hookResult.comisionBDV_USD).toBeCloseTo(308.11, 2);
      expect(hookResult.usdNeto).toBeCloseTo(10502.70, 2);
      expect(hookResult.comisionBpay_USDT).toBeCloseTo(392.80, 2);
      expect(hookResult.usdtNeto).toBeCloseTo(10109.90, 2);
      expect(hookResult.vesFinales).toBeCloseTo(988748.38, 2);
      expect(hookResult.gananciaVES).toBeCloseTo(-11251.62, 2);
      expect(hookResult.gananciaUSD).toBeCloseTo(-123.37, 2);
      expect(hookResult.gananciaPct).toBeCloseTo(-1.125, 3);
      expect(hookResult.multiplicador).toBeCloseTo(0.9887, 4);
      expect(hookResult.spreadPct).toBeCloseTo(5.73, 2);
      expect(hookResult.breakEvenP2P).toBeCloseTo(98.91, 2);
    });

    it('calculates profitable cycle correctly', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('tasaP2P', 99.40);
      });

      expect(result.current.singleCycleResult.gananciaVES).toBeGreaterThan(0);
      expect(result.current.singleCycleResult.esRentable).toBe(true);
    });

    it('compounds capital correctly across cycles', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('tasaP2P', 99.40);
      });

      const cycles = result.current.multiCycleResults;

      expect(cycles[0].capitalEntrada).toBe(1000000);
      expect(cycles[1].capitalEntrada).toBe(cycles[0].vesFinales);
      expect(cycles[2].capitalEntrada).toBe(cycles[1].vesFinales);
    });
  });

  describe('edge cases', () => {
    it('handles boundary values correctly', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInputs({
          capital: 1,
          tasaDigital: 1,
          tasaP2P: 1.01,
          tasaBCV: 1,
          feeBDV: 0,
          feeBpay: 0,
          n: 1
        });
      });

      expect(result.current.isValid).toBe(true);
      expect(result.current.singleCycleResult).toBeDefined();
    });

    it('handles very large values', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInput('capital', 10000000000);
      });

      expect(result.current.isValid).toBe(true);
      expect(result.current.singleCycleResult).toBeDefined();
    });

    it('handles very small positive fees', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInputs({
          feeBDV: 0.0001,
          feeBpay: 0.0001
        });
      });

      expect(result.current.isValid).toBe(true);
      expect(result.current.singleCycleResult).toBeDefined();
    });

    it('handles fees at boundary (0 and 1)', () => {
      const { result } = renderHook(() => useArbitrageCalc());

      act(() => {
        result.current.updateInputs({
          feeBDV: 0,
          feeBpay: 0
        });
      });

      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.updateInputs({
          feeBDV: 1,
          feeBpay: 1
        });
      });

      expect(result.current.isValid).toBe(true);
    });
  });
});
