import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { candidateLinks } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { authedSession } from "@/lib/portal/crud-helpers";

const VALID_KINDS = [
  "linkedin", "github", "portfolio", "website", "behance", "dribbble",
  "figma", "instagram", "twitter", "youtube", "medium", "artstation",
  "tiktok", "twitch", "stackoverflow", "kaggle", "huggingface",
  "spotify", "soundcloud", "vimeo", "custom",
];

export async function GET() {
  const session = await authedSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const list = await db
    .select()
    .from(candidateLinks)
    .where(eq(candidateLinks.candidateId, session.candidateId))
    .orderBy(asc(candidateLinks.sortOrder));
  return NextResponse.json({ links: list });
}

export async function POST(request: NextRequest) {
  const session = await authedSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await request.json();
  const kind = String(body.kind || "").toLowerCase().trim();
  const url = String(body.url || "").trim();
  const label = body.label ? String(body.label).trim().slice(0, 60) : null;

  if (!url) return NextResponse.json({ error: "URL obrigatória" }, { status: 400 });
  if (!VALID_KINDS.includes(kind)) {
    return NextResponse.json({ error: "Tipo de link inválido" }, { status: 400 });
  }
  // valida URL básica
  if (!/^https?:\/\/.+\..+/.test(url)) {
    return NextResponse.json(
      { error: "URL precisa começar com http:// ou https://" },
      { status: 400 }
    );
  }
  if (kind === "custom" && !label) {
    return NextResponse.json({ error: "Link customizado precisa de um nome" }, { status: 400 });
  }

  const id = nanoid();
  await db.insert(candidateLinks).values({
    id,
    candidateId: session.candidateId,
    kind,
    url,
    label,
    sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
  });
  return NextResponse.json({ id });
}
