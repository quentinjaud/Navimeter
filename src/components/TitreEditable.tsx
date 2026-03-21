"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface PropsTitreEditable {
  traceId: string;
  nom: string;
}

export default function TitreEditable({ traceId, nom }: PropsTitreEditable) {
  const router = useRouter();
  const [enEdition, setEnEdition] = useState(false);
  const [valeur, setValeur] = useState(nom);
  const inputRef = useRef<HTMLInputElement>(null);

  const sauvegarder = useCallback(async () => {
    const nomNettoye = valeur.trim();
    if (!nomNettoye || nomNettoye === nom) {
      setValeur(nom);
      setEnEdition(false);
      return;
    }

    try {
      const reponse = await fetch(`/api/traces/${traceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nomNettoye }),
      });

      if (!reponse.ok) throw new Error();

      setEnEdition(false);
      router.refresh();
    } catch {
      setValeur(nom);
      setEnEdition(false);
    }
  }, [valeur, nom, traceId, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sauvegarder();
      } else if (e.key === "Escape") {
        setValeur(nom);
        setEnEdition(false);
      }
    },
    [sauvegarder, nom]
  );

  if (enEdition) {
    return (
      <input
        ref={inputRef}
        className="titre-editable-input"
        value={valeur}
        onChange={(e) => setValeur(e.target.value)}
        onBlur={sauvegarder}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    );
  }

  return (
    <h1
      className="nettoyage-titre titre-editable"
      onClick={() => {
        setEnEdition(true);
        setTimeout(() => inputRef.current?.select(), 0);
      }}
      title="Cliquer pour renommer"
    >
      {nom}
    </h1>
  );
}
