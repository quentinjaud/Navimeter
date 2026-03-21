import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h2 className="text-2xl font-bold mb-2">Trace non trouvée</h2>
      <p className="text-gray-medium mb-4">
        Cette trace n&apos;existe pas ou a été supprimée.
      </p>
      <Link
        href="/"
        className="text-accent-blue hover:text-accent-yellow transition-colors font-bold"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
