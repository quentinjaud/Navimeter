"use client";

import { useRouter } from "next/navigation";
import { Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ResumeTrace, ResumeBateau } from "@/lib/types";
import { formaterDuree } from "@/lib/utilitaires";
import SelectBateau from "@/components/SelectBateau";

interface PropsListeTraces {
  traces: ResumeTrace[];
  bateaux?: ResumeBateau[];
}

export default function TraceList({ traces, bateaux = [] }: PropsListeTraces) {
  const router = useRouter();

  if (traces.length === 0) {
    return (
      <div className="trace-list-empty">
        <FileText className="trace-list-empty-icon" />
        <p>Aucune trace importée</p>
        <p style={{ fontSize: "0.875rem" }}>
          Importez un fichier GPX ou KML pour commencer
        </p>
      </div>
    );
  }

  const gererSuppression = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Supprimer cette trace ?")) return;

    await fetch(`/api/traces/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="trace-list">
      {traces.map((trace) => (
        <div
          key={trace.id}
          onClick={() => router.push(`/trace/${trace.id}`)}
          className="trace-list-item"
        >
          <div className="trace-list-item-content">
            <h3 className="trace-list-item-name">{trace.name}</h3>
            <div className="trace-list-item-meta">
              <span>
                {trace.startedAt
                  ? format(new Date(trace.startedAt), "d MMM yyyy 'à' HH'h'mm", {
                      locale: fr,
                    })
                  : format(new Date(trace.createdAt), "d MMM yyyy", {
                      locale: fr,
                    })}
              </span>
              {trace.distanceNm && (
                <span>{trace.distanceNm.toFixed(1)} NM</span>
              )}
              {trace.durationSeconds && (
                <span>{formaterDuree(trace.durationSeconds)}</span>
              )}
              {trace.avgSpeedKn && (
                <span>{trace.avgSpeedKn.toFixed(1)} kn moy.</span>
              )}
            </div>
          </div>
          <div className="trace-list-item-actions">
            {bateaux.length > 0 && (
              <SelectBateau
                traceId={trace.id}
                bateauId={trace.bateauId}
                bateaux={bateaux}
              />
            )}
            <span className="trace-badge">{trace.format}</span>
            <button
              onClick={(e) => gererSuppression(trace.id, e)}
              className="trace-list-delete-btn"
              title="Supprimer"
            >
              <Trash2 style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
