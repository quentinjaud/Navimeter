export const dynamic = "force-dynamic";

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
    <div className="page-container">
      {dbError && (
        <div className="error-banner">
          Impossible de se connecter à la base de données. Vérifiez votre
          connexion réseau et la variable DATABASE_URL.
        </div>
      )}

      <section>
        <h2 className="section-title">Importer une trace</h2>
        <FileUpload />
      </section>

      <section>
        <h2 className="section-title">Mes traces</h2>
        <TraceList traces={traces} />
      </section>
    </div>
  );
}
