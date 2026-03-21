import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseTraceFile } from "@/lib/parsers";
import { computeStats } from "@/lib/geo/stats";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    const content = await file.text();
    const { trace: parsed, source, format } = parseTraceFile(
      file.name,
      content
    );

    if (parsed.points.length === 0) {
      return NextResponse.json(
        { error: "Aucun point trouvé dans le fichier" },
        { status: 400 }
      );
    }

    const stats = computeStats(parsed.points);

    const trace = await prisma.trace.create({
      data: {
        name: parsed.name,
        filename: file.name,
        format,
        source,
        distanceNm: stats.distanceNm,
        durationSeconds: stats.durationSeconds,
        avgSpeedKn: stats.avgSpeedKn,
        maxSpeedKn: stats.maxSpeedKn,
        points: {
          create: parsed.points.map((p, i) => ({
            lat: p.lat,
            lon: p.lon,
            timestamp: p.timestamp,
            speedKn: p.speedKn,
            headingDeg: p.headingDeg,
            elevationM: p.elevationM,
            pointIndex: i,
          })),
        },
      },
    });

    return NextResponse.json(trace, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de l'import";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const traces = await prisma.trace.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      filename: true,
      format: true,
      source: true,
      createdAt: true,
      distanceNm: true,
      durationSeconds: true,
      avgSpeedKn: true,
      maxSpeedKn: true,
    },
  });

  return NextResponse.json(traces);
}
