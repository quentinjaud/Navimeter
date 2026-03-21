import type { ParsedTrace } from "../types";
import { parseGpx } from "./gpx";
import { parseKml } from "./kml";

export function parseTraceFile(
  filename: string,
  content: string
): { trace: ParsedTrace; source: string; format: string } {
  const ext = filename.toLowerCase().split(".").pop();

  switch (ext) {
    case "gpx": {
      const result = parseGpx(content, filename);
      return { ...result, format: "gpx" };
    }
    case "kml": {
      const result = parseKml(content, filename);
      return { ...result, format: "kml" };
    }
    default:
      throw new Error(`Format non supporté : .${ext}. Utilisez .gpx ou .kml`);
  }
}
