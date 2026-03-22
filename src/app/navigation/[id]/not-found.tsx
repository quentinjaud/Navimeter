import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16 }}>
      <h1>Navigation introuvable</h1>
      <Link href="/journal">Retour au journal</Link>
    </div>
  );
}
