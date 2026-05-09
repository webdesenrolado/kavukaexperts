import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { candidates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail, appBaseUrl } from "@/lib/email/transport";
import { recoveryEmail } from "@/lib/email/templates";

const TOKEN_TTL_HOURS = 2;

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
  }
  const emailNorm = String(email).toLowerCase().trim();

  // Sempre responde 200 (não revelar se o email existe — proteção contra enumeração)
  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.email, emailNorm),
  });

  if (candidate) {
    const token = nanoid(48);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

    await db
      .update(candidates)
      .set({ resetToken: token, resetTokenExpiresAt: expiresAt })
      .where(eq(candidates.id, candidate.id));

    const resetUrl = `${appBaseUrl()}/portal/redefinir/${token}`;
    const tpl = recoveryEmail({
      name: candidate.name,
      resetUrl,
      expiresInHours: TOKEN_TTL_HOURS,
    });
    await sendEmail({ to: candidate.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
  }

  return NextResponse.json({ ok: true });
}
