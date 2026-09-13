import type { Thresholds, Vital } from "./types";
import { DEFAULT_THRESHOLDS } from "./types";

export function isOutOfRange(vital: Vital, thresholds?: Thresholds): boolean {
  const t = thresholds ?? DEFAULT_THRESHOLDS;
  if (vital.type === "bp") {
    const sys = vital.systolic ?? 0;
    const dia = vital.diastolic ?? 0;
    return sys > t.bpSysMax || sys < t.bpSysMin || dia > t.bpDiaMax || dia < t.bpDiaMin;
  }
  const value = vital.type === "hr" ? (vital.bpm ?? vital.value ?? 0) : (vital.value ?? 0);
  switch (vital.type) {
    case "hr":
      return value > t.hrMax || value < t.hrMin;
    case "glucose":
      return value > t.glucoseMax || value < t.glucoseMin;
    case "spo2":
      return value < t.spo2Min;
    case "temp":
      return value > t.tempMax || value < t.tempMin;
    case "weight":
      if (t.weightMax && value > t.weightMax) return true;
      if (t.weightMin && value < t.weightMin) return true;
      return false;
    default:
      return false;
  }
}

export function vitalDisplay(vital: Vital): string {
  if (vital.type === "bp") {
    return `${vital.systolic}/${vital.diastolic}`;
  }
  if (vital.type === "hr") return `${vital.bpm ?? vital.value}`;
  if (vital.type === "temp") return `${vital.value?.toFixed(1)}`;
  if (vital.type === "weight") return `${vital.value?.toFixed(1)}`;
  return `${vital.value}`;
}
