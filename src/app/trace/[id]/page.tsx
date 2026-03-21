import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import TraceMapWrapper from "@/components/Map/TraceMapWrapper";
import StatsPanel from "@/components/Stats/StatsPanel";
import SpeedChart from "@/components/Stats/SpeedChart";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TraceDetailPage({ params }: PageProps) {
  const { id } = await params;

  const trace = await prisma.trace.findUnique({
    where: { id },
    include: {
      points: {
        orderBy: { pointIndex: "asc" },
      },
    },
  });

  if (!trace) notFound();

  const serializedPoints = trace.points.map((p) => ({
    lat: p.lat,
    lon: p.lon,
    timestamp: p.timestamp?.toISOString() ?? null,
    speedKn: p.speedKn,
    headingDeg: p.headingDeg,
    elevationM: p.elevationM,
    pointIndex: p.pointIndex,
  }));

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-accent-blue hover:text-accent-yellow transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">{trace.name}</h1>
        <span className="text-xs uppercase bg-gray-light text-gray-medium px-2 py-1 rounded">
          {trace.format}
        </span>
        {trace.source !== "unknown" && (
          <span className="text-xs bg-accent-blue/10 text-accent-blue px-2 py-1 rounded">
            {trace.source}
          </span>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-5 lg:gap-4">
        <div className="lg:col-span-3 h-[400px] lg:h-[600px] mb-4 lg:mb-0">
          <TraceMapWrapper
            points={serializedPoints}
            maxSpeed={trace.maxSpeedKn ?? 10}
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <StatsPanel
            distanceNm={trace.distanceNm}
            durationSeconds={trace.durationSeconds}
            avgSpeedKn={trace.avgSpeedKn}
            maxSpeedKn={trace.maxSpeedKn}
          />
          <SpeedChart points={serializedPoints} />
        </div>
      </div>
    </div>
  );
}
