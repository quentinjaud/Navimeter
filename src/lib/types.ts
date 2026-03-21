export interface ParsedPoint {
  lat: number;
  lon: number;
  timestamp: Date | null;
  speedKn: number | null;
  headingDeg: number | null;
  elevationM: number | null;
}

export interface ParsedTrace {
  name: string;
  points: ParsedPoint[];
}

export interface TraceStats {
  distanceNm: number;
  durationSeconds: number;
  avgSpeedKn: number;
  maxSpeedKn: number;
}

export interface TraceWithPoints {
  id: string;
  name: string;
  filename: string;
  format: string;
  source: string;
  createdAt: string;
  distanceNm: number | null;
  durationSeconds: number | null;
  avgSpeedKn: number | null;
  maxSpeedKn: number | null;
  points: {
    lat: number;
    lon: number;
    timestamp: string | null;
    speedKn: number | null;
    headingDeg: number | null;
    elevationM: number | null;
    pointIndex: number;
  }[];
}

export interface TraceSummary {
  id: string;
  name: string;
  filename: string;
  format: string;
  source: string;
  createdAt: string;
  distanceNm: number | null;
  durationSeconds: number | null;
  avgSpeedKn: number | null;
  maxSpeedKn: number | null;
}
