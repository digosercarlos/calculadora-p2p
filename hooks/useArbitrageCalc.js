import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { calcCycle, calcMultiCycles } from '../lib/arbitrage.js';
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

  if (inputs.feeBDV < 0 || inputs.feeBDV > 1) {
    errors.feeBDV = 'BDV fee must be between 0 and 1';
  }

  if (inputs.feeBpay < 0 || inputs.feeBpay > 1) {
    errors.feeBpay = 'Bpay fee must be between 0 and 1';
  }

  if (inputs.n < 1 || !Number.isInteger(inputs.n)) {
    errors.n = 'Number of cycles must be a positive integer';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function useArbitrageCalc() {
  const [inputs, setInputs] = useLocalStorage(STORAGE_KEY, DEFAULT_INPUTS);

  const validation = useMemo(() => validateInputs(inputs), [inputs]);

  const singleCycleResult = useMemo(() => {
    if (!validation.isValid) {
      return null;
    }

    try {
      return calcCycle({
        capital: inputs.capital,
        tasaDigital: inputs.tasaDigital,
        tasaP2P: inputs.tasaP2P,
        tasaBCV: inputs.tasaBCV,
        feeBDV: inputs.feeBDV,
        feeBpay: inputs.feeBpay
      });
    } catch (error) {
      console.error('Error calculating single cycle:', error);
      return null;
    }
  }, [inputs, validation.isValid]);

  const multiCycleResults = useMemo(() => {
    if (!validation.isValid) {
      return [];
    }

    try {
      return calcMultiCycles({
        capital: inputs.capital,
        tasaDigital: inputs.tasaDigital,
        tasaP2P: inputs.tasaP2P,
        tasaBCV: inputs.tasaBCV,
        n: inputs.n,
        feeBDV: inputs.feeBDV,
        feeBpay: inputs.feeBpay
      });
    } catch (error) {
      console.error('Error calculating multi cycles:', error);
      return [];
    }
  }, [inputs, validation.isValid]);

  const updateInput = (key, value) => {
    setInputs((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const updateInputs = (newInputs) => {
    setInputs((prev) => ({
      ...prev,
      ...newInputs
    }));
  };

  const reset = () => {
    setInputs(DEFAULT_INPUTS);
  };

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
    errors: validation.errors
  };
}
