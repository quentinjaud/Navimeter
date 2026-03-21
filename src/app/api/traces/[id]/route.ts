import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { journalErreur } from "@/lib/journal";

export async function GET(
  _requete: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const trace = await prisma.trace.findUnique({
    where: { id },
    include: {
      points: {
        orderBy: { pointIndex: "asc" },
      },
    },
  });

  if (!trace) {
    return NextResponse.json({ error: "Trace non trouvée" }, { status: 404 });
  }

  return NextResponse.json(trace);
}

export async function DELETE(
  _requete: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.trace.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (erreur) {
    journalErreur("DELETE /api/traces/[id]", erreur);
    return NextResponse.json({ error: "Trace non trouvée" }, { status: 404 });
  }
}
