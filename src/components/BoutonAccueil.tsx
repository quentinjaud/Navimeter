"use client";

import Link from "next/link";

export function BoutonAccueil() {
  return (
    <Link href="/journal" className="bouton-accueil" title="Mes journaux de bord">
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="sq-accueil" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#43728B" />
            <stop offset="20%" stopColor="#43728B" />
            <stop offset="50%" stopColor="#D32F2F" />
            <stop offset="80%" stopColor="#F6BC00" />
            <stop offset="100%" stopColor="#F6BC00" />
          </linearGradient>
        </defs>
        <path
          d="M7 3.5c5-2 7 2.5 3 4C1.5 10 2 15 5 16c5 2 9-10 14-7s.5 13.5-4 12c-5-2.5.5-11 6-2"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 3.5c5-2 7 2.5 3 4C1.5 10 2 15 5 16c5 2 9-10 14-7s.5 13.5-4 12c-5-2.5.5-11 6-2"
          stroke="url(#sq-accueil)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
