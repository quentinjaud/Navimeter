"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { usePanneau } from "@/lib/contexts/PanneauContext";

interface PortAttache {
  portAttacheLat: number | null;
  portAttacheLon: number | null;
  portAttacheNom: string | null;
}

function formaterCoord(val: number | null): string {
  if (val == null) return "—";
  const abs = Math.abs(val);
  const deg = Math.floor(abs);
  const min = ((abs - deg) * 60).toFixed(3);
  return `${deg}°${min}'`;
}

export default function ContenuPreferences() {
  const { modePortAttache, setModePortAttache } = usePanneau();
  const [port, setPort] = useState<PortAttache>({
    portAttacheLat: null,
    portAttacheLon: null,
    portAttacheNom: null,
  });
  const [nom, setNom] = useState("");
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch("/api/user/preferences")
      .then((r) => r.json())
      .then((data) => {
        setPort(data);
        setNom(data.portAttacheNom ?? "");
      })
      .finally(() => setChargement(false));
  }, []);

  const sauvegarderNom = useCallback(async () => {
    const nomNettoye = nom.trim();
    await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portAttacheNom: nomNettoye }),
    });
  }, [nom]);

  const activerModeClic = useCallback(() => {
    setModePortAttache(true);
  }, [setModePortAttache]);

  if (chargement) {
    return <div className="panneau-chargement">Chargement...</div>;
  }

  return (
    <div className="contenu-preferences">
      <h4 className="preferences-section-titre">Mon port d&apos;attache</h4>

      <div className="preferences-champ">
        <label className="preferences-label">Nom</label>
        <input
          type="text"
          className="preferences-input"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          onBlur={sauvegarderNom}
          placeholder="La Rochelle, Port des Minimes..."
        />
      </div>

      {port.portAttacheLat != null && port.portAttacheLon != null && (
        <div className="preferences-coords">
          <span>{formaterCoord(port.portAttacheLat)} {port.portAttacheLat >= 0 ? "N" : "S"}</span>
          <span>{formaterCoord(port.portAttacheLon)} {port.portAttacheLon >= 0 ? "E" : "W"}</span>
        </div>
      )}

      <button
        className={`preferences-btn-carte${modePortAttache ? " actif" : ""}`}
        onClick={activerModeClic}
      >
        <MapPin size={16} />
        {modePortAttache ? "Cliquez sur la carte..." : "Placer sur la carte"}
      </button>
    </div>
  );
}
