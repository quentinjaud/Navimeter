import type { PointCourbe } from './types';

export function catmullRomPath(pts: { x: number; y: number }[], tension = 0.5): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) {
    return `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)} L${pts[1].x.toFixed(1)},${pts[1].y.toFixed(1)}`;
  }

  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  const n = pts.length;

  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 >= n ? n - 1 : i + 2];

    const cp1x = p1.x + (p2.x - p0.x) / (6 / tension);
    const cp1y = p1.y + (p2.y - p0.y) / (6 / tension);
    const cp2x = p2.x - (p3.x - p1.x) / (6 / tension);
    const cp2y = p2.y - (p3.y - p1.y) / (6 / tension);

    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

export function coordPolaire(angleDeg: number, vitesse: number, echelle: number): { x: number; y: number } {
  const rad = angleDeg * Math.PI / 180;
  const r = vitesse * echelle;
  return { x: Math.sin(rad) * r, y: -Math.cos(rad) * r };
}

export function calculerVentApparent(twaDeg: number, tws: number, bs: number): { awa: number; aws: number } {
  const twaRad = twaDeg * Math.PI / 180;
  const awx = tws * Math.sin(twaRad);
  const awy = tws * Math.cos(twaRad) + bs;
  const aws = Math.sqrt(awx * awx + awy * awy);
  const awa = Math.atan2(awx, awy) * 180 / Math.PI;
  return { awa: Math.round(awa * 10) / 10, aws: Math.round(aws * 10) / 10 };
}

export function pasEchelle(max: number): number {
  if (max <= 5) return 1;
  if (max <= 12) return 2;
  return 5;
}

export function construirePointsCourbe(
  twa: number[],
  speeds: number[][],
  ci: number,
  tws: number,
  echelle: number,
): PointCourbe[] {
  const pts: PointCourbe[] = [];
  twa.forEach((angle, ri) => {
    const spd = speeds[ri][ci];
    if (spd <= 0) return;
    const { x, y } = coordPolaire(angle, spd, echelle);
    const { awa, aws } = calculerVentApparent(angle, tws, spd);
    pts.push({ x, y, twa: angle, bs: spd, awa, aws });
  });
  return pts;
}
