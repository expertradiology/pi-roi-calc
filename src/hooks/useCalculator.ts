import { useState, useMemo, useCallback } from "react";
import { SLIDER_CONFIGS } from "../lib/constants";

export interface CalculatorResults {
  annualCases: number;
  casesWithImaging: number;
  casesUnderreported: number;
  casesMadeActionable: number;
  additionalPerCase: number;
  totalAdditionalRevenue: number;
  annualCost: number;
  netGain: number;
  roi: number;
  perCaseValue: number;
}

type SliderValues = Record<string, number>;

function getDefaults(): SliderValues {
  const defaults: SliderValues = {};
  for (const cfg of SLIDER_CONFIGS) {
    defaults[cfg.key] = cfg.defaultValue;
  }
  return defaults;
}

export function useCalculator() {
  const [values, setValues] = useState<SliderValues>(getDefaults);

  const setValue = useCallback((key: string, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(getDefaults());
  }, []);

  const results: CalculatorResults = useMemo(() => {
    const v = values;
    const annualCases = v.casesPerMonth * 12;
    const casesWithImaging = annualCases * (v.pctWithImaging / 100);
    const casesUnderreported = casesWithImaging * (v.underreportedRate / 100);
    const casesMadeActionable = casesUnderreported * (v.clarityUplift / 100);
    const additionalPerCase = v.avgSettlement * (v.settlementUplift / 100);
    const totalAdditionalRevenue = casesMadeActionable * additionalPerCase;
    const annualCost = casesWithImaging * v.costPerReport;
    const netGain = totalAdditionalRevenue - annualCost;
    const roi = annualCost > 0 ? (netGain / annualCost) * 100 : 0;
    const perCaseValue = casesWithImaging > 0 ? netGain / casesWithImaging : 0;
    return {
      annualCases, casesWithImaging, casesUnderreported, casesMadeActionable,
      additionalPerCase, totalAdditionalRevenue, annualCost, netGain, roi, perCaseValue,
    };
  }, [values]);

  return { values, setValue, reset, results };
}
