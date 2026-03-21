import { prisma } from "@/lib/db";
import FileUpload from "@/components/Upload/FileUpload";
import TraceList from "@/components/TraceList/TraceList";
import type { TraceSummary } from "@/lib/types";

export default async function HomePage() {
  let traces: TraceSummary[] = [];
  let dbError = false;

  try {
    const results = await prisma.trace.findMany({
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
    traces = results.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
    }));
  } catch {
    dbError = true;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {dbError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Impossible de se connecter à la base de données. Vérifiez votre
          connexion réseau et la variable DATABASE_URL.
        </div>
      )}

      <section>
        <h2 className="text-lg font-bold mb-3">Importer une trace</h2>
        <FileUpload />
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">Mes traces</h2>
        <TraceList traces={traces} />
      </section>
    </div>
  );
}
