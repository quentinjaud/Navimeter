"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

/** Taille maximale autorisée pour un fichier (50 Mo) */
const TAILLE_MAX_OCTETS = 50 * 1024 * 1024;

interface ErreurFichier {
  fichier: string;
  message: string;
}

interface Progression {
  total: number;
  courant: number;
  erreurs: ErreurFichier[];
  reussites: number;
  derniereTraceId: string | null;
}

export default function FileUpload() {
  const router = useRouter();
  const [enSurvol, setEnSurvol] = useState(false);
  const [progression, setProgression] = useState<Progression | null>(null);
  const [erreurs, setErreurs] = useState<ErreurFichier[]>([]);

  const enImport = progression !== null;

  const traiterFichiers = useCallback(
    async (fichiers: File[]) => {
      if (fichiers.length === 0) return;

      setErreurs([]);
      const prog: Progression = {
        total: fichiers.length,
        courant: 0,
        erreurs: [],
        reussites: 0,
        derniereTraceId: null,
      };
      setProgression({ ...prog });

      for (const fichier of fichiers) {
        prog.courant++;
        setProgression({ ...prog });

        // Validation taille côté client
        if (fichier.size > TAILLE_MAX_OCTETS) {
          prog.erreurs.push({
            fichier: fichier.name,
            message: "Fichier trop volumineux (max 50 Mo)",
          });
          continue;
        }

        try {
          const donnees = new FormData();
          donnees.append("file", fichier);

          const reponse = await fetch("/api/traces", {
            method: "POST",
            body: donnees,
          });

          if (!reponse.ok) {
            const corps = await reponse.json();
            throw new Error(corps.error || "Erreur lors de l'import");
          }

          const trace = await reponse.json();
          prog.reussites++;
          prog.derniereTraceId = trace.id;
        } catch (err) {
          prog.erreurs.push({
            fichier: fichier.name,
            message: err instanceof Error ? err.message : "Erreur inconnue",
          });
        }
      }

      setProgression(null);

      if (prog.erreurs.length > 0) {
        setErreurs(prog.erreurs);
      }

      // Navigation : 1 seul fichier réussi → page détail, sinon rafraîchir la liste
      if (prog.reussites === 1 && prog.derniereTraceId) {
        router.push(`/trace/${prog.derniereTraceId}`);
      } else if (prog.reussites > 0) {
        router.refresh();
      }
    },
    [router]
  );

  const gererDepot = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setEnSurvol(false);
      const fichiers = Array.from(e.dataTransfer.files);
      if (fichiers.length > 0) traiterFichiers(fichiers);
    },
    [traiterFichiers]
  );

  const gererSelection = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fichiers = Array.from(e.target.files ?? []);
      if (fichiers.length > 0) traiterFichiers(fichiers);
    },
    [traiterFichiers]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setEnSurvol(true);
      }}
      onDragLeave={() => setEnSurvol(false)}
      onDrop={gererDepot}
      className={`upload-zone${enSurvol ? " dragging" : ""}`}
    >
      <label className="upload-label">
        <Upload className={`upload-icon${enImport ? " uploading" : ""}`} />
        {enImport && progression ? (
          <p className="upload-text-secondary">
            Import {progression.courant}/{progression.total}...
          </p>
        ) : (
          <>
            <p className="upload-text-primary">
              Glissez vos fichiers GPX ou KML ici
            </p>
            <p className="upload-text-secondary">
              ou cliquez pour sélectionner (un ou plusieurs)
            </p>
          </>
        )}
        <input
          type="file"
          accept=".gpx,.kml"
          multiple
          onChange={gererSelection}
          style={{ display: "none" }}
          disabled={enImport}
        />
      </label>
      {erreurs.length > 0 && (
        <div className="upload-errors">
          {erreurs.map((e, i) => (
            <p key={i} className="upload-error">
              <strong>{e.fichier}</strong> : {e.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
