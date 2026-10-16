/**
 * Educational Voltage Color Map
 * Maps calculated electrical node voltages relative to GND (0V) to distinct visual hues.
 */

export function getVoltageColor(voltageV: number | undefined): string {
  if (voltageV === undefined || isNaN(voltageV)) {
    return '#64748b'; // Unresolved / Floating neutral slate
  }

  if (voltageV >= 4.5) {
    return '#f43f5e'; // VCC High Potential (5V) - Electric Rose
  } else if (voltageV >= 2.5) {
    return '#ffb95a'; // Intermediate High (3V - 4.5V) - Warm Amber
  } else if (voltageV >= 1.0) {
    return '#10b981'; // Intermediate Mid (1V - 2.5V) - Conductive Emerald
  } else if (voltageV > 0.05) {
    return '#38bdf8'; // Low Positive (0.05V - 1V) - Sky Blue
  } else if (Math.abs(voltageV) <= 0.05) {
    return '#06b6d4'; // GND Reference (0V) - Pure Cyan
  } else {
    return '#a855f7'; // Negative Potential (if any) - Violet
  }
}

export function formatVoltage(voltageV: number | undefined): string {
  if (voltageV === undefined || isNaN(voltageV)) {
    return 'Floating (Open)';
  }
  return `${voltageV.toFixed(2)} V`;
}
