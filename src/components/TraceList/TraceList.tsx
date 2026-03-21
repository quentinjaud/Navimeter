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
      <div className="text-center text-gray-medium py-8">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>Aucune trace importée</p>
        <p className="text-sm">Importez un fichier GPX ou KML pour commencer</p>
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
    <div className="space-y-2">
      {traces.map((trace) => (
        <div
          key={trace.id}
          onClick={() => router.push(`/trace/${trace.id}`)}
          className="bg-white rounded-lg border border-gray-light p-4 cursor-pointer hover:border-accent-blue transition-colors flex items-center justify-between gap-4"
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-bold truncate">{trace.name}</h3>
            <div className="flex gap-4 text-sm text-gray-medium mt-1">
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
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase bg-gray-light text-gray-medium px-2 py-1 rounded">
              {trace.format}
            </span>
            <button
              onClick={(e) => handleDelete(trace.id, e)}
              className="p-2 text-gray-medium hover:text-red-500 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
