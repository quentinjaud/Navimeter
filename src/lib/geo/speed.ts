export function speedKn(distanceNm: number, timeDiffSeconds: number): number {
  if (timeDiffSeconds <= 0) return 0;
  return (distanceNm / timeDiffSeconds) * 3600;
}
