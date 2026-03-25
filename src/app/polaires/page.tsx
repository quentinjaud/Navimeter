export const dynamic = "force-dynamic";

import { obtenirSession } from "@/lib/session";
import { redirect } from "next/navigation";
import EditeurPolaires from "@/components/Polaires/EditeurPolaires";

export default async function PagePolaires() {
  const session = await obtenirSession();
  if (!session) {
    redirect("/");
  }

  return <EditeurPolaires />;
}
