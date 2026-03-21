"use client";

import { useCallback, useRef, useState } from "react";

interface PropsGraphiqueRedimensionnable {
  children: React.ReactNode;
  hauteurInitiale?: number;
  hauteurMin?: number;
  hauteurMax?: number;
  onHauteurChange?: (hauteur: number) => void;
}

export default function GraphiqueRedimensionnable({
  children,
  hauteurInitiale = 200,
  hauteurMin = 100,
  hauteurMax = 500,
  onHauteurChange,
}: PropsGraphiqueRedimensionnable) {
  const [hauteur, setHauteur] = useState(hauteurInitiale);
  const enRedimensionnement = useRef(false);
  const yDepart = useRef(0);
  const hauteurDepart = useRef(hauteurInitiale);

  const debuterRedimensionnement = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      enRedimensionnement.current = true;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      yDepart.current = clientY;
      hauteurDepart.current = hauteur;

      const gererMouvement = (ev: MouseEvent | TouchEvent) => {
        if (!enRedimensionnement.current) return;
        const y = "touches" in ev ? ev.touches[0].clientY : ev.clientY;
        // Vers le haut = augmenter la hauteur
        const delta = yDepart.current - y;
        const nouvelleHauteur = Math.max(
          hauteurMin,
          Math.min(hauteurMax, hauteurDepart.current + delta)
        );
        setHauteur(nouvelleHauteur);
        onHauteurChange?.(nouvelleHauteur);
      };

      const terminerRedimensionnement = () => {
        enRedimensionnement.current = false;
        document.removeEventListener("mousemove", gererMouvement);
        document.removeEventListener("mouseup", terminerRedimensionnement);
        document.removeEventListener("touchmove", gererMouvement);
        document.removeEventListener("touchend", terminerRedimensionnement);
      };

      document.addEventListener("mousemove", gererMouvement);
      document.addEventListener("mouseup", terminerRedimensionnement);
      document.addEventListener("touchmove", gererMouvement);
      document.addEventListener("touchend", terminerRedimensionnement);
    },
    [hauteur, hauteurMin, hauteurMax, onHauteurChange]
  );

  return (
    <div style={{ height: hauteur }} className="graphique-resizable">
      <div
        className="graphique-resize-handle"
        onMouseDown={debuterRedimensionnement}
        onTouchStart={debuterRedimensionnement}
      >
        <div className="graphique-resize-bar" />
      </div>
      <div className="graphique-resizable-content">{children}</div>
    </div>
  );
}
