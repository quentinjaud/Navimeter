/** Conversion degrés → radians */
export function enRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Conversion radians → degrés */
export function enDegres(rad: number): number {
  return (rad * 180) / Math.PI;
}
