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
