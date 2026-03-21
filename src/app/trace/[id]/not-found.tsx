import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <h2 className="not-found-title">Trace non trouvée</h2>
      <p className="not-found-text">
        Cette trace n&apos;existe pas ou a été supprimée.
      </p>
      <Link href="/" className="not-found-link">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
