/**
 * LED Eye-Sensitivity Non-linear Brightness Curve
 *
 * Human visual perception of light intensity follows Stevens' Power Law,
 * where perceived brightness B is approximately proportional to I^0.6 for diffused LEDs:
 *
 *   B(I) = min(1.0, (I / I_ref)^0.6)
 *
 * Reference:
 * - I_ref = 20mA (0.02A) is nominal standard LED forward test current.
 * - For reference 5V supply + 330 ohm resistor:
 *   I = (5.0V - 2.0V) / 330 ohm = 9.09mA (0.00909A).
 *   B(9.09mA) = (9.09 / 20)^0.6 ~= (0.4545)^0.6 ~= 0.62 (ideal visual visibility in classroom).
 * - For reverse bias or open circuit: I <= 0.1mA -> B = 0.0.
 */

export function calculateLEDBrightness(currentA: number): number {
  if (currentA <= 0.0001) {
    return 0.0;
  }
  const iRef = 0.02; // 20mA reference
  const ratio = currentA / iRef;
  const brightness = Math.min(1.0, Math.pow(ratio, 0.6));
  return Math.round(brightness * 1000) / 1000;
}
