"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

export default function FileUpload() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/traces", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erreur lors de l'import");
        }

        const trace = await res.json();
        router.push(`/trace/${trace.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsUploading(false);
      }
    },
    [router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`upload-zone${isDragging ? " dragging" : ""}`}
    >
      <label className="upload-label">
        <Upload className={`upload-icon${isUploading ? " uploading" : ""}`} />
        {isUploading ? (
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
          onChange={handleChange}
          style={{ display: "none" }}
          disabled={isUploading}
        />
      </label>
      {error && <p className="upload-error">{error}</p>}
    </div>
  );
}
