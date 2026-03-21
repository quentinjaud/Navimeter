import type { ParsedPoint, TraceStats } from "../types";
import { haversineNm, totalDistanceNm } from "./distance";
import { speedKn } from "./speed";

export function computeStats(points: ParsedPoint[]): TraceStats {
  if (points.length < 2) {
    return { distanceNm: 0, durationSeconds: 0, avgSpeedKn: 0, maxSpeedKn: 0 };
  }

  const distanceNm = totalDistanceNm(points);

  const timestamps = points
    .map((p) => p.timestamp)
    .filter((t): t is Date => t !== null);

  let durationSeconds = 0;
  if (timestamps.length >= 2) {
    const first = timestamps[0].getTime();
    const last = timestamps[timestamps.length - 1].getTime();
    durationSeconds = Math.round((last - first) / 1000);
  }

  let maxSpeedKn = 0;
  for (let i = 1; i < points.length; i++) {
    const segSpeed = points[i].speedKn;
    if (segSpeed !== null && segSpeed > maxSpeedKn) {
      maxSpeedKn = segSpeed;
    } else if (segSpeed === null && points[i].timestamp && points[i - 1].timestamp) {
      const dist = haversineNm(
        points[i - 1].lat,
        points[i - 1].lon,
        points[i].lat,
        points[i].lon
      );
      const dt =
        (points[i].timestamp!.getTime() - points[i - 1].timestamp!.getTime()) /
        1000;
      const s = speedKn(dist, dt);
      if (s > maxSpeedKn) maxSpeedKn = s;
    }
  }

  const avgSpeedKn =
    durationSeconds > 0 ? (distanceNm / durationSeconds) * 3600 : 0;

  return {
    distanceNm: Math.round(distanceNm * 100) / 100,
    durationSeconds,
    avgSpeedKn: Math.round(avgSpeedKn * 10) / 10,
    maxSpeedKn: Math.round(maxSpeedKn * 10) / 10,
  };
}
