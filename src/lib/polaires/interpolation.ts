import type { DonneesPolaire } from './types';

export function getRefSpeed(ref: DonneesPolaire, angle: number, twsVal: number): number | null {
  const { twa, tws, speeds } = ref;

  if (angle < twa[0] || angle > twa[twa.length - 1]) return null;
  let ri0 = 0;
  for (let i = 0; i < twa.length - 1; i++) {
    if (twa[i] <= angle && angle <= twa[i + 1]) { ri0 = i; break; }
  }
  const ri1 = twa[ri0] === angle ? ri0 : ri0 + 1;
  const twaFrac = ri0 === ri1 ? 0 : (angle - twa[ri0]) / (twa[ri1] - twa[ri0]);

  if (twsVal < tws[0] || twsVal > tws[tws.length - 1]) return null;
  let ci0 = 0;
  for (let i = 0; i < tws.length - 1; i++) {
    if (tws[i] <= twsVal && twsVal <= tws[i + 1]) { ci0 = i; break; }
  }
  const ci1 = tws[ci0] === twsVal ? ci0 : ci0 + 1;
  const twsFrac = ci0 === ci1 ? 0 : (twsVal - tws[ci0]) / (tws[ci1] - tws[ci0]);

  const v00 = speeds[ri0][ci0];
  const v01 = speeds[ri0][ci1];
  const v10 = speeds[ri1][ci0];
  const v11 = speeds[ri1][ci1];
  const top = v00 + (v01 - v00) * twsFrac;
  const bot = v10 + (v11 - v10) * twsFrac;
  return top + (bot - top) * twaFrac;
}
