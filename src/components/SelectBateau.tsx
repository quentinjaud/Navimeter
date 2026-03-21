"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResumeBateau } from "@/lib/types";

interface Props {
  traceId: string;
  bateauId: string | null;
  bateaux: ResumeBateau[];
  apiBase?: string; // "/api/traces" par defaut, "/api/admin/traces" pour admin
}

export default function SelectBateau({
  traceId,
  bateauId,
  bateaux,
  apiBase = "/api/traces",
}: Props) {
  const routeur = useRouter();
  const [valeur, setValeur] = useState(bateauId || "");
  const [chargement, setChargement] = useState(false);

  async function gererChangement(nouveauBateauId: string) {
    setValeur(nouveauBateauId);
    setChargement(true);

    try {
      const reponse = await fetch(`${apiBase}/${traceId}/bateau`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bateauId: nouveauBateauId || null }),
      });

      if (!reponse.ok) {
        // Revenir a la valeur precedente
        setValeur(bateauId || "");
      } else {
        routeur.refresh();
      }
    } catch {
      setValeur(bateauId || "");
    } finally {
      setChargement(false);
    }
  }

  return (
    <select
      className="select-bateau"
      value={valeur}
      onChange={(e) => gererChangement(e.target.value)}
      disabled={chargement}
      onClick={(e) => e.stopPropagation()}
    >
      <option value="">— Aucun bateau —</option>
      {bateaux.map((b) => (
        <option key={b.id} value={b.id}>
          {b.nom}
        </option>
      ))}
    </select>
  );
}
