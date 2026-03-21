"use client";

import { useRouter } from "next/navigation";
import { Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { TraceSummary } from "@/lib/types";

interface TraceListProps {
  traces: TraceSummary[];
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}`;
  return `${m}min`;
}

export default function TraceList({ traces }: TraceListProps) {
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
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
                {format(new Date(trace.createdAt), "d MMM yyyy", {
                  locale: fr,
                })}
              </span>
              {trace.distanceNm && (
                <span>{trace.distanceNm.toFixed(1)} NM</span>
              )}
              {trace.durationSeconds && (
                <span>{formatDuration(trace.durationSeconds)}</span>
              )}
              {trace.avgSpeedKn && (
                <span>{trace.avgSpeedKn.toFixed(1)} kn moy.</span>
              )}
            </div>
          </div>
          <div className="trace-list-item-actions">
            <span className="trace-badge">{trace.format}</span>
            <button
              onClick={(e) => handleDelete(trace.id, e)}
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
