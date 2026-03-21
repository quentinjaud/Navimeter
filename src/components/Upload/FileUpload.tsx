"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

/** Taille maximale autorisée pour un fichier (50 Mo) */
const TAILLE_MAX_OCTETS = 50 * 1024 * 1024;

export default function FileUpload() {
  const router = useRouter();
  const [enSurvol, setEnSurvol] = useState(false);
  const [enImport, setEnImport] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const traiterFichier = useCallback(
    async (fichier: File) => {
      setErreur(null);

      // Validation taille côté client
      if (fichier.size > TAILLE_MAX_OCTETS) {
        setErreur("Fichier trop volumineux (max 50 Mo)");
        return;
      }

      setEnImport(true);

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
        router.push(`/trace/${trace.id}`);
      } catch (err) {
        setErreur(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setEnImport(false);
      }
    },
    [router]
  );

  const gererDepot = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setEnSurvol(false);
      const fichier = e.dataTransfer.files[0];
      if (fichier) traiterFichier(fichier);
    },
    [traiterFichier]
  );

  const gererSelection = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fichier = e.target.files?.[0];
      if (fichier) traiterFichier(fichier);
    },
    [traiterFichier]
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
        {enImport ? (
          <p className="upload-text-secondary">Import en cours...</p>
        ) : (
          <>
            <p className="upload-text-primary">
              Glissez un fichier GPX ou KML ici
            </p>
            <p className="upload-text-secondary">
              ou cliquez pour sélectionner
            </p>
          </>
        )}
        <input
          type="file"
          accept=".gpx,.kml"
          onChange={gererSelection}
          style={{ display: "none" }}
          disabled={enImport}
        />
      </label>
      {erreur && <p className="upload-error">{erreur}</p>}
    </div>
  );
}
