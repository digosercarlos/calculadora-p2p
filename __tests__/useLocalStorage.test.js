import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useLocalStorage } from '../hooks/useLocalStorage';

describe('useLocalStorage', () => {
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

  describe('initial value', () => {
    it('returns initial value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      expect(result.current[0]).toBe('default');
    });

    it('returns stored value when localStorage has data', () => {
      localStorageMock.setItem('test-key', JSON.stringify('stored-value'));
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      expect(result.current[0]).toBe('stored-value');
    });

    it('returns default value when stored value is invalid JSON', () => {
      localStorageMock.setItem('test-key', 'invalid-json');
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      expect(result.current[0]).toBe('default');
    });

    it('handles numbers', () => {
      const { result } = renderHook(() => useLocalStorage('number-key', 42));
      expect(result.current[0]).toBe(42);
    });

    it('handles booleans', () => {
      const { result } = renderHook(() => useLocalStorage('bool-key', true));
      expect(result.current[0]).toBe(true);
    });

    it('handles objects', () => {
      const defaultValue = { name: 'test', value: 123 };
      const { result } = renderHook(() => useLocalStorage('object-key', defaultValue));
      expect(result.current[0]).toEqual(defaultValue);
    });

    it('handles arrays', () => {
      const defaultValue = [1, 2, 3];
      const { result } = renderHook(() => useLocalStorage('array-key', defaultValue));
      expect(result.current[0]).toEqual(defaultValue);
    });

    it('handles null default value', () => {
      const { result } = renderHook(() => useLocalStorage('null-key', null));
      expect(result.current[0]).toBeNull();
    });
  });

  describe('setter function', () => {
    it('updates value and stores in localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
      expect(localStorageMock.getItem('test-key')).toBe(JSON.stringify('new-value'));
    });

    it('updates number value', () => {
      const { result } = renderHook(() => useLocalStorage('number-key', 0));

      act(() => {
        result.current[1](100);
      });

      expect(result.current[0]).toBe(100);
      expect(localStorageMock.getItem('number-key')).toBe(JSON.stringify(100));
    });

    it('updates boolean value', () => {
      const { result } = renderHook(() => useLocalStorage('bool-key', true));

      act(() => {
        result.current[1](false);
      });

      expect(result.current[0]).toBe(false);
      expect(localStorageMock.getItem('bool-key')).toBe(JSON.stringify(false));
    });

    it('updates object value', () => {
      const { result } = renderHook(() => useLocalStorage('object-key', {}));

      const newValue = { name: 'updated', count: 5 };
      act(() => {
        result.current[1](newValue);
      });

      expect(result.current[0]).toEqual(newValue);
      expect(localStorageMock.getItem('object-key')).toBe(JSON.stringify(newValue));
    });

    it('updates array value', () => {
      const { result } = renderHook(() => useLocalStorage('array-key', []));

      const newValue = [4, 5, 6];
      act(() => {
        result.current[1](newValue);
      });

      expect(result.current[0]).toEqual(newValue);
      expect(localStorageMock.getItem('array-key')).toBe(JSON.stringify(newValue));
    });

    it('can set value to null', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

      act(() => {
        result.current[1](null);
      });

      expect(result.current[0]).toBeNull();
      expect(localStorageMock.getItem('test-key')).toBe(JSON.stringify(null));
    });
  });

  describe('functional updates', () => {
    it('supports functional updates for numbers', () => {
      const { result } = renderHook(() => useLocalStorage('counter-key', 0));

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(1);

      act(() => {
        result.current[1]((prev) => prev * 2);
      });

      expect(result.current[0]).toBe(2);
    });

    it('supports functional updates for arrays', () => {
      const { result } = renderHook(() => useLocalStorage('list-key', [1, 2, 3]));

      act(() => {
        result.current[1]((prev) => [...prev, 4]);
      });

      expect(result.current[0]).toEqual([1, 2, 3, 4]);
    });

    it('supports functional updates for objects', () => {
      const { result } = renderHook(() => useLocalStorage('obj-key', { count: 0 }));

      act(() => {
        result.current[1]((prev) => ({ ...prev, count: prev.count + 1 }));
      });

      expect(result.current[0]).toEqual({ count: 1 });
    });
  });

  describe('SSR safety', () => {
    it('works when localStorage is not available', () => {
      const originalLocalStorage = global.localStorage;
      delete global.localStorage;

      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      expect(result.current[0]).toBe('default');

      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');

      global.localStorage = originalLocalStorage;
    });
  });

  describe('synchronization across tabs', () => {
    it('listens for storage events from other tabs', () => {
      const { result } = renderHook(() => useLocalStorage('shared-key', 'initial'));

      expect(result.current[0]).toBe('initial');

      // Simulate storage event from another tab (using actual window.localStorage)
      act(() => {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'shared-key',
          newValue: JSON.stringify('updated-from-other-tab'),
          oldValue: JSON.stringify('initial'),
        }));
      });

      expect(result.current[0]).toBe('updated-from-other-tab');
    });
  });
});
